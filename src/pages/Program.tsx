import { Link } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  Megaphone,
  ShieldCheck,
  Wallet,
  LifeBuoy,
  TrendingUp,
  Plane,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const highlights = [
  {
    icon: CreditCard,
    title: "Hisense Rewards Mastercard®",
    body: "Earn up to $100 per installed system, paid to a reloadable Mastercard® you can use for business or personal expenses.",
  },
  {
    icon: Megaphone,
    title: "Marketing Accruals up to 3%",
    body: "2% on Hisense HD Ducted and Ductless systems, 3% on VRF. Reinvest in advertising, events, and training that grow your local demand.",
  },
  {
    icon: ShieldCheck,
    title: "Extended Labor Plans",
    body: "Up to two years of included extended labor coverage on qualifying systems, with the option to purchase up to ten years total.",
  },
];

const tools = [
  {
    icon: Wallet,
    title: "Consumer Financing",
    body: "Hi-PRO + EGIA Optimus financing helps homeowners move forward with confidence and helps you close more premium jobs.",
  },
  {
    icon: LifeBuoy,
    title: "Priority Support",
    body: "Fast-track access to technical assistance through the Hisense Comfort Hi-TECH support app on iOS and Android.",
  },
  {
    icon: TrendingUp,
    title: "Growth Rewards",
    body: "Qualify for exclusive growth programs and loyalty incentives. Ask your Hisense distributor for details.",
  },
  {
    icon: Plane,
    title: "Annual Incentive Trip",
    body: "Top-performing Hi-PRO Dealers may earn an invitation to an exclusive annual trip based on qualifying equipment purchases.",
  },
  {
    icon: MapPin,
    title: "Lead Generation",
    body: "Enhanced placement in the Hisense online dealer locator and access to qualified consumer leads in participating markets.",
  },
];

const Program = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink bg-hero">
        <SiteHeader />
        <div className="container relative pt-36 pb-24 sm:pt-40 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-card/60 px-4 py-1.5 backdrop-blur">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-foreground/90">
                2026 Hi-PRO Dealer Program
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-ink-foreground sm:text-6xl">
              Professional support. Real rewards.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              The Hi-PRO Dealer Program is Hisense HVAC's premier partnership for
              professional dealers who deliver high performance — built to help
              you access exclusive incentives, differentiate your business, and
              win more jobs.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="hero" size="pill-lg">
                <Link to="/register">
                  Become a Hi-PRO Dealer
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ink-outline" size="pill-lg">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="bg-background py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Program highlights
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Three ways Hi-PRO grows your business.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, body }, i) => (
              <Card
                key={title}
                className="group relative rounded-3xl p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
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
              </Card>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
            Marketing accruals require $50,000 in qualifying annual Hisense HVAC
            purchases. Program details, eligibility, and coverage terms apply.
          </p>
        </div>
      </section>

      {/* Tools & Support */}
      <section className="bg-secondary/40 py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Tools, support & opportunities
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to set your business apart.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Hi-PRO Dealers gain access to tools and advantages designed for
              professional HVAC dealers — before, during, and after the sale.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-soft"
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

      {/* Closing CTA */}
      <section className="bg-background pb-24 sm:pb-32 pt-8">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink bg-hero px-8 py-16 sm:px-16 sm:py-20">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-ink-foreground sm:text-5xl">
                Partner with confidence.
              </h2>
              <p className="mt-4 text-ink-muted">
                More than incentives — a partnership built around growth,
                professionalism, and long-term success.
              </p>
              <div className="mt-8">
                <Button asChild variant="hero" size="pill-lg">
                  <Link to="/register">
                    Join Hi-PRO
                    <ArrowRight className="ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Program;
