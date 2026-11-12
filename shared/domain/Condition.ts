import * as Schema from "effect/Schema";

export const CONDITIONS = ["new", "good", "fair", "worn"] as const;

export const Condition = Schema.Literals(CONDITIONS);
export type Condition = typeof Condition.Type;

export const conditionLabel = {
  new: "Like new",
  good: "Good",
  fair: "Fair",
  worn: "Well used",
} as const satisfies Record<Condition, string>;
