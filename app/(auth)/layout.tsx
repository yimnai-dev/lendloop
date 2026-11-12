import { Logo } from "~/components/brand/Logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen place-items-center content-center gap-8 bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)] px-4 py-12">
      <Logo />
      {children}
    </div>
  );
}
