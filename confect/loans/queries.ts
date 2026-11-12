import * as Effect from "effect/Effect";
import type { Id } from "../_generated/id";
import { DatabaseReader } from "../_generated/services";
import type { LoanStatus } from "../../shared/domain/LoanStatus";

export const loansForTool = (toolId: Id<"tools">, status: LoanStatus) =>
  Effect.flatMap(DatabaseReader, (reader) =>
    reader
      .table("loans")
      .index("by_tool_status", (q) => q.eq("toolId", toolId).eq("status", status))
      .collect(),
  ).pipe(Effect.orDie);
