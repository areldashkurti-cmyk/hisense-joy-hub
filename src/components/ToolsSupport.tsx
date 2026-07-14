import { Wallet, Headphones, Sparkles, Plane, MapPin } from "lucide-react";

const items = [
  {
    icon: Wallet,
    title: "Consumer Financing",
    body: "Hi-PRO + EGIA Optimus financing gives homeowners flexible options — helping you close more sales and upsell premium systems.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    body: "Skip the queue. Hi-PRO Dealers get priority access via the Hisense Comfort Hi-TECH support app on iOS and Android.",
  },
  {
    icon: Sparkles,
    title: "Growth Rewards",
    body: "Qualify for exclusive growth programs and loyalty incentives. Ask your participating Hisense distributor for details.",
  },
  {
    icon: Plane,
    title: "Annual Incentive Trip*",
    body: "Top-performing Hi-PRO Dealers can earn a spot on an exclusive annual trip based on qualifying equipment purchases.",
  },
  {
    icon: MapPin,
    title: "Lead Generation",
    body: "Enhanced placement in the Hisense online Contractor Locator, plus access to qualified consumer leads in participating markets.",
  },
];

export const ToolsSupport = () => {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Tools, Support & Opportunities
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Set your business apart.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Hi-PRO Dealers get tools and advantages built for professionals —
            before, during, and after the sale.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className={`rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft ${
                i === 4 ? "lg:col-start-2" : ""
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
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

        <p className="mt-8 text-center text-xs text-muted-foreground">
          *Trip qualification is based on annual equipment purchases and is
          not guaranteed.
        </p>
      </div>
    </section>
  );
};
