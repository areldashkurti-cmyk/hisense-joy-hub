import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { RewardsCard } from "@/components/RewardsCard";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-ink bg-hero">
      <SiteHeader />
      <div className="container relative pt-36 pb-24 sm:pt-40 sm:pb-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-card/60 px-4 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-foreground/90">
                Hi-PRO Dealer Rewards Program
              </span>
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-ink-foreground sm:text-6xl lg:text-7xl">
              Earn rewards on every Hisense install.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              The Hi-PRO Dealer Rewards Program turns every qualified
              installation into instant earnings. Submit a claim, track
              approvals in real time, and redeem from your rewards card.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild variant="hero" size="pill-lg">
                <Link to="/register">
                  Start earning
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ink-outline" size="pill-lg">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <RewardsCard />
          </div>
        </div>
      </div>
    </section>
  );
};
