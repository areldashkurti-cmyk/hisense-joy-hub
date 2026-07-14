import { useMemo, useState } from "react";
import { DollarSign, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
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
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Hi-PRO Rewards
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Payout schedule
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Reference the reward amount you'll earn for each qualified Hisense
          installation. Earn up to{" "}
          <span className="font-semibold text-foreground">${MAX_PAYOUT}</span>{" "}
          per installed system.
        </p>
      </header>

      <Card className="p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                {!view || view.groups.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                    No matches for “{q}”.
                  </p>
                ) : (
                  view.groups.map((g) => (
                    <div
                      key={g.series}
                      className="overflow-hidden rounded-2xl border border-border"
                    >
                      <div className="border-b border-border bg-secondary/50 px-4 py-3">
                        <h3 className="text-sm font-semibold tracking-tight">
                          {g.series}
                        </h3>
                      </div>
                      <ul className="divide-y divide-border">
                        {g.rows.map((r) => (
                          <li
                            key={`${g.series}-${r.label}`}
                            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                          >
                            <div>
                              <span className="font-medium">{r.label}</span>
                              {r.note && (
                                <span className="ml-2 text-muted-foreground">
                                  · {r.note}
                                </span>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-1 font-semibold text-primary">
                              <DollarSign className="h-3.5 w-3.5" />
                              {r.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </AppShell>
  );
};

export default Earnings;
