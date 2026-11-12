import { ShieldCheckIcon } from "lucide-react";
import { HeroActions } from "~/components/landing/HeroActions";
import { HeroArt } from "~/components/landing/HeroArt";
import { HowItWorks } from "~/components/landing/HowItWorks";
import { PublicCatalog } from "~/components/landing/PublicCatalog";
import { SiteHeader } from "~/components/landing/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-20 px-6 pt-10 pb-20">
        <section className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr]">
          <div className="grid gap-6">
            <span className="bg-accent text-accent-foreground w-fit rounded-full px-3 py-1 text-sm font-medium">
              Your neighborhood&apos;s shared shed
            </span>
            <h1 className="text-5xl leading-[1.05] font-semibold sm:text-6xl">
              Borrow the drill.{" "}
              <span className="text-primary">Skip the hardware store.</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              List the tools you rarely use, borrow the ones you need, and give them back
              when you&apos;re done. Free, local, and a little less stuff in
              everyone&apos;s garage.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <HeroActions />
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <ShieldCheckIcon className="size-4" aria-hidden />
                Emails are shared only after a loan is approved
              </span>
            </div>
          </div>
          <HeroArt />
        </section>

        <section className="grid gap-6">
          <div className="grid gap-1">
            <h2 className="text-2xl font-semibold">On the shelf right now</h2>
            <p className="text-muted-foreground">
              Sign in to see who&apos;s lending, photos and availability.
            </p>
          </div>
          <PublicCatalog />
        </section>

        <HowItWorks />
      </main>
      <footer className="text-muted-foreground border-t py-8 text-center text-sm">
        LendLoop · made for neighbors who&apos;d rather share
      </footer>
    </>
  );
}
