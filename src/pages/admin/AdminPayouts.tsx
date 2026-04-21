import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Banknote, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Tx = {
  user_id: string;
  amount: number;
  type: "credit" | "debit";
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type Card = {
  user_id: string;
  card_last4: string;
};

type Payout = {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "processing" | "settled" | "failed";
  reference: string;
  bank_response: { settlement_eta?: string } | null;
  settled_at: string | null;
  created_at: string;
};

const statusStyle: Record<Payout["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  processing: "bg-primary/15 text-primary",
  settled: "bg-accent text-accent-foreground",
  failed: "bg-destructive/15 text-destructive",
};

const simulateBank = (amount: number) => {
  // Mock: 95% settled immediately, 5% failed.
  const fail = Math.random() < 0.05;
  return {
    status: fail ? ("failed" as const) : ("settled" as const),
    bank_response: {
      provider: "MockBank",
      settlement_eta: new Date(
        Date.now() + 1000 * 60 * 60 * 24,
      ).toISOString(),
      processed_amount: amount,
      reason: fail ? "Insufficient funds (mock)" : "ok",
    },
  };
};

const AdminPayouts = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [target, setTarget] = useState<{
    user_id: string;
    name: string;
    balance: number;
  } | null>(null);

  const { data: txs = [] } = useQuery({
    queryKey: ["admin-all-txs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("user_id, amount, type");
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const { data: cards = [] } = useQuery({
    queryKey: ["admin-all-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_cards")
        .select("user_id, card_last4");
      if (error) throw error;
      return (data ?? []) as Card[];
    },
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Payout[];
    },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const cardMap = new Map(cards.map((c) => [c.user_id, c.card_last4]));

  const balances = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of txs) {
      const cur = m.get(t.user_id) ?? 0;
      m.set(
        t.user_id,
        cur + (t.type === "credit" ? Number(t.amount) : -Number(t.amount)),
      );
    }
    return Array.from(m.entries())
      .map(([uid, balance]) => ({ uid, balance }))
      .filter((r) => r.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [txs]);

  const processPayout = useMutation({
    mutationFn: async ({
      uid,
      amount,
    }: {
      uid: string;
      amount: number;
    }) => {
      const sim = simulateBank(amount);

      const { data: tx, error: txErr } = await supabase
        .from("transactions")
        .insert({
          user_id: uid,
          amount,
          type: "debit",
          description: `Payout to bank · ${sim.status}`,
        })
        .select()
        .single();
      if (txErr) throw txErr;

      const { error: poErr } = await supabase.from("payouts").insert({
        user_id: uid,
        amount,
        status: sim.status,
        bank_response: sim.bank_response,
        related_transaction_id: tx.id,
        initiated_by: user!.id,
        settled_at: sim.status === "settled" ? new Date().toISOString() : null,
      });
      if (poErr) throw poErr;

      // If failed, reverse the debit so balance stays correct.
      if (sim.status === "failed") {
        await supabase.from("transactions").insert({
          user_id: uid,
          amount,
          type: "credit",
          description: "Payout failed · reversed",
        });
      }

      return sim.status;
    },
    onSuccess: (status) => {
      if (status === "settled") {
        toast.success("Payout settled successfully");
      } else {
        toast.error("Bank rejected the payout — balance refunded");
      }
      qc.invalidateQueries({ queryKey: ["admin-payouts"] });
      qc.invalidateQueries({ queryKey: ["admin-all-txs"] });
      setTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openPayout = (uid: string, balance: number) => {
    const p = profileMap.get(uid);
    const name =
      [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
      p?.email ||
      uid.slice(0, 8);
    setTarget({ user_id: uid, name, balance });
  };

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Payouts
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Process bank transfers for contractors with available balance. Bank API
          responses are simulated.
        </p>
      </header>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Eligible balances
      </h2>
      <Card className="overflow-hidden p-0">
        {balances.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No contractors with available balance.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Contractor</th>
                <th className="px-4 py-3 font-semibold">Card</th>
                <th className="px-4 py-3 font-semibold">Available</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(({ uid, balance }) => {
                const p = profileMap.get(uid);
                const name =
                  [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
                  p?.email ||
                  uid.slice(0, 8);
                const last4 = cardMap.get(uid);
                return (
                  <tr key={uid} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {name}
                      {p?.email && (
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {last4 ? `•••• ${last4}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">${balance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => openPayout(uid, balance)}
                      >
                        <Banknote className="mr-1 h-4 w-4" /> Process payout
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <h2 className="mb-3 mt-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Recent payouts
      </h2>
      <Card className="overflow-hidden p-0">
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No payouts processed yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Contractor</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((po) => {
                const p = profileMap.get(po.user_id);
                const name =
                  [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
                  p?.email ||
                  po.user_id.slice(0, 8);
                return (
                  <tr key={po.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(po.created_at), "MMM d, yyyy · h:mm a")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{po.reference}</td>
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3 font-semibold">
                      ${Number(po.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusStyle[po.status]}>{po.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payout</DialogTitle>
            <DialogDescription>
              Send <strong>${target?.balance.toFixed(2)}</strong> to{" "}
              <strong>{target?.name}</strong>? The simulated bank API will
              return a settlement status immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              disabled={processPayout.isPending}
              onClick={() =>
                target &&
                processPayout.mutate({
                  uid: target.user_id,
                  amount: target.balance,
                })
              }
            >
              {processPayout.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Process now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

export default AdminPayouts;
