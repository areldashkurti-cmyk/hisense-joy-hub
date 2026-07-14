import { CreditCard, Megaphone, ShieldCheck, Check } from "lucide-react";

const highlights = [
  {
    icon: CreditCard,
    eyebrow: "Hisense Rewards",
    title: "Reloadable Mastercard®",
    headline: "Up to $100",
    unit: "per installed system",
    body: "Earn up to $100 per installed system through Hisense Rewards, paid via a reloadable Mastercard® — giving you flexibility to use rewards your way, whether for business expenses or personal use.",
    bullets: [
      "Loaded automatically on approved claims",
      "Real-time balance and history in-app",
      "Spend anywhere Mastercard® is accepted",
    ],
  },
  {
    icon: Megaphone,
    eyebrow: "Dealer Marketing Accruals",
    title: "Up to 3% Back",
    headline: "2–3%",
    unit: "on qualifying equipment",
    body: "Reinvest in your business with marketing accruals earned on qualifying equipment purchases. Use accrued funds to support advertising, digital marketing, events, training, and other approved marketing initiatives that drive demand in your local market.",
    bullets: [
      "2% on HD Ducted & Ductless Systems",
      "3% on VRF Systems",
      "Requires $50,000 in annual qualifying purchases",
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Extended Labor Plans",
    title: "Up to 2 Years Included*",
    headline: "10 Years",
    unit: "max coverage available",
    body: "Install Hisense with the added peace of mind of up to two years of included extended labor coverage on qualifying systems, and the ability to purchase up to ten years extended labor coverage.",
    bullets: [
      "Included on qualifying systems",
      "Extendable up to 10 years total",
      "Backed by the Hisense HVAC network",
    ],
  },
];

export const ProgramHighlights = () => {
  return (
    <section id="highlights" className="bg-ink bg-hero py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-glow">
            Program Highlights
          </div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-ink-foreground sm:text-5xl">
            Three ways Hi-PRO pays you back.
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            Real rewards. Real marketing dollars. Real coverage — stacked on
            every qualifying Hisense install.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, eyebrow, title, headline, unit, body, bullets }) => (
            <div
              key={title}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink-border bg-ink-card/60 p-8 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-glow">
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink-foreground">
                {title}
              </h3>

              <div className="mt-5 flex items-baseline gap-2 border-y border-ink-border py-5">
                <span className="text-4xl font-bold tracking-tight text-primary-glow sm:text-5xl">
                  {headline}
                </span>
                <span className="text-xs font-medium text-ink-muted">
                  {unit}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>

              <ul className="mt-5 space-y-2.5">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2.5 text-sm text-ink-foreground/85"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-glow" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Eligibility callout */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-ink-border bg-ink-card/40 p-6 text-center backdrop-blur">
          <p className="text-sm text-ink-foreground/90">
            <span className="font-semibold text-primary-glow">Eligibility:</span>{" "}
            Begin earning marketing accruals with{" "}
            <span className="font-semibold text-ink-foreground">
              $50,000 in qualifying Hisense HVAC purchases per calendar year
            </span>{" "}
            — ensuring program benefits stay focused on actively engaged,
            professional partners.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          *Program details, eligibility, and coverage terms apply.
        </p>
      </div>
    </section>
  );
};
