"use client";

import { useQueryStates } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ADMIN_TABS, adminParams } from "~/lib/searchParams";
import { AdminAutomation } from "./AdminAutomation";
import { AdminListings } from "./AdminListings";
import { AdminLoans } from "./AdminLoans";
import { AdminUsers } from "./AdminUsers";

const LABEL = {
  loans: "All loans",
  users: "Neighbors",
  listings: "Listings",
  automation: "Automation",
} as const;

/** Only the active tab mounts, so only its query subscribes. */
export function AdminConsole() {
  const [{ tab }, setParams] = useQueryStates(adminParams);
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        void setParams({ tab: ADMIN_TABS.find((t) => t === value) ?? null });
      }}
    >
      <TabsList>
        {ADMIN_TABS.map((t) => (
          <TabsTrigger key={t} value={t}>
            {LABEL[t]}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="loans" className="pt-4">
        <AdminLoans />
      </TabsContent>
      <TabsContent value="users" className="pt-4">
        <AdminUsers />
      </TabsContent>
      <TabsContent value="listings" className="pt-4">
        <AdminListings />
      </TabsContent>
      <TabsContent value="automation" className="pt-4">
        <AdminAutomation />
      </TabsContent>
    </Tabs>
  );
}
