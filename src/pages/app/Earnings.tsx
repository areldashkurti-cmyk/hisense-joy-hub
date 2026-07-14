import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAYOUT_SCHEDULE, MAX_PAYOUT, type PayoutCategory } from "@/data/payoutSchedule";

const Earnings = () => {
  const [q, setQ] = useState("");

  const filtered = useMemo<PayoutCategory[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return PAYOUT_SCHEDULE;
    return PAYOUT_SCHEDULE.map((cat) => ({
      ...cat,
      groups: cat.groups
        .map((g) => ({
          ...g,
          rows: g.rows.filter(
            (r) =>
              r.label.toLowerCase().includes(term) ||
              g.series.toLowerCase().includes(term) ||
              (r.note ?? "").toLowerCase().includes(term),
          ),
        }))
        .filter((g) => g.rows.length > 0),
    })).filter((c) => c.groups.length > 0);
  }, [q]);

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Earn up to:
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Hi-PRO Rewards
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Reference the reward amount you'll earn for each qualified Hisense
          installation. Earn up to{" "}
          <span className="font-semibold text-primary">${MAX_PAYOUT}</span>{" "}
          per installed system.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tonnage or series"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          All amounts in USD. Program terms apply and are subject to change.
        </p>
      </div>

      <Tabs defaultValue="hd" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          {PAYOUT_SCHEDULE.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAYOUT_SCHEDULE.map((cat) => {
          const view = filtered.find((c) => c.id === cat.id);
          return (
            <TabsContent key={cat.id} value={cat.id} className="space-y-6">
              <div className="rounded-2xl bg-[hsl(210_15%_91%)] p-6 text-[hsl(var(--ink))] shadow-card sm:p-8">
                <p className="mb-6 text-sm text-[hsl(var(--ink))]/70">
                  {cat.description}
                </p>
                {!view || view.groups.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[hsl(var(--ink))]/20 py-10 text-center text-sm text-[hsl(var(--ink))]/60">
                    No matches for “{q}”.
                  </p>
                ) : (
                  <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-2">
                    {view.groups.map((g) => (
                      <div key={g.series}>
                        <h3 className="mb-3 text-base font-bold tracking-tight text-primary">
                          {g.series}
                        </h3>
                        <ul className="divide-y divide-[hsl(var(--ink))]/10">
                          {g.rows.map((r) => (
                            <li
                              key={`${g.series}-${r.label}`}
                              className="flex items-center justify-between gap-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--ink))]/5"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-[hsl(var(--ink))]">
                                  {r.label}
                                </span>
                                {r.note && (
                                  <span className="ml-2 text-[hsl(var(--ink))]/60">
                                    · {r.note}
                                  </span>
                                )}
                              </div>
                              <span className="font-semibold text-[hsl(var(--ink))]">
                                ${r.amount}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </AppShell>
  );
};

export default Earnings;
