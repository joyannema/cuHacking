import type { Mood } from "./moods";

export type Screen =
  | "signin"
  | "stream"
  | "cabinet"
  | "category"
  | "note"
  | "settings"
  | "todos"
  | "journal"
  | "account";

export type CategorySlug =
  | "travel_prep"
  | "work_expenses"
  | "car_maintenance"
  | "gift_ideas"
  | "book_notes"
  | "recipe_ideas"
  | "home_projects";

export interface Note {
  id: number;
  category: CategorySlug;
  text: string;
  tags: string[];
  time: string;
  colorIdx: number;
  organizing?: boolean;
  classifying?: boolean;
  title?: string;
  _titleSeed?: number;
  photo?: boolean;
  mood?: Mood;
  isTodo?: boolean;
  todoText?: string;
  todoDone?: boolean;
}

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  count: number;
  colorIdx: number;
}

export interface Profile {
  name: string;
  username: string;
  email: string;
  bio: string;
}

export type JournalElementType = "note" | "photo" | "text" | "sticker";

export interface JournalElement {
  id: number;
  type: JournalElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  entryId?: number;
  text?: string;
  photoSrc?: string;
  stickerKind?: string;
}

export interface JournalPage {
  elements: JournalElement[];
}
