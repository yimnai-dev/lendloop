import { parseAsBoolean, parseAsStringLiteral } from "nuqs";
import { CATEGORIES } from "~/shared/domain/Category";
import { LOAN_STATUSES } from "~/shared/domain/LoanStatus";

/** Browse filters live in the URL, so they're shareable and survive reloads. */
export const browseParams = {
  category: parseAsStringLiteral(CATEGORIES),
  trusted: parseAsBoolean.withDefault(false),
};

export const ADMIN_TABS = ["loans", "users", "listings", "automation"] as const;

/** Admin console tab and loan filter, also URL state. */
export const adminParams = {
  tab: parseAsStringLiteral(ADMIN_TABS).withDefault("loans"),
  status: parseAsStringLiteral(LOAN_STATUSES),
};
