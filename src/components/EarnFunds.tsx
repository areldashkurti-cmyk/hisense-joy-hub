import { CreditCard, ClipboardCheck, Wallet } from "lucide-react";

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
        <div className="mx-auto max-w-2xl text-center">
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
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {points.map(({ icon: Icon, title, body }) => (
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
      </div>
    </section>
  );
};
