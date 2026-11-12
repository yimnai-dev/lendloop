import { FunctionSpec, GroupSpec } from "@confect/core";
import { IsoDate } from "../shared/domain/IsoDate";
import {
  OverdueResponse,
  ReminderResult,
  WorkflowError,
  WriteBackResponse,
} from "../shared/integration/automation";

/** Internal: called only by the signed /automation/* HTTP routes. */
export default GroupSpec.make()
  .addFunction(
    FunctionSpec.internalQuery({
      name: "overdueLoans",
      args: () => ({ today: IsoDate }),
      returns: () => OverdueResponse,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({
      name: "recordReminder",
      args: () => ReminderResult.fields,
      returns: () => WriteBackResponse,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({
      name: "recordWorkflowError",
      args: () => WorkflowError.fields,
      returns: () => WriteBackResponse,
    }),
  );
