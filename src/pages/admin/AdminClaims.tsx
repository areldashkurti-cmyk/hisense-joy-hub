import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, X, FileText, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  generateMockCardNumber,
  generateExpiry,
  generateCvv,
} from "@/lib/card";

type ValidationStatus = "not_run" | "valid" | "flagged" | "missing_invoice" | "error";

type ClaimRow = {
  id: string;
  user_id: string;
  customer_name: string;
  model_number: string;
  serial_number: string;
  sale_date: string;
  status: "pending" | "approved" | "denied" | "paid";
  payout_amount: number;
  proof_path: string | null;
  notes: string | null;
  submitted_at: string;
  validation_status: ValidationStatus;
  validation_details: Record<string, unknown> | null;
  invoice_date: string | null;
  invoice_dealer: string | null;
};

type ProfileLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

const validationStyle: Record<ValidationStatus, string> = {
  not_run: "bg-secondary text-secondary-foreground",
  valid: "bg-primary/15 text-primary",
  flagged: "bg-destructive/15 text-destructive",
  missing_invoice: "bg-muted text-muted-foreground",
  error: "bg-muted text-muted-foreground",
};

const statusStyle: Record<ClaimRow["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary/15 text-primary",
  denied: "bg-destructive/15 text-destructive",
  paid: "bg-accent text-accent-foreground",
};

const AdminClaims = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "denied" | "paid">("pending");
  const [active, setActive] = useState<ClaimRow | null>(null);
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["admin-claims", filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .eq("status", filter)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClaimRow[];
    },
  });

  const userIds = Array.from(new Set(claims.map((c) => c.user_id)));

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-claim-profiles", userIds.join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      if (error) throw error;
      return (data ?? []) as ProfileLite[];
    },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const ensureCard = async (uid: string) => {
    const { data: existing } = await supabase
      .from("payment_cards")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();
    if (existing) return;

    const profile = profileMap.get(uid);
    const number = generateMockCardNumber();
    const exp = generateExpiry();
    await supabase.from("payment_cards").insert({
      user_id: uid,
      card_number: number,
      card_last4: number.slice(-4),
      expiry_month: exp.month,
      expiry_year: exp.year,
      cvv: generateCvv(),
      cardholder_name:
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        profile?.email ||
        "HiPro Contractor",
    });
  };

  const decide = useMutation({
    mutationFn: async ({
      claim,
      action,
    }: {
      claim: ClaimRow;
      action: "approved" | "denied";
    }) => {
      const { error } = await supabase
        .from("claims")
        .update({
          status: action,
          notes,
          decided_at: new Date().toISOString(),
        })
        .eq("id", claim.id);
      if (error) throw error;

      if (action === "approved") {
        await ensureCard(claim.user_id);
        await supabase.from("transactions").insert({
          user_id: claim.user_id,
          amount: claim.payout_amount,
          type: "credit",
          description: `Approved claim ${claim.id.slice(0, 8)} · ${claim.model_number}`,
          related_claim_id: claim.id,
        });
      }
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.action === "approved" ? "Claim approved & balance credited" : "Claim denied",
      );
      qc.invalidateQueries({ queryKey: ["admin-claims"] });
      setActive(null);
      setNotes("");
      setProofUrl(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openClaim = async (c: ClaimRow) => {
    setActive(c);
    setNotes(c.notes ?? "");
    setProofUrl(null);
    if (c.proof_path) {
      const { data } = await supabase.storage
        .from("proof-of-purchase")
        .createSignedUrl(c.proof_path, 60 * 10);
      setProofUrl(data?.signedUrl ?? null);
    }
  };

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Claims queue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review submissions, preview proof of purchase, and approve or deny.
        </p>
      </header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-5">
          <Card className="overflow-hidden p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading…</div>
            ) : claims.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No {filter} claims.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-4 py-3 font-semibold">Contractor</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Model</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">AI check</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c) => {
                    const p = profileMap.get(c.user_id);
                    const name =
                      [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
                      p?.email ||
                      c.user_id.slice(0, 8);
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(c.submitted_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3 font-medium">{name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.customer_name}</td>
                        <td className="px-4 py-3 font-mono text-xs">{c.model_number}</td>
                        <td className="px-4 py-3 font-semibold">
                          ${Number(c.payout_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusStyle[c.status]}>{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={validationStyle[c.validation_status]}>
                            {c.validation_status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => openClaim(c)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review claim</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Customer" value={active.customer_name} />
                <Field
                  label="Sale date"
                  value={format(new Date(active.sale_date), "MMM d, yyyy")}
                />
                <Field label="Model #" value={active.model_number} mono />
                <Field label="Serial #" value={active.serial_number} mono />
                <Field label="Payout" value={`$${Number(active.payout_amount).toFixed(2)}`} />
                <Field label="Status" value={active.status} />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider">
                  Proof of purchase
                </Label>
                {active.proof_path ? (
                  proofUrl ? (
                    proofUrl.match(/\.pdf(\?|$)/i) ? (
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        <FileText className="h-4 w-4" /> Open PDF
                      </a>
                    ) : (
                      <img
                        src={proofUrl}
                        alt="Proof of purchase"
                        className="mt-2 max-h-80 w-full rounded-xl border border-border object-contain"
                      />
                    )
                  ) : (
                    <div className="mt-2 flex h-40 items-center justify-center rounded-xl border border-border bg-secondary">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No file attached.</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs uppercase tracking-wider">
                  Internal notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2"
                  placeholder="Add a note (optional)"
                  maxLength={500}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {active && active.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => decide.mutate({ claim: active, action: "denied" })}
                  disabled={decide.isPending}
                >
                  <X className="mr-1 h-4 w-4" /> Deny
                </Button>
                <Button
                  variant="hero"
                  onClick={() => decide.mutate({ claim: active, action: "approved" })}
                  disabled={decide.isPending}
                >
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
    <p className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{value}</p>
  </div>
);

export default AdminClaims;
