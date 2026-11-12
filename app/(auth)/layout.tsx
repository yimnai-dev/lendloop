import { Logo } from "~/components/brand/Logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="hidden flex-col justify-between border-r px-12 py-10 lg:flex">
        <Logo />
        <div className="grid gap-6">
          <span className="eyebrow">A tool library for the neighborhood</span>
          <p className="font-heading max-w-lg text-6xl leading-[0.95]">
            Borrow the drill.{" "}
            <em className="text-muted-foreground">Skip the hardware store.</em>
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Emails are shared only after a loan is approved.
        </p>
      </aside>
      <main className="grid place-items-center content-center gap-8 px-4 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        {children}
      </main>
    </div>
  );
}
