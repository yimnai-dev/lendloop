import * as Schema from "effect/Schema";

export const CATEGORIES = [
  "power_tools",
  "hand_tools",
  "garden",
  "kitchen",
  "camping",
  "cleaning",
  "outdoor",
  "other",
] as const;

export const Category = Schema.Literals(CATEGORIES);
export type Category = typeof Category.Type;

export const categoryLabel = {
  power_tools: "Power tools",
  hand_tools: "Hand tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  cleaning: "Cleaning",
  outdoor: "Outdoor",
  other: "Other",
} as const satisfies Record<Category, string>;
