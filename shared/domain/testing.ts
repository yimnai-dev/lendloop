import * as Schema from "effect/Schema";
import { IsoDate } from "./IsoDate";

/** Test helper: validated `IsoDate` from a literal. */
export const d = Schema.decodeSync(IsoDate);
