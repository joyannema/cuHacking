"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CATEGORY_LABELS, SEED_NOTES, TRANSCRIPT_SAMPLE, generateTitle, seededRand } from "@/lib/data";
import type { CategoryMeta, CategorySlug, JournalElement, JournalPage, Note, Profile, Screen } from "@/lib/types";
import SigninScreen from "./screens/SigninScreen";
import StreamScreen from "./screens/StreamScreen";
import CabinetScreen from "./screens/CabinetScreen";
import CategoryScreen from "./screens/CategoryScreen";
import NoteScreen from "./screens/NoteScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AccountScreen from "./screens/AccountScreen";
import TodosScreen from "./screens/TodosScreen";
import JournalScreen from "./screens/JournalScreen";
import TabBar from "./TabBar";
import CaptureOverlay from "./CaptureOverlay";

const CATEGORY_SLUGS = Object.keys(CATEGORY_LABELS) as CategorySlug[];
const TAB_SCREENS = new Set<Screen>(["stream", "todos", "journal", "settings"]);

interface JournalDragSession {
  pageIdx: number;
  elId: number;
  mode: "move" | "resize" | "rotate";
  moved: boolean;
  startX: number;
  startY: number;
  startEl: { x: number; y: number; w: number; h: number };
  centerX: number;
  centerY: number;
}

interface TrayDragSession {
  kind: "sticker" | "text" | "photo" | "entry";
  stickerKind?: string;
}

