"use client";

import { useQuery } from "@confect/react";
import { InboxIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
import { Button } from "~/components/ui/button";
import refs from "~/confect/_generated/refs";
import type { LoanView } from "~/confect/views";
import { LoanCard } from "./LoanCard";
import type { Perspective } from "./LoanActions";

const QUERIES = {
  borrower: refs.public.loans.myRequests,
  lender: refs.public.loans.incoming,
} as const;

const EMPTY = {
  borrower: {
    icon: SendIcon,
    title: "No requests yet",
    description: "Find something you need and ask its owner for a few days.",
    action: { href: "/tools", label: "Browse tools" },
  },
  lender: {
    icon: InboxIcon,
    title: "No one has asked yet",
    description: "Requests to borrow your tools show up here for you to approve.",
    action: { href: "/listings/new", label: "List a tool" },
  },
} as const;

/** Needs a decision first, then what's out, then history. */
const GROUPS = [
  { title: "Needs attention", statuses: ["pending"] },
  { title: "Active", statuses: ["approved"] },
  { title: "History", statuses: ["returned", "declined", "cancelled"] },
] as const satisfies ReadonlyArray<{
  title: string;
  statuses: ReadonlyArray<LoanView["status"]>;
}>;

export function LoanList({ as }: { readonly as: Perspective }) {
  const loans = useQuery(QUERIES[as]);
  const empty = EMPTY[as];
  return (
    <QueryView result={loans}>
      {(items) =>
        items.length === 0 ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            description={empty.description}
            action={
              <Button asChild variant="outline">
                <Link href={empty.action.href}>{empty.action.label}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10">
            {GROUPS.map(({ title, statuses }) => {
              const group = items.filter((loan) =>
                statuses.some((s) => s === loan.status),
              );
              return group.length === 0 ? null : (
                <section key={title} className="grid gap-3">
                  <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {title} · {group.length}
                  </h2>
                  {group.map((loan) => (
                    <LoanCard key={loan._id} loan={loan} as={as} />
                  ))}
                </section>
              );
            })}
          </div>
        )
      }
    </QueryView>
  );
}
