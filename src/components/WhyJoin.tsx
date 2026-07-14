import { Award, TrendingUp, Target, Trophy, Check } from "lucide-react";
import dealerImage from "@/assets/hipro-dealer.jpg";

const reasons = [
  {
    icon: Award,
    title: "Exclusive incentives and support",
  },
  {
    icon: Target,
    title: "Differentiate your business",
  },
  {
    icon: TrendingUp,
    title: "Increase profitability",
  },
  {
    icon: Trophy,
    title: "Win more jobs",
  },
];

export const WhyJoin = () => {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.35fr_1.65fr] lg:gap-16">
          {/* Image */}
          <div className="relative order-last flex justify-center lg:order-first">
            <div className="relative w-full max-w-[120px] overflow-hidden rounded-[1.25rem] bg-secondary shadow-card sm:max-w-[140px]">
              <img
                src={dealerImage}
                alt="Professional Hisense Hi-PRO HVAC dealer wearing branded polo and cap in front of a home"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/30 via-transparent to-transparent" />
            </div>

            {/* Floating stat */}
            <div className="absolute -bottom-4 -right-2 hidden rounded-2xl border border-border bg-card p-3 shadow-card sm:block lg:-right-8">
              <div className="text-xl font-bold tracking-tight text-primary">
                $100
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                per installed system
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Why Hi-PRO?
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Strong partnerships drive strong results.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The Hi-PRO Dealer Program is Hisense HVAC's premier partnership
              for professional dealers committed to delivering high
              performance. At Hisense, we believe strong partnerships drive
              strong results — Hi-PRO is built to help you:
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {reasons.map(({ icon: Icon, title }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="pt-1 text-sm font-semibold tracking-tight">
                    {title}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              Backed by Hisense HVAC's global brand and dealer network.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