export default function SynapseApp() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState(false);
  const [voiceAppendMode, setVoiceAppendMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategorySlug | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [noteOrigin, setNoteOrigin] = useState<Screen | null>(null);

  const [profile, setProfile] = useState<Profile>({ name: "alex rivera", username: "alexrivera", email: "alex@synapse.app", bio: "" });
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);

  const [todosEditMode, setTodosEditMode] = useState(false);
  const [selectedTodoIds, setSelectedTodoIds] = useState<number[]>([]);

  const [journalPageIndex, setJournalPageIndex] = useState(-1);
  const [journalPages, setJournalPages] = useState<JournalPage[]>([{ elements: [] }, { elements: [] }]);
  const [journalEntriesOpen, setJournalEntriesOpen] = useState(false);
  const [journalSelectedId, setJournalSelectedId] = useState<number | null>(null);
  const [journalDragGhost, setJournalDragGhost] = useState<{ x: number; y: number; kind: string; stickerKind?: string } | null>(null);
  const [journalPendingPos, setJournalPendingPos] = useState<{ pageIdx: number; x: number; y: number } | null>(null);
  const [journalTitle, setJournalTitle] = useState("my bullet journal");

  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const journalDragRef = useRef<JournalDragSession | null>(null);
  const trayDragRef = useRef<TrayDragSession | null>(null);
  const journalCanvasElRef = useRef<HTMLDivElement | null>(null);
  const journalFileInputElRef = useRef<HTMLInputElement | null>(null);
  const journalPageIndexRef = useRef(journalPageIndex);
  journalPageIndexRef.current = journalPageIndex;

  useEffect(() => {
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const addJournalElement = (pageIdx: number, partial: Partial<JournalElement> & Pick<JournalElement, "type">) => {
    const id = Date.now() + Math.random();
    const jitter = seededRand(id * 7, -12, 12);
    const el: JournalElement = {
      id,
      x: 40 + jitter,
      y: 40 + jitter,
      w: 150,
      h: 110,
      rot: seededRand(id * 3, -6, 6),
      ...partial,
    };
    setJournalPages((prev) => prev.map((p, i) => (i === pageIdx ? { elements: [...p.elements, el] } : p)));
    setJournalEntriesOpen(false);
    setJournalSelectedId(id);
  };

  const finishTrayDrop = (e: PointerEvent) => {
    const drag = trayDragRef.current;
    if (!drag || !journalCanvasElRef.current) return;
    const pageIdx = Math.max(journalPageIndexRef.current, 0);
    const rect = journalCanvasElRef.current.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    if (drag.kind === "sticker") {
      addJournalElement(pageIdx, { type: "sticker", stickerKind: drag.stickerKind, x: localX - 28, y: localY - 28, w: 56, h: 56 });
    } else if (drag.kind === "text") {
      addJournalElement(pageIdx, { type: "text", text: "write something…", x: localX - 75, y: localY - 30, w: 150, h: 60 });
    } else if (drag.kind === "photo") {
      setJournalPendingPos({ pageIdx, x: localX - 70, y: localY - 70 });
      journalFileInputElRef.current?.click();
    } else if (drag.kind === "entry") {
      setJournalPendingPos({ pageIdx, x: localX - 75, y: localY - 54 });
      setJournalEntriesOpen(true);
    }
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (trayDragRef.current) {
        setJournalDragGhost({ ...trayDragRef.current, x: e.clientX, y: e.clientY });
        return;
      }
      const drag = journalDragRef.current;
      if (!drag) return;
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (dist > 4) drag.moved = true;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const { pageIdx, elId, mode, startEl } = drag;
      setJournalPages((prev) =>
        prev.map((p, i) => {
          if (i !== pageIdx) return p;
          return {
            elements: p.elements.map((el) => {
              if (el.id !== elId) return el;
              if (mode === "move") return { ...el, x: startEl.x + dx, y: startEl.y + dy };
              if (mode === "resize") return { ...el, w: Math.max(50, startEl.w + dx), h: Math.max(40, startEl.h + dy) };
              if (mode === "rotate") {
                const angle = (Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX) * 180) / Math.PI;
                return { ...el, rot: Math.round(angle + 90) };
              }
              return el;
            }),
          };
        })
      );
    };

    const onUp = (e: PointerEvent) => {
      if (trayDragRef.current) {
        finishTrayDrop(e);
        trayDragRef.current = null;
        setJournalDragGhost(null);
        return;
      }
      const drag = journalDragRef.current;
      if (drag && !drag.moved && drag.mode === "move") {
        setJournalSelectedId((prev) => (prev === drag.elId ? null : drag.elId));
      }
      journalDragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = () => setScreen("stream");
  const signOut = () => setScreen("signin");
  const goStream = () => setScreen("stream");
  const goCabinet = () => setScreen("cabinet");
  const goSettings = () => setScreen("settings");
  const goTodos = () => setScreen("todos");
  const goJournal = () => setScreen("journal");
  const goAccount = () => {
    setDraftProfile({ ...profile });
    setAccountSaved(false);
    setScreen("account");
  };

  const openCategory = (slug: string) => {
    setActiveCategory(slug as CategorySlug);
    setScreen("category");
  };
  const openNote = (id: number) => {
    setNoteOrigin(screen);
    setActiveNoteId(id);
    setScreen("note");
  };
  const closeNote = () => setScreen(noteOrigin || "stream");
  const deleteNote = () => {
    setNotes((prev) => prev.filter((n) => n.id !== activeNoteId));
    setScreen(noteOrigin || "stream");
  };

  const regenerateTitle = () => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeNoteId) return n;
        const nextSeed = (n._titleSeed || 0) + 1;
        return { ...n, title: generateTitle(n.text, nextSeed), _titleSeed: nextSeed };
      })
    );
  };
  const onNoteTitleBlur = (text: string) => {
    const title = text.trim() || "untitled note";
    setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, title } : n)));
  };
  const onNoteBodyBlur = (text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, text } : n)));
  };
  const toggleNotePhoto = () => {
    setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, photo: !n.photo } : n)));
  };

  const openCapture = () => {
    setOverlayOpen(true);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    setVoiceAppendMode(false);
  };
  const openVoiceAppend = () => {
    setOverlayOpen(true);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    setVoiceAppendMode(true);
  };

  const closeCapture = () => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    setOverlayOpen(false);
    setIsRecording(false);
    setTranscript("");
    setVoiceAppendMode(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (typeTimer.current) clearInterval(typeTimer.current);
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setTranscript("");
    const words = TRANSCRIPT_SAMPLE.split(" ");
    let i = 0;
    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      i++;
      setTranscript(words.slice(0, i).join(" "));
      if (i >= words.length && typeTimer.current) clearInterval(typeTimer.current);
    }, 180);
  };

  const toggleAttachPhoto = () => setAttachedPhoto((v) => !v);

  const saveNote = () => {
    if (!transcript.trim()) return;
    if (typeTimer.current) clearInterval(typeTimer.current);

    if (voiceAppendMode) {
      const appended = transcript;
      setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, text: (n.text ? n.text + " " : "") + appended } : n)));
      setOverlayOpen(false);
      setIsRecording(false);
      setTranscript("");
      setAttachedPhoto(false);
      setVoiceAppendMode(false);
      return;
    }

    const id = Date.now();
    const newNote: Note = {
      id,
      category: "work_expenses",
      text: transcript,
      tags: attachedPhoto ? ["team lunch", "$45.50", "sansotei"] : ["team lunch"],
      time: "now",
      colorIdx: 0,
      organizing: true,
      title: generateTitle(transcript),
    };
    setOverlayOpen(false);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    setNotes((prev) => [newNote, ...prev]);
    setTimeout(() => {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, organizing: false } : n)));
    }, 1400);
  };

  // Account
  const onNameChange = (v: string) => setDraftProfile((p) => (p ? { ...p, name: v } : p));
  const onUsernameChange = (v: string) => setDraftProfile((p) => (p ? { ...p, username: v.replace(/\s/g, "") } : p));
  const onEmailChange = (v: string) => setDraftProfile((p) => (p ? { ...p, email: v } : p));
  const onBioChange = (v: string) => setDraftProfile((p) => (p ? { ...p, bio: v } : p));
  const saveAccount = () => {
    if (draftProfile) setProfile(draftProfile);
    setAccountSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setAccountSaved(false), 1800);
  };

  // Todos
  const toggleTodo = (id: number) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, todoDone: !n.todoDone } : n)));
  };
  const toggleTodosEditMode = () => {
    setTodosEditMode((v) => !v);
    setSelectedTodoIds([]);
  };
  const toggleTodoSelect = (id: number) => {
    setSelectedTodoIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const deleteSelectedTodos = () => {
    setNotes((prev) => prev.filter((n) => !selectedTodoIds.includes(n.id)));
    setSelectedTodoIds([]);
    setTodosEditMode(false);
  };
  const clearCompletedTodos = () => {
    setNotes((prev) => prev.filter((n) => !(n.isTodo && n.todoDone)));
  };

  // Journal
  const journalOpenBook = () => setJournalPageIndex(0);
  const journalGoCover = () => {
    setJournalPageIndex(-1);
    setJournalSelectedId(null);
  };
  const onJournalTitleBlur = (text: string) => setJournalTitle(text.trim() || "my bullet journal");
  const journalPrevPage = () => {
    setJournalPageIndex((prev) => (prev <= 0 ? -1 : prev - 1));
    setJournalSelectedId(null);
  };
  const journalNextPage = () => {
    setJournalPageIndex((prev) => Math.min(prev + 1, journalPages.length - 1));
    setJournalSelectedId(null);
  };
  const journalAddPage = () => {
    setJournalPages((prev) => [...prev, { elements: [] }]);
    setJournalPageIndex(journalPages.length);
  };
  const journalCloseSheets = () => {
    setJournalEntriesOpen(false);
    setJournalPendingPos(null);
  };

  const setJournalCanvasRef = (el: HTMLDivElement | null) => {
    journalCanvasElRef.current = el;
  };
  const setJournalFileInputRef = (el: HTMLInputElement | null) => {
    journalFileInputElRef.current = el;
  };

  const trayStickerDown = (kind: string) => {
    trayDragRef.current = { kind: "sticker", stickerKind: kind };
  };
  const trayTextDown = () => {
    trayDragRef.current = { kind: "text" };
  };
  const trayPhotoDown = () => {
    trayDragRef.current = { kind: "photo" };
  };
  const trayEntryDown = () => {
    trayDragRef.current = { kind: "entry" };
  };

  const journalPointerDown = (pageIdx: number, elId: number, mode: "move" | "resize" | "rotate", e: ReactPointerEvent) => {
    e.stopPropagation();
    const page = journalPages[pageIdx];
    const el = page?.elements.find((x) => x.id === elId);
    if (!el) return;
    let centerX = e.clientX;
    let centerY = e.clientY;
    if (mode === "rotate") {
      const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      if (rect) {
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }
    }
    journalDragRef.current = {
      pageIdx,
      elId,
      mode,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startEl: { x: el.x, y: el.y, w: el.w, h: el.h },
      centerX,
      centerY,
    };
  };

  const journalTextBlur = (id: number, text: string) => {
    setJournalPages((prev) => prev.map((p) => ({ elements: p.elements.map((el) => (el.id === id ? { ...el, text } : el)) })));
  };
  const deleteJournalElement = (id: number) => {
    setJournalPages((prev) => prev.map((p) => ({ elements: p.elements.filter((el) => el.id !== id) })));
    setJournalSelectedId(null);
  };
  const viewJournalElement = (entryId: number) => {
    setScreen("note");
    setActiveNoteId(entryId);
    setNoteOrigin("journal");
  };
  const journalPickEntry = (note: Note) => {
    const pos = journalPendingPos;
    const pageIdx = pos ? pos.pageIdx : Math.max(journalPageIndex, 0);
    addJournalElement(pageIdx, { type: "note", entryId: note.id, w: 150, h: 108, ...(pos ? { x: pos.x, y: pos.y } : {}) });
    setJournalPendingPos(null);
  };
  const journalAddPhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const pos = journalPendingPos;
      const pageIdx = pos ? pos.pageIdx : Math.max(journalPageIndex, 0);
      addJournalElement(pageIdx, { type: "photo", photoSrc: reader.result as string, w: 140, h: 140, ...(pos ? { x: pos.x, y: pos.y } : {}) });
      setJournalPendingPos(null);
    };
    reader.readAsDataURL(file);
  };

  // Derived data
  const counts: Record<string, number> = {};
  notes.forEach((n) => {
    counts[n.category] = (counts[n.category] || 0) + 1;
  });
  const allCategories: CategoryMeta[] = CATEGORY_SLUGS.map((slug, i) => ({
    slug,
    label: CATEGORY_LABELS[slug],
    count: counts[slug] || 0,
    colorIdx: i,
  }));

  const rankedCategories = [...allCategories].sort((a, b) => b.count - a.count);
  const topFolders = rankedCategories.slice(0, 6);
  const showViewAll = allCategories.length > 6;

  const q = searchQuery.trim().toLowerCase();
  const filteredCategories = allCategories.filter((c) => c.label.includes(q));
  const noteResults = q
    ? notes.filter(
        (n) =>
          n.text.toLowerCase().includes(q) ||
          (CATEGORY_LABELS[n.category] || n.category).toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const activeCatMeta = allCategories.find((c) => c.slug === activeCategory) || allCategories[0];
  const categoryNotes = notes.filter((n) => n.category === activeCategory);

  const rawActiveNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const todos = notes.filter((n) => n.isTodo);

  const isTabScreen = TAB_SCREENS.has(screen);

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        width: "100vw",
        overflow: "hidden",
        background: "oklch(0.93 0.015 75)",
      }}
    >
      {screen === "signin" && <SigninScreen onSignIn={signIn} />}

      {screen === "stream" && (
        <StreamScreen
          notes={notes}
          topFolders={topFolders}
          showViewAll={showViewAll}
          onOpenNote={openNote}
          onOpenCategory={openCategory}
          onGoCabinet={goCabinet}
        />
      )}

      {screen === "cabinet" && (
        <CabinetScreen
          categories={filteredCategories}
          noteResults={noteResults}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCategory={openCategory}
          onOpenNote={openNote}
          onGoStream={goStream}
        />
      )}

      {screen === "category" && activeCatMeta && (
        <CategoryScreen category={activeCatMeta} notes={categoryNotes} onOpenNote={openNote} onGoStream={goStream} />
      )}

      {screen === "note" && rawActiveNote && (
        <NoteScreen
          note={rawActiveNote}
          categoryLabel={CATEGORY_LABELS[rawActiveNote.category] || rawActiveNote.category}
          onClose={closeNote}
          onDelete={deleteNote}
          onRegenerateTitle={regenerateTitle}
          onTitleBlur={onNoteTitleBlur}
          onBodyBlur={onNoteBodyBlur}
          onTogglePhoto={toggleNotePhoto}
          onVoiceAppend={openVoiceAppend}
        />
      )}

      {screen === "settings" && <SettingsScreen profile={profile} onSignOut={signOut} onGoAccount={goAccount} />}

      {screen === "account" && draftProfile && (
        <AccountScreen
          draftProfile={draftProfile}
          accountSaved={accountSaved}
          onNameChange={onNameChange}
          onUsernameChange={onUsernameChange}
          onEmailChange={onEmailChange}
          onBioChange={onBioChange}
          onSave={saveAccount}
          onGoSettings={goSettings}
        />
      )}

      {screen === "todos" && (
        <TodosScreen
          todos={todos}
          todosEditMode={todosEditMode}
          selectedTodoIds={selectedTodoIds}
          onGoStream={goStream}
          onToggleEditMode={toggleTodosEditMode}
          onToggleTodo={toggleTodo}
          onToggleSelect={toggleTodoSelect}
          onDeleteSelected={deleteSelectedTodos}
          onClearCompleted={clearCompletedTodos}
        />
      )}

      {screen === "journal" && (
        <JournalScreen
          notes={notes}
          journalTitle={journalTitle}
          onJournalTitleBlur={onJournalTitleBlur}
          pageIndex={journalPageIndex}
          pages={journalPages}
          selectedId={journalSelectedId}
          entriesOpen={journalEntriesOpen}
          dragGhost={journalDragGhost}
          onOpenBook={journalOpenBook}
          onGoCover={journalGoCover}
          onPrevPage={journalPrevPage}
          onNextPage={journalNextPage}
          onAddPage={journalAddPage}
          onCloseSheets={journalCloseSheets}
          onPickEntry={journalPickEntry}
          onElementPointerDown={journalPointerDown}
          onViewElement={viewJournalElement}
          onDeleteElement={deleteJournalElement}
          onTextBlur={journalTextBlur}
          onTrayStickerDown={trayStickerDown}
          onTrayTextDown={trayTextDown}
          onTrayPhotoDown={trayPhotoDown}
          onTrayEntryDown={trayEntryDown}
          onAddPhotoFile={journalAddPhotoFile}
          setCanvasRef={setJournalCanvasRef}
          setFileInputRef={setJournalFileInputRef}
        />
      )}

      {isTabScreen && !overlayOpen && (
        <TabBar
          active={screen as "stream" | "todos" | "journal" | "settings"}
          onHome={goStream}
          onTodos={goTodos}
          onCapture={openCapture}
          onJournal={goJournal}
          onSettings={goSettings}
        />
      )}

      {overlayOpen && (
        <CaptureOverlay
          isRecording={isRecording}
          transcript={transcript}
          attachedPhoto={attachedPhoto}
          onClose={closeCapture}
          onToggleRecording={toggleRecording}
          onTranscriptChange={setTranscript}
          onToggleAttachPhoto={toggleAttachPhoto}
          onSave={saveNote}
        />
      )}
    </div>
  );
}
