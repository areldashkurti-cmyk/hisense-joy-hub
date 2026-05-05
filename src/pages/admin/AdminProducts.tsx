import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Search, Loader2 } from "lucide-react";
import { z } from "zod";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Product = {
  id: string;
  series: string;
  category: string | null;
  model_number: string;
  compatible_model: string | null;
  product_type: string | null;
  payout_rate: number | null;
  active: boolean;
};

const schema = z.object({
  series: z.string().trim().min(1).max(60),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  model_number: z.string().trim().min(1).max(60),
  compatible_model: z.string().trim().max(80).optional().or(z.literal("")),
  product_type: z.string().trim().max(40).optional().or(z.literal("")),
  payout_rate: z.coerce.number().nonnegative().optional().or(z.nan()),
  active: z.boolean(),
});

const blank: Product = {
  id: "",
  series: "",
  category: "",
  model_number: "",
  compatible_model: "",
  product_type: "",
  payout_rate: null,
  active: true,
};

const AdminProducts = () => {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,series,category,model_number,compatible_model,product_type,payout_rate,active")
        .order("series")
        .order("model_number")
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      [p.series, p.category, p.model_number, p.compatible_model, p.product_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [products, q]);

  const save = useMutation({
    mutationFn: async (p: Product) => {
      const parsed = schema.safeParse(p);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const payload = {
        series: parsed.data.series,
        category: parsed.data.category || null,
        model_number: parsed.data.model_number,
        compatible_model: parsed.data.compatible_model || null,
        product_type: parsed.data.product_type || null,
        payout_rate: Number.isFinite(parsed.data.payout_rate as number) ? parsed.data.payout_rate : null,
        active: parsed.data.active,
      };
      if (p.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await supabase
        .from("products")
        .update({ active: !p.active })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Admin</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the catalog used in the claim form.
          </p>
        </div>
        <Button variant="hero" onClick={() => setEditing({ ...blank })}>
          <Plus className="mr-1 h-4 w-4" /> New product
        </Button>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search model #, series, category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} items</span>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Hisense Model# to order</th>
                  <th className="px-4 py-3 font-semibold">Compatible Model#</th>
                  <th className="px-4 py-3 font-semibold">Series</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Payout Rate</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{p.model_number}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.compatible_model ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{p.series}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.product_type ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.payout_rate != null ? `$${Number(p.payout_rate).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={p.active} onCheckedChange={() => toggleActive.mutate(p)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hisense Model# to order *">
                <Input value={editing.model_number} onChange={(e) => setEditing({ ...editing, model_number: e.target.value })} className="font-mono" />
              </Field>
              <Field label="Compatible Model#">
                <Input value={editing.compatible_model ?? ""} onChange={(e) => setEditing({ ...editing, compatible_model: e.target.value })} className="font-mono" />
              </Field>
              <Field label="Series *">
                <Input value={editing.series} onChange={(e) => setEditing({ ...editing, series: e.target.value })} />
              </Field>
              <Field label="Category">
                <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              </Field>
              <Field label="Type">
                <Input value={editing.product_type ?? ""} onChange={(e) => setEditing({ ...editing, product_type: e.target.value })} />
              </Field>
              <Field label="Payout Rate ($)">
                <Input
                  type="number" step="0.01"
                  value={editing.payout_rate ?? ""}
                  onChange={(e) => setEditing({ ...editing, payout_rate: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </Field>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label>Active (visible in claim form)</Label>
                {!editing.active && <Badge variant="secondary">Hidden</Badge>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="hero" disabled={save.isPending} onClick={() => editing && save.mutate(editing)}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider">{label}</Label>
    {children}
  </div>
);

export default AdminProducts;
