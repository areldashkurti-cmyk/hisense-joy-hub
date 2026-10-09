import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { promoStatus, usePromoLookups, usePromotions } from "./AdminPromotions";

const AdminPromotionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: promos = [] } = usePromotions();
  const { data: lk } = usePromoLookups();
  const promo = promos.find((p) => p.id === id);

  const { data: claims = [] } = useQuery({
    queryKey: ["promo-claims", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("id,user_id,model_number,serial_number,sale_date,status,standard_amount,extra_amount,total_amount,submitted_at")
        .eq("promotion_id", id!)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const emailOf = useMemo(() => new Map((lk?.users ?? []).map((u) => [u.id, u.email])), [lk]);
  const totalExtra = claims.filter((c) => c.status !== "denied").reduce((s, c) => s + Number(c.extra_amount ?? 0), 0);

  const exportCsv = () => {
    const head = ["Claim ID", "Dealer email", "Model", "Serial", "Sale date", "Status", "Standard", "Extra", "Total", "Submitted"];
    const rows = claims.map((c) => [c.id, emailOf.get(c.user_id) ?? "", c.model_number, c.serial_number, c.sale_date, c.status, c.standard_amount, c.extra_amount, c.total_amount, c.submitted_at]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `promotion-${promo?.name ?? id}-claims.csv`;
    a.click();
  };

  return (
    <AdminShell>
      <Link to="/admin/promotions" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Promotions
      </Link>
      {!promo ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <>
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{promo.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                +${Number(promo.extra_amount).toFixed(2)} · {promo.start_date} to {promo.end_date} ·{" "}
                <Badge variant="outline">{promoStatus(promo)}</Badge>
              </p>
            </div>
            <Button variant="outline" onClick={exportCsv} disabled={claims.length === 0}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </header>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <Card className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Claims</p><p className="mt-1 text-3xl font-bold">{claims.length}</p></Card>
            <Card className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total extra (excl. denied)</p><p className="mt-1 text-3xl font-bold">${totalExtra.toFixed(2)}</p></Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>{["Dealer", "Model", "Sale date", "Status", "Standard", "Extra", "Total"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{emailOf.get(c.user_id) ?? "-"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{c.model_number}</td>
                      <td className="px-4 py-3">{c.sale_date}</td>
                      <td className="px-4 py-3 capitalize">{c.status}</td>
                      <td className="px-4 py-3">${Number(c.standard_amount ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-primary">${Number(c.extra_amount ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold">${Number(c.total_amount ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {claims.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No claims have received this promotion yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AdminShell>
  );
};

export default AdminPromotionDetail;
