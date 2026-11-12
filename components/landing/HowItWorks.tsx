import { CalendarRangeIcon, PackagePlusIcon, Undo2Icon } from "lucide-react";

const STEPS = [
  {
    Icon: PackagePlusIcon,
    title: "List what you own",
    body: "Snap a photo of the ladder in your garage. Neighbors see your first name, never your address or email.",
  },
  {
    Icon: CalendarRangeIcon,
    title: "Request dates",
    body: "Pick up to 14 days. The owner approves or declines, and you're emailed either way.",
  },
  {
    Icon: Undo2Icon,
    title: "Return it",
    body: "Once approved you can arrange the handover. A friendly reminder goes out if a tool runs late.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="grid gap-6">
      <h2 className="text-2xl font-semibold">How it works</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ Icon, title, body }, index) => (
          <li
            key={title}
            className="bg-card grid content-start gap-3 rounded-2xl border p-5"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-muted-foreground font-heading text-sm">
                Step {index + 1}
              </span>
            </div>
            <p className="font-heading text-lg font-semibold">{title}</p>
            <p className="text-muted-foreground text-sm">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
