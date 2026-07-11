export type Screen = "signin" | "stream" | "cabinet" | "category" | "note" | "settings";

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
}

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  count: number;
  colorIdx: number;
}
