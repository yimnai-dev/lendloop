import { Logo } from "~/components/brand/Logo";
import { HeroActions } from "./HeroActions";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Logo />
      <HeroActions size="sm" />
    </header>
  );
}
