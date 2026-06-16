export const RewardsCard = ({
  amount = "$8,442.50",
  holder = "Cooper Climate Air",
}: {
  amount?: string;
  holder?: string;
}) => {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="relative overflow-hidden rounded-3xl border border-ink-border bg-card-dark p-6 shadow-card sm:p-8">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Hi-PRO Rewards Card
          </span>
        </div>

        <div className="mt-8 text-4xl font-bold tracking-tight text-ink-foreground sm:mt-10 sm:text-6xl">
          {amount}
        </div>

        <div className="mt-8 flex items-end justify-between sm:mt-12">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Holder
            </div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-ink-foreground">
              {holder}
            </div>
          </div>
          <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="15" r="12" fill="#EB001B" />
            <circle cx="30" cy="15" r="12" fill="#F79E1B" />
            <path d="M24 7.5C26.5 9.7 28 12.6 28 15C28 17.4 26.5 20.3 24 22.5C21.5 20.3 20 17.4 20 15C20 12.6 21.5 9.7 24 7.5Z" fill="#FF5F00" />
          </svg>
        </div>
      </div>
    </div>
  );
};
