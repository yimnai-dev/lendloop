import type { Category } from "../../shared/domain/Category";
import type { Condition } from "../../shared/domain/Condition";
import type { LoanStatus } from "../../shared/domain/LoanStatus";

/** Seed people use the reserved `.test` TLD, so no real inbox ever gets mail. */
export const SEED_USERS = [
  { key: "maya", firstName: "Maya", trustedLender: true },
  { key: "theo", firstName: "Theo", trustedLender: false },
  { key: "priya", firstName: "Priya", trustedLender: true },
  { key: "sam", firstName: "Sam", trustedLender: false },
] as const;

export type SeedUserKey = (typeof SEED_USERS)[number]["key"];

export const SEED_TOOLS: ReadonlyArray<{
  readonly key: string;
  readonly owner: SeedUserKey;
  readonly name: string;
  readonly category: Category;
  readonly condition: Condition;
  readonly description: string;
}> = [
  {
    key: "washer",
    owner: "maya",
    name: "Pressure washer",
    category: "cleaning",
    condition: "good",
    description: "2000 PSI, comes with three nozzles. Bring your own hose.",
  },
  {
    key: "trimmer",
    owner: "maya",
    name: "Hedge trimmer",
    category: "garden",
    condition: "fair",
    description: "Cordless, battery lasts about 40 minutes.",
  },
  {
    key: "saw",
    owner: "theo",
    name: "Circular saw",
    category: "power_tools",
    condition: "new",
    description: '7¼" blade, laser guide. Please return the blade guard on.',
  },
  {
    key: "level",
    owner: "theo",
    name: "Spirit level",
    category: "hand_tools",
    condition: "good",
    description: "1.2 m aluminium level.",
  },
  {
    key: "mixer",
    owner: "priya",
    name: "Stand mixer",
    category: "kitchen",
    condition: "good",
    description: "With dough hook and whisk.",
  },
  {
    key: "tent",
    owner: "sam",
    name: "4-person tent",
    category: "camping",
    condition: "worn",
    description: "Sleeps four; one pole is taped but holds.",
  },
  {
    key: "ladder",
    owner: "sam",
    name: "Step ladder",
    category: "outdoor",
    condition: "good",
    description: "Six steps, folds flat.",
  },
  {
    key: "drill",
    owner: "priya",
    name: "Hammer drill",
    category: "power_tools",
    condition: "fair",
    description: "Corded, masonry bits included.",
  },
];

/** Loans relative to today, so the demo always has overdue and upcoming ones. */
export const SEED_LOANS: ReadonlyArray<{
  readonly tool: string;
  readonly borrower: SeedUserKey;
  readonly start: number;
  readonly end: number;
  readonly status: LoanStatus;
}> = [
  { tool: "washer", borrower: "theo", start: -6, end: -2, status: "approved" },
  { tool: "tent", borrower: "priya", start: -10, end: -1, status: "approved" },
  { tool: "saw", borrower: "sam", start: -1, end: 2, status: "approved" },
  { tool: "trimmer", borrower: "priya", start: 3, end: 5, status: "pending" },
  { tool: "ladder", borrower: "maya", start: 7, end: 8, status: "pending" },
  { tool: "mixer", borrower: "theo", start: -14, end: -10, status: "returned" },
  { tool: "mixer", borrower: "sam", start: -12, end: -11, status: "declined" },
];
