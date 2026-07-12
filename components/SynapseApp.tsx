"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CATEGORY_LABELS, SEED_NOTES, colorIdxForCategory, generateTitle, seededRand } from "@/lib/data";
import type { CategoryMeta, CategorySlug, JournalElement, JournalPage, Note, Profile, Screen } from "@/lib/types";
import type { Mood } from "@/lib/moods";
import SigninScreen, { type AuthUser } from "./screens/SigninScreen";
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
const MOOD_FADE_IN_MS = 2000;
const MOOD_FADE_OUT_MS = 2000;
const RECENT_MOOD_SAMPLE_SIZE = 5;

// cancelToken lets a newer fade (e.g. fade-in starting right after a fade-out
// was requested) supersede an older one instead of both fighting over volume.
function fadeAudioVolume(audio: HTMLAudioElement, to: number, durationMs: number, cancelToken: { cancelled: boolean }, onDone?: () => void) {
  const from = audio.volume;
  const start = performance.now();
  const step = (now: number) => {
    if (cancelToken.cancelled) return;
    const t = Math.min(1, Math.max(0, (now - start) / durationMs));
    audio.volume = from + (to - from) * t;
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  requestAnimationFrame(step);
}

function averageMoodOfRecentNotes(notes: Note[]): Mood {
  const recentMoods = notes.slice(0, RECENT_MOOD_SAMPLE_SIZE).map((n) => n.mood).filter((m): m is Mood => !!m);
  if (recentMoods.length === 0) return "neutral";
  const counts = new Map<Mood, number>();
  recentMoods.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  let best = recentMoods[0];
  let bestCount = 0;
  counts.forEach((count, mood) => {
    if (count > bestCount) {
      bestCount = count;
      best = mood;
    }
  });
  return best;
}

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
  const [userId, setUserId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState(false);
  const [voiceAppendMode, setVoiceAppendMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategorySlug | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [noteOrigin, setNoteOrigin] = useState<Screen | null>(null);
  const [muted, setMuted] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("synapse:muted") === "1");

  const [profile, setProfile] = useState<Profile>({ name: "alex rivera", username: "alexrivera", email: "alex@synapse.app", bio: "" });
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const moodAudioRef = useRef<HTMLAudioElement | null>(null);
  const sharedTuneUrlRef = useRef<string | null>(null);
  const sharedTunePromiseRef = useRef<Promise<string | null> | null>(null);
  const moodFadeTokenRef = useRef<{ cancelled: boolean }>({ cancelled: false });

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

  const ensureSharedTune = (mood: Mood) => {
    if (sharedTuneUrlRef.current) return Promise.resolve(sharedTuneUrlRef.current);
    if (sharedTunePromiseRef.current) return sharedTunePromiseRef.current;
    const promise = fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        sharedTuneUrlRef.current = url;
        return url;
      })
      .catch((err) => {
        console.error("ensureSharedTune failed:", err);
        return null;
      });
    sharedTunePromiseRef.current = promise;
    return promise;
  };

  const fetchInsight = async (id: string) => {
    setInsightLoading(true);
    try {
      const response = await fetch(`/api/insight?userId=${encodeURIComponent(id)}`);
      const data = await response.json();
      setInsight(response.ok && data.insight ? data.insight : null);
    } catch (err) {
      console.error("fetchInsight failed:", err);
      setInsight(null);
    } finally {
      setInsightLoading(false);
    }
  };

  const signIn = (user: AuthUser) => {
    setProfile((prev) => ({ ...prev, username: user.username, name: user.username }));
    setUserId(user.userId);
    setNotes(SEED_NOTES);
    setScreen("stream");
    ensureSharedTune(averageMoodOfRecentNotes(SEED_NOTES));
    fetchInsight(user.userId);

    // Mock notes stay client-side only (not written to the db) — real saved
    // notes load in and sit alongside them, newest first.
    fetch(`/api/notes?userId=${encodeURIComponent(user.userId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load notes"))))
      .then((data) => setNotes([...(data.notes ?? []), ...SEED_NOTES]))
      .catch((err) => console.error("Failed to load notes:", err));
    playMoodTune();
  };
  const signOut = () => {
    moodFadeTokenRef.current.cancelled = true;
    moodAudioRef.current?.pause();
    moodAudioRef.current = null;
    sharedTuneUrlRef.current = null;
    sharedTunePromiseRef.current = null;
    setScreen("signin");
  };
  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem("synapse:muted", next ? "1" : "0");
      if (next) {
        moodFadeTokenRef.current.cancelled = true;
        moodAudioRef.current?.pause();
      } else if (!overlayOpen) {
        startMoodTunePlayback();
      }
      return next;
    });
  };
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
    stopMoodTune();
  };
  const openVoiceAppend = () => {
    setOverlayOpen(true);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    setVoiceAppendMode(true);
    stopMoodTune();
  };

  const closeCapture = () => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    setOverlayOpen(false);
    setIsRecording(false);
    setTranscript("");
    setVoiceAppendMode(false);
    playMoodTune();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      try {
        // Show processing state while ElevenLabs transcribes. Gemini
        // classification is deliberately NOT run here anymore — it now runs
        // after the note is saved (see saveNote), so the mic step only waits
        // on speech-to-text instead of speech-to-text + Gemini.
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Transcription failed");
        }

        const newBit = data.transcript ?? "";
        setTranscript((prev) => (prev ? [prev, newBit].filter(Boolean).join(" ") : newBit));
      } catch (err) {
        console.error(err);
      } finally {
        // Hide processing state
        setIsProcessing(false);

        stream.getTracks().forEach((track) => track.stop());
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const toggleAttachPhoto = () => setAttachedPhoto((v) => !v);

  const startMoodTunePlayback = async () => {
    try {
      const mood = averageMoodOfRecentNotes(notes);
      const url = await ensureSharedTune(mood);
      if (!url) return;
      let audio = moodAudioRef.current;
      if (!audio || audio.src !== url) {
        audio?.pause();
        audio = new Audio(url);
        audio.loop = true;
        moodAudioRef.current = audio;
      }
      audio.volume = 0;
      const token = { cancelled: false };
      moodFadeTokenRef.current.cancelled = true;
      moodFadeTokenRef.current = token;
      audio
        .play()
        .then(() => fadeAudioVolume(audio!, 1, MOOD_FADE_IN_MS, token))
        .catch(() => {});
    } catch (err) {
      console.error("playMoodTune failed:", err);
    }
  };

  const playMoodTune = async () => {
    if (muted) return;
    startMoodTunePlayback();
  };

  const stopMoodTune = () => {
    const audio = moodAudioRef.current;
    if (!audio) return;
    const token = { cancelled: false };
    moodFadeTokenRef.current.cancelled = true;
    moodFadeTokenRef.current = token;
    fadeAudioVolume(audio, 0, MOOD_FADE_OUT_MS, token, () => audio.pause());
  };

  const saveNote = async () => {
    if (!transcript.trim() || isProcessing) return;

    if (voiceAppendMode) {
      const appended = transcript;
      setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, text: (n.text ? n.text + " " : "") + appended } : n)));
      setOverlayOpen(false);
      setIsRecording(false);
      setTranscript("");
      setAttachedPhoto(false);
      setVoiceAppendMode(false);
      playMoodTune();
      return;
    }

    if (typeTimer.current) clearInterval(typeTimer.current);
    const tempId = Date.now();
    const rawTranscript = transcript;
    const existingCategories = Array.from(new Set(notes.map((n) => n.category)));

    // The note starts out as exactly what ElevenLabs heard — Gemini hasn't
    // looked at it yet. Classification now happens after the note exists
    // (the "notes step"), not during the mic step, so recording stays fast.
    const newNote: Note = {
      id: tempId,
      category: "random_thoughts" as Note["category"],
      title: generateTitle(rawTranscript),
      text: rawTranscript,
      tags: [],
      mood: undefined,
      time: "now",
      colorIdx: colorIdxForCategory("random_thoughts"),
      organizing: true,
      classifying: true,
      isTodo: false,
      todoText: rawTranscript,
    };

    // Update UI immediately
    setNotes((prev) => [newNote, ...prev]);

    setOverlayOpen(false);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    playMoodTune();

    // Clear the "organizing" shimmer on a fixed timer — this is a UI
    // animation, so it must not depend on Gemini or the DB save (either of
    // which could be slow or hang) ever resolving.
    setTimeout(() => {
      setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...n, organizing: false } : n)));
    }, 1400);

    // Classify with Gemini now that the note already exists. If this fails,
    // the note just stays filed under "random thoughts" with its raw transcript.
    let classified: any = null;

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: rawTranscript, existingCategories }),
      });

      if (response.ok) {
        classified = await response.json();
        setNotes((prev) =>
          prev.map((n) =>
            n.id === tempId
              ? {
                  ...n,
                  category: classified?.category ?? n.category,
                  title: classified?.title ?? n.title,
                  text: classified?.details ?? n.text,
                  tags: classified?.tags ?? n.tags,
                  mood: classified?.mood ?? n.mood,
                  isTodo: classified?.is_todo === true,
                  todoText: classified?.title ?? n.todoText,
                  colorIdx: colorIdxForCategory(classified?.category ?? n.category),
                  classifying: false,
                }
              : n
          )
        );
      }
    } catch (err) {
      console.error("Gemini classification failed:", err);
    } finally {
      // The spinner is purely about Gemini having responded (successfully or
      // not) — always clear it here so it can't get stuck.
      setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...n, classifying: false } : n)));
    }

    // Persist to MongoDB in the background, then swap the optimistic note
    // for the saved one (its id is derived from the note's real ObjectId).
    // If this fails, the optimistic note just stays as-is locally.
    if (userId) {
      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            category: classified?.category ?? newNote.category,
            title: classified?.title ?? newNote.title,
            text: classified?.details ?? newNote.text,
            tags: classified?.tags ?? newNote.tags,
            mood: classified?.mood ?? newNote.mood,
            isTodo: classified?.is_todo === true,
            todoText: classified?.title ?? newNote.todoText,
            colorIdx: colorIdxForCategory(classified?.category ?? newNote.category),
          }),
        });

        if (!response.ok) throw new Error("Failed to save note");

        const data = await response.json();
        setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...data.note, organizing: false } : n)));
      } catch (err) {
        console.error("Database save failed:", err);
      }
    }
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
  const noteCategorySlugs = Array.from(new Set(notes.map((n) => n.category)));
  const combinedSlugs = Array.from(new Set([...CATEGORY_SLUGS, ...noteCategorySlugs]));
  const allCategories: CategoryMeta[] = combinedSlugs.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[slug] || slug.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    count: counts[slug] || 0,
    colorIdx: colorIdxForCategory(slug),
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
  console.log("allCategories:", allCategories.map(c => c.slug));
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

      {screen === "settings" && (
        <SettingsScreen profile={profile} muted={muted} onSignOut={signOut} onGoAccount={goAccount} onToggleMute={toggleMute} />
      )}

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
          insight={insight}
          insightLoading={insightLoading}
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
          muted={muted}
          onToggleMute={toggleMute}
          moodLabel={averageMoodOfRecentNotes(notes)}
        />
      )}

      {overlayOpen && (
        <CaptureOverlay
          isRecording={isRecording}
          isProcessing={isProcessing}
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
