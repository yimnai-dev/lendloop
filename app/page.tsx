import { HeroActions } from "~/components/landing/HeroActions";
import { PublicCatalog } from "~/components/landing/PublicCatalog";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-10 px-6 py-16">
      <header className="grid gap-4">
        <p className="text-muted-foreground font-medium">LendLoop</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Borrow the drill. Skip the hardware store.
        </h1>
        <p className="text-muted-foreground text-lg">
          A lending board for your neighborhood: list the tools you rarely use, borrow the
          ones you need, and give them back when you're done.
        </p>
        <div>
          <HeroActions />
        </div>
      </header>
      <section className="grid gap-3">
        <h2 className="text-lg font-medium">On the shelf right now</h2>
        <PublicCatalog />
      </section>
    </main>
  );
}
