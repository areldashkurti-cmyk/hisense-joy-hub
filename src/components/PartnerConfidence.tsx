import { TrendingUp, Award, Globe } from "lucide-react";

const pillars = [
  {
    icon: TrendingUp,
    title: "Built for growth",
    body: "Real-world rewards, marketing accruals, and support that scales with your business — not a one-time promo.",
  },
  {
    icon: Award,
    title: "Professional-first",
    body: "Tools, training, and priority service designed around dealers who take pride in every install.",
  },
  {
    icon: Globe,
    title: "National brand power",
    body: "Compete — and win — with the recognition and backing of Hisense HVAC's global brand.",
  },
];

export const PartnerConfidence = () => {
  return (
    <section className="bg-ink bg-hero py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-glow">
            Partner with Confidence
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-ink-foreground sm:text-5xl">
            More than incentives — a partnership built to last.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            The 2026 Hi-PRO Dealer Program is built around growth,
            professionalism, and long-term success — equipping dealers to
            compete and win in today's evolving HVAC landscape.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-ink-border bg-ink-card/50 p-8 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
