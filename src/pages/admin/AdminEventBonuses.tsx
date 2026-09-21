import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, PartyPopper } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const AdminEventBonuses = () => {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "credited" | "pending">("all");

  const { data: rows = [] } = useQuery({
    queryKey: ["event-attendees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_attendees")
        .select("*")
        .order("last_name", { ascending: true });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "credited" && !r.credited_user_id) return false;
      if (tab === "pending" && r.credited_user_id) return false;
      if (!term) return true;
      return [r.first_name, r.last_name, r.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [rows, q, tab]);

  const credited = rows.filter((r) => r.credited_user_id).length;
  const totalPaid = rows
    .filter((r) => r.credited_user_id)
    .reduce((s, r) => s + Number(r.bonus_amount), 0);

  const exportCsv = () => {
    const header = ["First name", "Last name", "Email", "Bonus", "Status", "Credited at"];
    const lines = filtered.map((r) =>
      [
        r.first_name ?? "",
        r.last_name ?? "",
        r.email,
        Number(r.bonus_amount).toFixed(2),
        r.credited_user_id ? "Registered / credited" : "Not registered",
        r.credited_at ? format(new Date(r.credited_at), "yyyy-MM-dd HH:mm") : "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-registration-bonuses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Reconciliation
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Event registration bonuses
          </h1>
        </div>
        <Button variant="outline" size="pill" onClick={exportCsv}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Eligible attendees" value={rows.length.toString()} />
        <Stat label="Registered & credited" value={credited.toString()} />
        <Stat label="Total credited" value={`$${totalPaid.toFixed(2)}`} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="credited">Credited</TabsTrigger>
            <TabsTrigger value="pending">Not registered</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} />
        </Tabs>
        <Input
          placeholder="Search name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-11 max-w-xs rounded-xl bg-card"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Attendee</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Credited</th>
              <th className="px-4 py-3 text-right font-semibold">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No attendees match this view.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {[r.first_name, r.last_name].filter(Boolean).join(" ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        r.credited_user_id
                          ? "rounded-full bg-primary/15 font-semibold text-primary"
                          : "rounded-full bg-secondary font-semibold text-secondary-foreground"
                      }
                    >
                      {r.credited_user_id ? "Registered" : "Not registered"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.credited_at ? format(new Date(r.credited_at), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${Number(r.bonus_amount).toFixed(2)}
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

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <PartyPopper className="h-4 w-4 text-primary" />
    </div>
    <p className="mt-2 text-3xl font-bold">{value}</p>
  </Card>
);

export default AdminEventBonuses;
