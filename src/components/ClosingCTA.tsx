import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const trust = [
  {
    icon: Building2,
    label: "Backed by your authorized distributor",
  },
  {
    icon: ShieldCheck,
    label: "Secured with bank-grade encryption",
  },
  {
    icon: Zap,
    label: "Designed to work as fast as you do",
  },
];

export const ClosingCTA = () => {
  return (
    <section className="bg-background pb-24 sm:pb-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink bg-hero px-8 py-16 sm:px-16 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-ink-foreground sm:text-5xl">
              Built for the Pros who deliver Hisense Comfort.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trust.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-ink-border bg-ink-card/40 p-5 text-center backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-primary-glow" />
                  <span className="text-sm text-ink-foreground/80">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button asChild variant="hero" size="pill-lg">
                <Link to="/register">
                  Create your account
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
