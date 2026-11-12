import * as Effect from "effect/Effect";
import { InvalidRequest } from "../../shared/domain/errors";
import { DatabaseWriter } from "../_generated/services";
import type tools from "../_generated/tables/tools";
import { loansForTool } from "./queries";
import { applyTransition } from "./transition";

/**
 * Soft-deletes a tool. Refused while a loan is out; pending requests are
 * cancelled by the system and their borrowers notified.
 */
export const archiveTool = Effect.fn("archiveTool")(function* (
  tool: typeof tools.Doc.Type,
) {
  if (tool.archived) return;
  const approved = yield* loansForTool(tool._id, "approved");
  if (approved.length > 0) {
    return yield* new InvalidRequest({
      reason: "This tool is on loan; mark it returned before removing it",
    });
  }
  const writer = yield* DatabaseWriter;
  yield* writer.table("tools").patch(tool._id, { archived: true }).pipe(Effect.orDie);

  const pending = yield* loansForTool(tool._id, "pending");
  yield* Effect.forEach(pending, (loan) =>
    applyTransition(loan, "cancel", "system", "borrower").pipe(Effect.orDie),
  );
});
