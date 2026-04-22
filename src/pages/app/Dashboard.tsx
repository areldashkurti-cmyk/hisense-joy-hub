import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Wallet, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type ClaimStatus = "pending" | "approved" | "denied" | "paid";

const STATUS_LABEL: Record<ClaimStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  paid: "Paid",
};

const STATUS_STYLE: Record<ClaimStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary/15 text-primary",
  denied: "bg-destructive/15 text-destructive",
  paid: "bg-accent text-accent-foreground",
};

const Dashboard = () => {
  const { user, isReady } = useAuth();
  const [filter, setFilter] = useState<"all" | ClaimStatus>("all");

  const { data: claims = [] } = useQuery({
    queryKey: ["claims", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("claims")
        .select("*")
        .order("submitted_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["transactions", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const { data: card } = useQuery({
    queryKey: ["payment-card", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_cards")
        .select("card_last4, expiry_month, expiry_year, cardholder_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const stats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === "pending").length;
    const approved = claims.filter(
      (c) => c.status === "approved" || c.status === "paid",
    ).length;
    const balance = txs.reduce(
      (sum, t) => sum + (t.type === "credit" ? Number(t.amount) : -Number(t.amount)),
      0,
    );
    const rewardsEarned = claims
      .filter((c) => c.status === "approved" || c.status === "paid")
      .reduce((sum, c) => sum + Number(c.payout_amount), 0);
    const pendingRewards = claims
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.payout_amount), 0);
    return { total, pending, approved, balance, rewardsEarned, pendingRewards };
  }, [claims, txs]);

  const filtered = filter === "all" ? claims : claims.filter((c) => c.status === filter);

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Your wallet
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
        </div>
        <Button asChild variant="hero" size="pill">
          <Link to="/app/claims/new">
            <Plus className="mr-1 h-4 w-4" /> New claim
          </Link>
        </Button>
      </header>

      {/* Rewards card */}
      <Card className="relative overflow-hidden border-0 bg-ink bg-card-dark p-8 text-ink-foreground shadow-card">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
              Hisense Rewards · Card
            </p>
            <p className="mt-6 text-sm text-ink-muted">Available balance</p>
            <p className="mt-1 text-5xl font-black tracking-tight">
              ${stats.balance.toFixed(2)}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  Rewards earned
                </p>
                <p className="text-lg font-bold text-ink-foreground">
                  ${stats.rewardsEarned.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  Pending rewards
                </p>
                <p className="text-lg font-bold text-ink-foreground">
                  ${stats.pendingRewards.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="mt-6 font-mono text-sm tracking-widest text-ink-muted">
              {card
                ? `•••• •••• •••• ${card.card_last4}`
                : "•••• •••• •••• ••••"}
            </p>
            {card && (
              <p className="mt-1 text-[11px] text-ink-muted">
                Exp {String(card.expiry_month).padStart(2, "0")}/
                {String(card.expiry_year).slice(-2)}
              </p>
            )}
          </div>
          <div className="text-right">
            <Wallet className="ml-auto h-8 w-8 text-primary" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
              Cardholder
            </p>
            <p className="text-sm font-semibold text-ink-foreground">
              {card?.cardholder_name ?? user?.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Total claims" value={stats.total.toString()} />
        <StatCard icon={Clock} label="Pending review" value={stats.pending.toString()} />
        <StatCard
          icon={Wallet}
          label="Approved / paid"
          value={stats.approved.toString()}
        />
      </div>

      {/* Claims */}
      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Your claims</h2>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="denied">Denied</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="mt-5">
            {filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No claims yet.{" "}
                  <Link to="/app/claims/new" className="font-semibold text-primary hover:underline">
                    Submit your first one.
                  </Link>
                </p>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Submitted</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Model</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(c.submitted_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 font-medium">{c.customer_name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{c.model_number}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cn(
                              "rounded-full font-semibold",
                              STATUS_STYLE[c.status as ClaimStatus],
                            )}
                          >
                            {STATUS_LABEL[c.status as ClaimStatus]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ${Number(c.payout_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Transactions */}
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          Transaction history
        </h2>
        {txs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No transactions yet. Approved claims will appear here.
            </p>
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {txs.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 sm:p-5"
              >
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(t.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <p
                  className={cn(
                    "font-semibold tabular-nums",
                    t.type === "credit" ? "text-primary" : "text-foreground",
                  )}
                >
                  {t.type === "credit" ? "+" : "−"}${Number(t.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </Card>
        )}
      </section>
    </AppShell>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </Card>
);

export default Dashboard;
