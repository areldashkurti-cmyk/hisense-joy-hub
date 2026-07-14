import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Megaphone, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: CreditCard,
    title: "Rewards Mastercard®",
    body: "Up to $100 per install, loaded onto a reloadable card.",
  },
  {
    icon: Megaphone,
    title: "Marketing accruals",
    body: "Up to 3% back on qualifying equipment to reinvest in growth.",
  },
  {
    icon: ShieldCheck,
    title: "Extended labor plans",
    body: "Up to 2 years of labor coverage included on qualifying systems.",
  },
];

export const ProgramTeaser = () => {
  return (
    <section className="bg-secondary/40 py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            The Hi-PRO Dealer Program
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Built to grow your business.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Real rewards, marketing support, and priority service for
            professional HVAC dealers.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-8"
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

        <div className="mt-12 text-center">
          <Link
            to="/program"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Explore the Hi-PRO Dealer Program
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
