import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { IsoDate } from "../../shared/domain/IsoDate";
import { LoanStatus } from "../../shared/domain/LoanStatus";
import { Id } from "../_generated/id";

export default Table.make(() =>
  Schema.Struct({
    toolId: Id("tools"),
    borrowerId: Id("users"),
    /** Denormalized from the tool so "incoming requests" is one index read. */
    lenderId: Id("users"),
    startDate: IsoDate,
    endDate: IsoDate,
    status: LoanStatus,
    decidedAt: Schema.optionalKey(Schema.Finite),
    returnedAt: Schema.optionalKey(Schema.Finite),
  }),
)
  .index("by_tool_status", ["toolId", "status"])
  .index("by_borrower", ["borrowerId"])
  .index("by_lender", ["lenderId"])
  .index("by_status_endDate", ["status", "endDate"]);
