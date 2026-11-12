import { parseAsBoolean, parseAsStringLiteral } from "nuqs";
import { CATEGORIES } from "~/shared/domain/Category";

/** Browse filters live in the URL, so they're shareable and survive reloads. */
export const browseParams = {
  category: parseAsStringLiteral(CATEGORIES),
  trusted: parseAsBoolean.withDefault(false),
};
