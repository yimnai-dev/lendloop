import { HeroActions } from "~/components/landing/HeroActions";
import { HeroArt } from "~/components/landing/HeroArt";
import { HowItWorks } from "~/components/landing/HowItWorks";
import { PublicCatalog } from "~/components/landing/PublicCatalog";
import { SiteHeader } from "~/components/landing/SiteHeader";

const FACTS = [
  ["14 days", "The longest anyone can borrow a tool."],
  ["After yes", "When emails are shared, and not a moment before."],
  ["Automatic", "Request, decision and due-date emails go out on their own."],
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-24 px-5 pt-16 pb-24 sm:px-10 sm:pt-24">
        <section className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div className="grid gap-8">
            <span className="eyebrow">A tool library for the neighborhood</span>
            <h1 className="text-6xl leading-[0.95] sm:text-8xl">
              Borrow the drill.{" "}
              <em className="text-muted-foreground">Skip the hardware store.</em>
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
              List the tools you rarely use, borrow the ones you need, and give them back
              when you&apos;re done. Free, local, and a little less stuff in
              everyone&apos;s garage.
            </p>
            <div>
              <HeroActions />
            </div>
          </div>
          <HeroArt />
        </section>

        <dl className="grid gap-8 border-y py-10 sm:grid-cols-3">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="grid gap-2">
              <dt className="font-heading text-4xl">{term}</dt>
              <dd className="text-muted-foreground text-sm">{detail}</dd>
            </div>
          ))}
        </dl>

        <section className="grid gap-8" aria-labelledby="shelf-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-3">
              <span className="eyebrow">The index</span>
              <h2 id="shelf-heading" className="text-4xl sm:text-5xl">
                On the shelf right now
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Sign in to see who&apos;s lending, photos and availability.
            </p>
          </div>
          <PublicCatalog />
        </section>

        <HowItWorks />
      </main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-8 text-sm sm:px-10">
          <span className="font-heading text-foreground text-lg">
            Lend<em>Loop</em>
          </span>
          <span>Made for neighbors who&apos;d rather share.</span>
        </div>
      </footer>
    </>
  );
}
