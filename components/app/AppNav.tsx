"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "@confect/react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "~/components/brand/Logo";
import { Button } from "~/components/ui/button";
import refs from "~/confect/_generated/refs";
import { cn } from "~/lib/utils";

type NavItem = { readonly href: string; readonly label: string };

const LINKS: ReadonlyArray<NavItem> = [
  { href: "/tools", label: "Browse" },
  { href: "/listings", label: "Your shelf" },
  { href: "/incoming", label: "Lending" },
  { href: "/requests", label: "Borrowing" },
];
const ADMIN: NavItem = { href: "/admin", label: "Admin" };

/** The pathname is request data, so the active underline streams in after the static shell. */
function NavLinks({ highlight }: { readonly highlight: boolean }) {
  const viewer = useQuery(refs.public.users.viewer);
  const isAdmin =
    viewer._tag === "Success" &&
    viewer.value._tag === "Ready" &&
    viewer.value.role === "admin";
  const links = isAdmin ? [...LINKS, ADMIN] : LINKS;
  return links.map((item) =>
    highlight ? (
      <ActiveAwareLink key={item.href} item={item} />
    ) : (
      <NavLink key={item.href} item={item} active={false} />
    ),
  );
}

function NavLink({ item, active }: { readonly item: NavItem; readonly active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 border-b py-1.5 text-[13px] transition-colors",
        active
          ? "border-foreground text-foreground"
          : "text-muted-foreground hover:text-foreground border-transparent",
      )}
    >
      {item.label}
    </Link>
  );
}

function ActiveAwareLink({ item }: { readonly item: NavItem }) {
  return <NavLink item={item} active={usePathname().startsWith(item.href)} />;
}

export function AppNav() {
  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-10 md:grid-cols-[1fr_auto_1fr]">
        <Logo href="/tools" />
        <nav
          aria-label="Main"
          className="col-span-2 row-start-2 -mx-1 flex gap-7 overflow-x-auto px-1 md:col-span-1 md:row-start-1 md:col-start-2"
        >
          <Suspense fallback={<NavLinks highlight={false} />}>
            <NavLinks highlight />
          </Suspense>
        </nav>
        <div className="flex items-center justify-end gap-4">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/listings/new">
              <PlusIcon aria-hidden />
              List a tool
            </Link>
          </Button>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
