const STEPS = [
  {
    title: "List what you own",
    body: "Add the ladder in your garage. Neighbors see your first name, never your address or email.",
  },
  {
    title: "Request dates",
    body: "Pick up to fourteen days on the calendar. The owner approves or declines, and you're emailed either way.",
  },
  {
    title: "Hand it back",
    body: "Once approved you swap emails and arrange the handover. A reminder goes out the day before it's due.",
  },
] as const;

const NUMERALS = ["i.", "ii.", "iii."] as const;

export function HowItWorks() {
  return (
    <section className="grid gap-10" aria-labelledby="how-heading">
      <div className="grid gap-3">
        <span className="eyebrow">How it works</span>
        <h2 id="how-heading" className="text-4xl sm:text-5xl">
          Three steps, <em>no deposit.</em>
        </h2>
      </div>
      <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
        {STEPS.map(({ title, body }, index) => (
          <li key={title} className="grid content-start gap-3 border-t pt-5">
            <span className="font-heading text-muted-foreground text-4xl italic">
              {NUMERALS[index]}
            </span>
            <p className="font-heading text-2xl">{title}</p>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              {body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
