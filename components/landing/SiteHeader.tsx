import { Logo } from "~/components/brand/Logo";
import { HeroActions } from "./HeroActions";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-10">
        <Logo />
        <HeroActions size="sm" />
      </div>
    </header>
  );
}
