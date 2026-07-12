import type { CategorySlug, Note } from "./types";

export const CATEGORY_PALETTE = [
  { bg: "oklch(0.9 0.05 15)", fg: "oklch(0.4 0.09 15)" },
  { bg: "oklch(0.91 0.05 95)", fg: "oklch(0.42 0.08 90)" },
  { bg: "oklch(0.9 0.05 150)", fg: "oklch(0.4 0.08 150)" },
  { bg: "oklch(0.9 0.045 250)", fg: "oklch(0.42 0.08 250)" },
  { bg: "oklch(0.9 0.05 320)", fg: "oklch(0.42 0.08 320)" },
  { bg: "oklch(0.9 0.05 60)", fg: "oklch(0.42 0.08 60)" },
  { bg: "oklch(0.9 0.045 190)", fg: "oklch(0.42 0.08 190)" },
];

export const CLIP_PRESETS = [
  "polygon(3% 0%, 100% 0%, 100% 93%, 95% 100%, 0% 100%, 0% 5%)",
  "polygon(0% 4%, 5% 0%, 100% 0%, 100% 96%, 94% 100%, 0% 100%)",
  "polygon(0 0, 96% 0, 100% 7%, 100% 100%, 5% 100%, 0 93%)",
];

export const PAPER_BG =
  "radial-gradient(rgba(90,70,50,0.16) 1px, transparent 1.4px)";
export const PAPER_BG_SIZE = "15px 15px";

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  const week = Math.floor(day / 7);
  return `${week}w ago`;
}

export const SEED_NOTES: Note[] = [
  { id: 1, category: "travel_prep", text: "Need to renew my passport before the trip to Japan in October.", tags: ["passport", "Japan"], time: "2m ago", colorIdx: 3, isTodo: true, todoText: "renew passport" },
  { id: 2, category: "work_expenses", text: "Team lunch at Sansotei — grab the receipt for reimbursement.", tags: ["team lunch", "$45.50"], time: "41m ago", colorIdx: 0, isTodo: true, todoText: "submit sansotei receipt" },
  { id: 3, category: "car_maintenance", text: "Weird noise from front left tire again, book the shop for Friday.", tags: ["honda civic"], time: "3h ago", colorIdx: 1, isTodo: true, todoText: "book shop for tire noise" },
  { id: 4, category: "gift_ideas", text: "Mira mentioned she wants that ceramic mug set from the market stall.", tags: ["mira", "birthday"], time: "yesterday", colorIdx: 4 },
  { id: 5, category: "book_notes", text: "That line about memory being a place you visit, not a thing you keep.", tags: ["quote"], time: "yesterday", colorIdx: 2 },
  { id: 6, category: "travel_prep", text: "Window seat, aisle 14 — confirmed with the airline.", tags: ["flight"], time: "2d ago", colorIdx: 3 },
  { id: 7, category: "work_expenses", text: "Software subscription renewed, expensable under tools.", tags: ["tools", "$12"], time: "2d ago", colorIdx: 0, isTodo: true, todoText: "expense software subscription" },
  { id: 8, category: "car_maintenance", text: "Oil change is due in about 500 miles.", tags: ["oil change"], time: "4d ago", colorIdx: 1, isTodo: true, todoText: "schedule oil change" },
  { id: 9, category: "recipe_ideas", text: "That miso-butter pasta Theo made — ask him for the ratio.", tags: ["pasta"], time: "5d ago", colorIdx: 5 },
  { id: 10, category: "home_projects", text: "Repaint the bookshelf before the shelves go back up.", tags: ["diy"], time: "6d ago", colorIdx: 6, isTodo: true, todoText: "repaint bookshelf" },
];

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  travel_prep: "travel prep",
  work_expenses: "work expenses",
  car_maintenance: "car maintenance",
  gift_ideas: "gift ideas",
  book_notes: "book notes",
  recipe_ideas: "recipe ideas",
  home_projects: "home projects",
};

export const TRANSCRIPT_SAMPLE =
  "keep track of this, it was a team lunch with the design squad after the sprint review";

export function seededRand(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 99991) * 10000;
  const f = x - Math.floor(x);
  return min + f * (max - min);
}

export const STICKER_DEFS: { kind: string; svg: { __html: string } }[] = [
  { kind: "star", svg: { __html: '<svg width="26" height="26" viewBox="0 0 20 20"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="oklch(0.68 0.14 45)"/></svg>' } },
  { kind: "flower", svg: { __html: '<svg width="26" height="26" viewBox="0 0 26 26"><path d="M13 2 C13 8 20 6 20 13 C20 20 13 18 13 24 C13 18 6 20 6 13 C6 6 13 8 13 2 Z" stroke="oklch(0.5 0.1 300)" stroke-width="1.6" fill="none"/></svg>' } },
  { kind: "squiggle", svg: { __html: '<svg width="30" height="16" viewBox="0 0 30 16"><path d="M1 8 Q 8 0, 15 8 T 29 8" stroke="oklch(0.6 0.1 45)" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>' } },
  { kind: "circle", svg: { __html: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" stroke="oklch(0.5 0.1 300)" stroke-width="1.8" fill="none" stroke-dasharray="2 4"/></svg>' } },
];

export const DAILY_TIP = {
  text: "you've mentioned ice cream a few times lately —",
  place: "maybe swing by Honeycone this week?",
};

export const JOURNAL_CANVAS_W = 282;
export const JOURNAL_CANVAS_H = 460;
export const JOURNAL_SLIVER_W = 40;

const TITLE_STOPWORDS = new Set([
  "the", "a", "an", "to", "of", "for", "and", "that", "it", "was", "is", "in", "again", "again,",
]);

export function generateTitle(text: string, seedOffset = 0) {
  const words = text.replace(/[—–]/g, " ").split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => !TITLE_STOPWORDS.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  const pick = (meaningful.length >= 4 ? meaningful : words).slice(0, 4 + (seedOffset % 2));
  let title = pick.join(" ").replace(/[,.:;—–]+$/, "");
  if (!title) title = "untitled note";
  return title.charAt(0).toUpperCase() + title.slice(1);
}
