import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { DateRange } from "../shared/domain/DateRange";
import {
  DateConflict,
  Forbidden,
  InvalidRequest,
  InvalidTransition,
  NotFound,
  RateLimited,
} from "../shared/domain/errors";
import { LoanGroup } from "../shared/domain/LoanStatus";
import { Id } from "./_generated/id";
import RequireUser from "./middleware/RequireUser.spec";
import { LoanView } from "./views";

const loanId = Id("loans");
const TransitionError = Schema.Union([NotFound, Forbidden, InvalidTransition]);

const transitionMutation = <const Name extends string>(name: Name) =>
  FunctionSpec.publicMutation({
    name,
    args: () => ({ loanId }),
    returns: () => Schema.Null,
    error: () => TransitionError,
  });

/** Borrow requests and the loan lifecycle, from either party's side. */
export default GroupSpec.make()
  .middleware(RequireUser)
  .addFunction(
    FunctionSpec.publicMutation({
      name: "request",
      // Nested so the end ≥ start check on `DateRange` runs on the server too.
      args: () => ({ toolId: Id("tools"), dates: DateRange }),
      returns: () => loanId,
      error: () =>
        Schema.Union([NotFound, Forbidden, InvalidRequest, DateConflict, RateLimited]),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "approve",
      args: () => ({ loanId }),
      returns: () => Schema.Null,
      error: () => Schema.Union([NotFound, Forbidden, InvalidTransition, DateConflict]),
    }),
  )
  .addFunction(transitionMutation("decline"))
  .addFunction(transitionMutation("cancel"))
  .addFunction(transitionMutation("markReturned"))
  .addFunction(
    FunctionSpec.publicPaginatedQuery({
      name: "myRequests",
      args: () => ({ group: Schema.optionalKey(LoanGroup) }),
      item: () => LoanView,
    }),
  )
  .addFunction(
    FunctionSpec.publicPaginatedQuery({
      name: "incoming",
      args: () => ({ group: Schema.optionalKey(LoanGroup) }),
      item: () => LoanView,
    }),
  );
