import { Download, Building2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HiProProgram = () => {
  return (
    <section id="hi-pro" className="bg-ink bg-hero py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-card/60 px-4 py-1.5 backdrop-blur">
            <Building2 className="h-3.5 w-3.5 text-primary-glow" />
            <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-foreground/90">
              A separate program, through your distributor
            </span>
          </div>


          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            The Hi-PRO Dealer Program is Hisense HVAC's premier partnership for
            professional dealers, offering added support and growth
            opportunities beyond Hisense Dealer Rewards. It is administered by
            participating distributors, not on this site.
          </p>

          <p className="mt-5 text-base font-medium text-ink-foreground/90">
            Contact your participating distributor for Hi-PRO Dealer Program
            registration and complete benefits.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="hero" size="pill-lg">
              <a
                href="/hi-pro-dealer-program-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="mr-1 h-4 w-4" />
                Download the program brochure
              </a>
            </Button>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Hi-PRO is separate from Hisense Dealer Rewards. No registration for
            Hi-PRO is available here.
          </p>
        </div>
      </div>
    </section>
  );
};
