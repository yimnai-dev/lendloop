"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "@confect/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import refs from "~/confect/_generated/refs";
import { cn } from "~/lib/utils";

const LINKS = [
  { href: "/tools", label: "Tools" },
  { href: "/listings", label: "My listings" },
  { href: "/requests", label: "My requests" },
  { href: "/incoming", label: "Incoming" },
] as const;

const linkClass =
  "text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm";

/** The pathname is request data, so the active highlight streams in after the static shell. */
function NavLinks({ highlight }: { readonly highlight: boolean }) {
  const viewer = useQuery(refs.public.users.viewer);
  const isAdmin =
    viewer._tag === "Success" &&
    viewer.value._tag === "Ready" &&
    viewer.value.role === "admin";
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;
  return links.map(({ href, label }) => (
    <NavLink key={href} href={href} label={label} highlight={highlight} />
  ));
}

function NavLink({
  href,
  label,
  highlight,
}: {
  readonly href: string;
  readonly label: string;
  readonly highlight: boolean;
}) {
  return highlight ? (
    <ActiveAwareLink href={href} label={label} />
  ) : (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

function ActiveAwareLink({
  href,
  label,
}: {
  readonly href: string;
  readonly label: string;
}) {
  const active = usePathname().startsWith(href);
  return (
    <Link href={href} className={cn(linkClass, active && "bg-muted text-foreground")}>
      {label}
    </Link>
  );
}

export function AppNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-3">
        <Link href="/tools" className="mr-4 font-semibold">
          LendLoop
        </Link>
        <Suspense fallback={<NavLinks highlight={false} />}>
          <NavLinks highlight />
        </Suspense>
        <div className="ml-auto">
          <UserButton />
        </div>
      </nav>
    </header>
  );
}
