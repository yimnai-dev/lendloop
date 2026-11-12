"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "@confect/react";
import {
  InboxIcon,
  type LucideIcon,
  PackageIcon,
  SearchIcon,
  SendIcon,
  ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "~/components/brand/Logo";
import refs from "~/confect/_generated/refs";
import { cn } from "~/lib/utils";

type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly Icon: LucideIcon;
};

const LINKS: ReadonlyArray<NavItem> = [
  { href: "/tools", label: "Browse", Icon: SearchIcon },
  { href: "/listings", label: "My listings", Icon: PackageIcon },
  { href: "/requests", label: "My requests", Icon: SendIcon },
  { href: "/incoming", label: "Incoming", Icon: InboxIcon },
];
const ADMIN: NavItem = { href: "/admin", label: "Admin", Icon: ShieldIcon };

const linkClass =
  "text-muted-foreground hover:text-foreground hover:bg-muted/70 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors";
const activeClass = "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary";

/** The pathname is request data, so the active highlight streams in after the static shell. */
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

function NavLink({
  item: { href, label, Icon },
  active,
}: {
  readonly item: NavItem;
  readonly active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(linkClass, active && activeClass)}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Link>
  );
}

function ActiveAwareLink({ item }: { readonly item: NavItem }) {
  return <NavLink item={item} active={usePathname().startsWith(item.href)} />;
}

export function AppNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Logo href="/tools" />
        <nav
          aria-label="Main"
          className="order-last -mx-1 flex w-full gap-1 overflow-x-auto px-1 md:order-none md:w-auto"
        >
          <Suspense fallback={<NavLinks highlight={false} />}>
            <NavLinks highlight />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
