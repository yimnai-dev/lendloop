import * as Effect from "effect/Effect";
import type { Id } from "../_generated/id";
import { DatabaseReader } from "../_generated/services";
import type loans from "../_generated/tables/loans";
import type tools from "../_generated/tables/tools";
import { loadTool, loadUser } from "../policies/load";
import type { LoanView, ToolCard } from "../views";
import { photos } from "./photos";

type ToolDoc = typeof tools.Doc.Type;
type LoanDoc = typeof loans.Doc.Type;

const ACTIVITY_LIMIT = 10;

const approvedBookings = (toolId: Id<"tools">) =>
  Effect.flatMap(DatabaseReader, (reader) =>
    reader
      .table("loans")
      .index("by_tool_status", (q) => q.eq("toolId", toolId).eq("status", "approved"))
      .collect(),
  ).pipe(
    Effect.map((loans) =>
      loans.map(({ startDate, endDate }) => ({ startDate, endDate })),
    ),
  );

export const toToolCard = Effect.fn("toToolCard")(function* (
  tool: ToolDoc,
  viewerId: Id<"users">,
) {
  const owner = yield* loadUser(tool.ownerId);
  const card: ToolCard = {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    condition: tool.condition,
    description: tool.description,
    owner: { firstName: owner.firstName, trustedLender: owner.trustedLender },
    isMine: tool.ownerId === viewerId,
    photos: yield* photos(tool.photoIds),
    bookings: yield* approvedBookings(tool._id),
  };
  return card;
});

/** `perspective` is the viewer's side; the counterpart is the other party. */
export const toLoanView = Effect.fn("toLoanView")(function* (
  loan: LoanDoc,
  perspective: "lender" | "borrower",
) {
  const reader = yield* DatabaseReader;
  const tool = yield* loadTool(loan.toolId);
  const other = yield* loadUser(
    perspective === "lender" ? loan.borrowerId : loan.lenderId,
  );
  const activity = yield* reader
    .table("automationEvents")
    .index("by_loan", (q) => q.eq("loanId", loan._id), "desc")
    .take(ACTIVITY_LIMIT);

  const view: LoanView = {
    _id: loan._id,
    requestedAt: loan._creationTime,
    decidedAt: loan.decidedAt ?? null,
    returnedAt: loan.returnedAt ?? null,
    tool: { _id: tool._id, name: tool.name },
    counterpart: {
      firstName: other.firstName,
      trustedLender: other.trustedLender,
      email:
        loan.status === "approved" && other.anonymizedAt === undefined
          ? other.email
          : null,
    },
    startDate: loan.startDate,
    endDate: loan.endDate,
    status: loan.status,
    activity: activity.map(({ kind, at, detail }) =>
      detail === undefined ? { kind, at } : { kind, at, detail },
    ),
  };
  return view;
});
