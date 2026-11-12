"use client";

import { useQueryStates } from "nuqs";
import { TextTabs } from "~/components/app/TextTabs";
import { ADMIN_TABS, adminParams } from "~/lib/searchParams";
import { AdminAutomation } from "./AdminAutomation";
import { AdminListings } from "./AdminListings";
import { AdminLoans } from "./AdminLoans";
import { AdminUsers } from "./AdminUsers";

const LABEL = {
  loans: "Loans",
  users: "Neighbors",
  listings: "Listings",
  automation: "Automation",
} as const;

const PANES = {
  loans: AdminLoans,
  users: AdminUsers,
  listings: AdminListings,
  automation: AdminAutomation,
} as const;

/** Only the active pane mounts, so only its query subscribes. */
export function AdminConsole() {
  const [{ tab }, setParams] = useQueryStates(adminParams);
  const Pane = PANES[tab];
  return (
    <div className="grid grid-cols-1 gap-10">
      <TextTabs
        label="Admin"
        value={tab}
        options={ADMIN_TABS.map((t) => ({ value: t, label: LABEL[t] }))}
        onChange={(t) => void setParams({ tab: t, status: null })}
      />
      <Pane />
    </div>
  );
}
