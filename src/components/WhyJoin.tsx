import { Award, TrendingUp, Target, Trophy } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Exclusive incentives",
    body: "Access rewards, accruals, and support reserved for professional Hi-PRO Dealers.",
  },
  {
    icon: Target,
    title: "Differentiate your business",
    body: "Stand out as a Hisense-certified partner in your local market.",
  },
  {
    icon: TrendingUp,
    title: "Increase profitability",
    body: "Turn every qualified install into rewards, accruals, and extended coverage.",
  },
  {
    icon: Trophy,
    title: "Win more jobs",
    body: "Financing tools, priority support, and leads help you close with confidence.",
  },
];

export const WhyJoin = () => {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Why Hi-PRO?
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Strong partnerships drive strong results.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            The Hi-PRO Dealer Program is built to help professional HVAC
            dealers grow with the backing of a global brand.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
