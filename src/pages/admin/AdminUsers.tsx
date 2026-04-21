import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, EyeOff, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { formatCardNumber } from "@/lib/card";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

type Card = {
  user_id: string;
  card_number: string;
  card_last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
};

type Tx = {
  id: string;
  user_id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  created_at: string;
};

const AdminUsers = () => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Profile | null>(null);
  const [showFull, setShowFull] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, city, state, created_at")
        .order("created_at", { ascending: false });
      return (data ?? []) as Profile[];
    },
  });

  const { data: cards = [] } = useQuery({
    queryKey: ["admin-users-cards"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_cards").select("*");
      return (data ?? []) as Card[];
    },
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["admin-users-txs"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*");
      return (data ?? []) as Tx[];
    },
  });

  const cardMap = new Map(cards.map((c) => [c.user_id, c]));

  const balances = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of txs) {
      const cur = m.get(t.user_id) ?? 0;
      m.set(
        t.user_id,
        cur + (t.type === "credit" ? Number(t.amount) : -Number(t.amount)),
      );
    }
    return m;
  }, [txs]);

  const filtered = useMemo(() => {
    if (!q.trim()) return profiles;
    const needle = q.toLowerCase();
    return profiles.filter((p) =>
      [p.email, p.first_name, p.last_name, p.city, p.state]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(needle)),
    );
  }, [profiles, q]);

  const activeCard = active ? cardMap.get(active.id) : null;
  const activeTxs = active
    ? txs
        .filter((t) => t.user_id === active.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
    : [];
  const activeBalance = active ? balances.get(active.id) ?? 0 : 0;

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Users &amp; cards
        </h1>
      </header>

      <div className="mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, city…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No contractors found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Contractor</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Card</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const card = cardMap.get(p.id);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {card ? `•••• ${card.card_last4}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${(balances.get(p.id) ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(p.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActive(p);
                          setShowFull(false);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {[active?.first_name, active?.last_name].filter(Boolean).join(" ") ||
                active?.email}
            </SheetTitle>
          </SheetHeader>

          {active && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Email" value={active.email ?? "—"} />
                <Field label="Phone" value={active.phone ?? "—"} />
                <Field label="City" value={active.city ?? "—"} />
                <Field label="State" value={active.state ?? "—"} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Rewards card
                </p>
                {activeCard ? (
                  <div className="mt-2 rounded-2xl bg-ink p-5 text-ink-foreground">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
                      Hisense Rewards · Card
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-mono text-lg tracking-widest">
                        {showFull
                          ? formatCardNumber(activeCard.card_number)
                          : `•••• •••• •••• ${activeCard.card_last4}`}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-ink-muted hover:bg-white/10 hover:text-ink-foreground"
                        onClick={() => setShowFull((s) => !s)}
                      >
                        {showFull ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="mt-4 flex items-end justify-between text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-ink-muted">
                          Cardholder
                        </p>
                        <p className="text-sm font-semibold">{activeCard.cardholder_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-ink-muted">
                          Expires
                        </p>
                        <p className="font-mono">
                          {String(activeCard.expiry_month).padStart(2, "0")}/
                          {String(activeCard.expiry_year).slice(-2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No card issued yet (will generate on first approved claim).
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Balance
                  </p>
                  <p className="text-2xl font-bold">${activeBalance.toFixed(2)}</p>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent transactions
                </p>
                {activeTxs.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No transactions yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                    {activeTxs.slice(0, 12).map((t) => (
                      <li key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.created_at), "MMM d, yyyy · h:mm a")}
                          </p>
                        </div>
                        <p
                          className={
                            t.type === "credit"
                              ? "font-semibold text-primary"
                              : "font-semibold text-destructive"
                          }
                        >
                          {t.type === "credit" ? "+" : "−"}${Number(t.amount).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default AdminUsers;
