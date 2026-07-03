import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const genCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HIPRO-${seg(4)}-${seg(4)}`;
};

const AdminBonusCodes = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [code, setCode] = useState(genCode());
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: codes = [] } = useQuery({
    queryKey: ["bonus-codes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bonus_invitation_codes")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("bonus_invitation_codes").insert({
      code: code.trim().toUpperCase(),
      amount: Number(amount) || 100,
      note: note.trim() || null,
      created_by: user?.id,
    });
    setSaving(false);
    if (error) {
      toast.error("Couldn't create code", { description: error.message });
      return;
    }
    toast.success("Invitation code created");
    setCode(genCode());
    setNote("");
    qc.invalidateQueries({ queryKey: ["bonus-codes"] });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this invitation code? This cannot be undone.")) return;
    const { error } = await supabase.from("bonus_invitation_codes").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't delete", { description: error.message });
      return;
    }
    toast.success("Code deleted");
    qc.invalidateQueries({ queryKey: ["bonus-codes"] });
  };

  const copy = async (c: string) => {
    await navigator.clipboard.writeText(c);
    toast.success("Copied");
  };

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Private incentives
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Sign-on bonus codes
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Issue single-use $100 sign-on bonus codes to selected dealers. Codes
          are not shown publicly — share them privately.
        </p>
      </header>

      <Card className="mb-8 p-6 sm:p-8">
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Code</Label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-11 rounded-xl font-mono"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setCode(genCode())}>
                Regen
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Amount ($)</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cooper's HVAC — Vegas"
              className="h-11 rounded-xl"
            />
          </div>
          <Button type="submit" variant="hero" disabled={saving} className="h-11 rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1 h-4 w-4" /> Create</>}
          </Button>
        </form>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Note</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No invitation codes yet.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3 font-semibold">${Number(c.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.note ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.redeemed_by ? (
                      <Badge className="rounded-full bg-primary/15 text-primary">
                        Redeemed {c.redeemed_at ? format(new Date(c.redeemed_at), "MMM d") : ""}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">Available</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(c.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => copy(c.code)} disabled={!!c.redeemed_by}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

export default AdminBonusCodes;
