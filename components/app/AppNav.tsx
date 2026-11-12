"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { useQuery } from "@confect/react";
import refs from "~/confect/_generated/refs";

const LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/listings", label: "My listings" },
  { href: "/requests", label: "My requests" },
  { href: "/incoming", label: "Incoming" },
] as const;

export function AppNav() {
  const viewer = useQuery(refs.public.users.viewer);
  const pathname = usePathname();
  const isAdmin =
    viewer._tag === "Success" &&
    viewer.value._tag === "Ready" &&
    viewer.value.role === "admin";
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-3">
        <Link href="/tools" className="mr-4 font-semibold">
          LendLoop
        </Link>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm",
              pathname.startsWith(href) && "bg-muted text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto">
          <UserButton />
        </div>
      </nav>
    </header>
  );
}
