"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS, SEED_NOTES, TRANSCRIPT_SAMPLE } from "@/lib/data";
import type { CategoryMeta, CategorySlug, Note, Screen } from "@/lib/types";
import SigninScreen from "./screens/SigninScreen";
import StreamScreen from "./screens/StreamScreen";
import CabinetScreen from "./screens/CabinetScreen";
import CategoryScreen from "./screens/CategoryScreen";
import NoteScreen from "./screens/NoteScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TabBar from "./TabBar";
import CaptureOverlay from "./CaptureOverlay";

const CATEGORY_SLUGS = Object.keys(CATEGORY_LABELS) as CategorySlug[];

export default function SynapseApp() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState(false);
  const [caretOn, setCaretOn] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategorySlug | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [noteOrigin, setNoteOrigin] = useState<Screen | null>(null);

  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const caretTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
      if (caretTimer.current) clearInterval(caretTimer.current);
    };
  }, []);

  const signIn = () => setScreen("stream");
  const signOut = () => setScreen("signin");
  const goStream = () => setScreen("stream");
  const goCabinet = () => setScreen("cabinet");
  const goSettings = () => setScreen("settings");
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

  const openCapture = () => {
    setOverlayOpen(true);
    setIsRecording(false);
    setTranscript("");
    setAttachedPhoto(false);
    if (caretTimer.current) clearInterval(caretTimer.current);
    caretTimer.current = setInterval(() => setCaretOn((c) => !c), 500);
  };

  const closeCapture = () => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (caretTimer.current) clearInterval(caretTimer.current);
    setOverlayOpen(false);
    setIsRecording(false);
    setTranscript("");
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
    if (caretTimer.current) clearInterval(caretTimer.current);
    const id = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    const newNote: Note = {
      id,
      category: "work_expenses",
      text: transcript,
      tags: attachedPhoto ? ["team lunch", "$45.50", "sansotei"] : ["team lunch"],
      time: "now",
      colorIdx: 0,
      organizing: true,
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

  const activeCatMeta = allCategories.find((c) => c.slug === activeCategory) || allCategories[0];
  const categoryNotes = notes.filter((n) => n.category === activeCategory);

  const rawActiveNote = notes.find((n) => n.id === activeNoteId) || notes[0];

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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCategory={openCategory}
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
        />
      )}

      {screen === "settings" && <SettingsScreen onSignOut={signOut} />}

      {(screen === "stream" || screen === "settings") && !overlayOpen && (
        <TabBar active={screen} onHome={goStream} onCapture={openCapture} onSettings={goSettings} />
      )}

      {overlayOpen && (
        <CaptureOverlay
          isRecording={isRecording}
          transcript={transcript}
          attachedPhoto={attachedPhoto}
          caretOn={caretOn}
          onClose={closeCapture}
          onToggleRecording={toggleRecording}
          onToggleAttachPhoto={toggleAttachPhoto}
          onSave={saveNote}
        />
      )}
    </div>
  );
}
