import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, TrendingUp, Banknote, Clock, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminReports = () => {
  const { data: claims = [] } = useQuery({
    queryKey: ["report-claims"],
    queryFn: async () => {
      const { data } = await supabase.from("claims").select("*");
      return data ?? [];
    },
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["report-payouts"],
    queryFn: async () => {
      const { data } = await supabase.from("payouts").select("*");
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const byStatus = claims.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});
    const byValidation = claims.reduce<Record<string, number>>((acc, c) => {
      const v = (c.validation_status as string) ?? "not_run";
      acc[v] = (acc[v] ?? 0) + 1;
      return acc;
    }, {});
    const totalPaidOut = payouts
      .filter((p) => p.status === "settled")
      .reduce((s, p) => s + Number(p.amount), 0);
    const pendingPayouts = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((s, p) => s + Number(p.amount), 0);
    const totalClaimsValue = claims.reduce((s, c) => s + Number(c.payout_amount), 0);
    return { byStatus, byValidation, totalPaidOut, pendingPayouts, totalClaimsValue };
  }, [claims, payouts]);

  const max = Math.max(...Object.values(stats.byStatus), 1);

  const { data: topSeries = [] } = useQuery({
    queryKey: ["report-top-series"],
    queryFn: async () => {
      const { data } = await supabase
        .from("claims")
        .select("product_id, products!inner(series)")
        .not("product_id", "is", null)
        .limit(2000);
      const counts = new Map<string, number>();
      // deno-lint-ignore no-explicit-any
      (data ?? []).forEach((row: any) => {
        const s = row.products?.series;
        if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
      });
      return Array.from(counts.entries())
        .map(([series, count]) => ({ series, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Reports
          </h1>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label="Total claims"
          value={claims.length.toString()}
        />
        <KpiCard
          icon={Clock}
          label="Pending review"
          value={(stats.byStatus.pending ?? 0).toString()}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Approved value"
          value={`$${stats.totalClaimsValue.toFixed(2)}`}
        />
        <KpiCard
          icon={Banknote}
          label="Paid out"
          value={`$${stats.totalPaidOut.toFixed(2)}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Claims by status
          </h2>
          <div className="mt-5 space-y-3">
            {(["pending", "approved", "denied", "paid"] as const).map((s) => {
              const v = stats.byStatus[s] ?? 0;
              return (
                <div key={s}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="capitalize">{s}</span>
                    <span className="font-mono text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(v / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            AI invoice validation
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {(["valid", "flagged", "missing_invoice", "not_run", "error"] as const).map((v) => (
              <div key={v} className="rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {v.replace("_", " ")}
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.byValidation[v] ?? 0}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Most-selected series
          </h2>
          <div className="mt-5 space-y-3">
            {topSeries.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {topSeries.map(({ series, count }) => {
              const topMax = topSeries[0]?.count ?? 1;
              return (
                <div key={series}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span>{series}</span>
                    <span className="font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(count / topMax) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Export
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Download raw data for accounting or analytics.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `claims-${format(new Date(), "yyyyMMdd")}.csv`,
                  claims.map((c) => ({
                    id: c.id,
                    submitted_at: c.submitted_at,
                    user_id: c.user_id,
                    customer_name: c.customer_name,
                    model_number: c.model_number,
                    serial_number: c.serial_number,
                    sale_date: c.sale_date,
                    status: c.status,
                    payout_amount: c.payout_amount,
                  })),
                )
              }
            >
              <Download className="mr-2 h-4 w-4" /> Export claims (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `payouts-${format(new Date(), "yyyyMMdd")}.csv`,
                  payouts.map((p) => ({
                    id: p.id,
                    reference: p.reference,
                    created_at: p.created_at,
                    user_id: p.user_id,
                    amount: p.amount,
                    status: p.status,
                    settled_at: p.settled_at,
                  })),
                )
              }
            >
              <Download className="mr-2 h-4 w-4" /> Export payouts (CSV)
            </Button>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <Card className="p-5">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
  </Card>
);

export default AdminReports;
