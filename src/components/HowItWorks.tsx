import { ClipboardCheck, TrendingUp, CreditCard } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Submit your install",
    body: "Log the sale date, customer, serial number, and upload your proof of purchase in under a minute.",
  },
  {
    icon: TrendingUp,
    title: "We verify, you watch",
    body: "Track every claim through Pending, Approved, or Denied with real-time status updates.",
  },
  {
    icon: CreditCard,
    title: "Spend your rewards",
    body: "Approved claims credit your rewards card instantly. Redeem when you're ready.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            How it works
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Three steps from install to payout.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="group relative rounded-3xl border border-border bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="absolute right-6 top-6 text-xs font-semibold text-muted-foreground/50">
                0{i + 1}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
