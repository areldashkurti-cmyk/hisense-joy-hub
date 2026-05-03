export const RewardsCard = ({
  amount = "$8,442.50",
  holder = "Cooper Climate Air",
}: {
  amount?: string;
  holder?: string;
}) => {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="relative overflow-hidden rounded-3xl border border-ink-border bg-card-dark p-8 shadow-card">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Hi-PRO Rewards Card
          </span>
        </div>

        <div className="mt-10 text-5xl font-bold tracking-tight text-ink-foreground sm:text-6xl">
          {amount}
        </div>

        <div className="mt-12 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Holder
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-ink-foreground">
              {holder}
            </div>
          </div>
          <div className="font-serif text-2xl italic font-bold text-primary-glow">
            VISA
          </div>
        </div>
      </div>
    </div>
  );
};
