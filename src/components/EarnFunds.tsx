import { CreditCard, ClipboardCheck, Wallet } from "lucide-react";
import { RewardsCard } from "@/components/RewardsCard";

const points = [
  {
    icon: ClipboardCheck,
    title: "Register, then submit your installs",
    body: "Create your free account, then log each qualifying Hisense system you install.",
  },
  {
    icon: Wallet,
    title: "Flat dollar rewards",
    body: "Earn up to $100 on qualifying installed systems. Reward amounts are set per model — no math, no guesswork.",
  },
  {
    icon: CreditCard,
    title: "Paid to a reloadable Mastercard®",
    body: "Approved rewards load to your reloadable Hisense Dealer Rewards Mastercard®. Spend it anywhere Mastercard® is accepted.",
  },
];

export const EarnFunds = () => {
  return (
    <section id="earn" className="bg-background py-24 sm:py-32">
      <div className="container">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Hisense Dealer Rewards
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Earn funds on installed systems.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Any dealer who purchases and installs qualifying Hisense products
              can register and start earning. Rewards are always a flat dollar
              amount, paid straight to your rewards card.
            </p>

            <ul className="mt-9 space-y-4">
              {points.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight">
                      {title}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pl-6">
            <RewardsCard />
          </div>
        </div>
      </div>
    </section>
  );
};
