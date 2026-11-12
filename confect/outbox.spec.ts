import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { Id } from "./_generated/id";
import outboxEvents from "./_generated/tables/outboxEvents";

const outboxId = Id("outboxEvents");

/** Internal only: the transactional outbox dispatcher and its bookkeeping. */
export default GroupSpec.make()
  .addFunction(
    FunctionSpec.internalQuery({
      name: "load",
      args: () => ({ outboxId }),
      returns: () => Schema.NullOr(outboxEvents.Doc),
    }),
  )
  .addFunction(
    FunctionSpec.internalAction({
      name: "dispatch",
      args: () => ({ outboxId }),
      returns: () => Schema.Null,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({
      name: "recordSuccess",
      args: () => ({ outboxId }),
      returns: () => Schema.Null,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({
      name: "recordFailure",
      args: () => ({ outboxId, error: Schema.String }),
      returns: () => Schema.Null,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({ name: "sweep", returns: () => Schema.Null }),
  )
  .addFunction(
    /** Operator tool: re-queue dead events after fixing the cause. Returns how many. */
    FunctionSpec.internalMutation({ name: "redrive", returns: () => Schema.Finite }),
  );
