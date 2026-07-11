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

export const SEED_NOTES: Note[] = [
  { id: 1, category: "travel_prep", text: "Need to renew my passport before the trip to Japan in October.", tags: ["passport", "Japan"], time: "2m ago", colorIdx: 3 },
  { id: 2, category: "work_expenses", text: "Team lunch at Sansotei — grab the receipt for reimbursement.", tags: ["team lunch", "$45.50"], time: "41m ago", colorIdx: 0 },
  { id: 3, category: "car_maintenance", text: "Weird noise from front left tire again, book the shop for Friday.", tags: ["honda civic"], time: "3h ago", colorIdx: 1 },
  { id: 4, category: "gift_ideas", text: "Mira mentioned she wants that ceramic mug set from the market stall.", tags: ["mira", "birthday"], time: "yesterday", colorIdx: 4 },
  { id: 5, category: "book_notes", text: "That line about memory being a place you visit, not a thing you keep.", tags: ["quote"], time: "yesterday", colorIdx: 2 },
  { id: 6, category: "travel_prep", text: "Window seat, aisle 14 — confirmed with the airline.", tags: ["flight"], time: "2d ago", colorIdx: 3 },
  { id: 7, category: "work_expenses", text: "Software subscription renewed, expensable under tools.", tags: ["tools", "$12"], time: "2d ago", colorIdx: 0 },
  { id: 8, category: "car_maintenance", text: "Oil change is due in about 500 miles.", tags: ["oil change"], time: "4d ago", colorIdx: 1 },
  { id: 9, category: "recipe_ideas", text: "That miso-butter pasta Theo made — ask him for the ratio.", tags: ["pasta"], time: "5d ago", colorIdx: 5 },
  { id: 10, category: "home_projects", text: "Repaint the bookshelf before the shelves go back up.", tags: ["diy"], time: "6d ago", colorIdx: 6 },
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
