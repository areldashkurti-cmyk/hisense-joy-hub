import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PromoRow = {
  id: string;
  name: string;
  distributor_scope: "all" | "selected";
  extra_amount: number;
  start_date: string;
  end_date: string;
  active: boolean;
  distributor_promotion_products: { product_id: string }[];
  distributor_promotion_distributors: { distributor_id: string }[];
  distributor_promotion_dealers: { user_id: string }[];
};

export const promoStatus = (p: { active: boolean; start_date: string; end_date: string }) => {
  const today = new Date().toISOString().slice(0, 10);
  if (!p.active) return "Inactive";
  if (today < p.start_date) return "Scheduled";
  if (today > p.end_date) return "Expired";
  return "Running";
};

const statusClass: Record<string, string> = {
  Running: "bg-success/15 text-success border-success/30",
  Scheduled: "bg-primary/15 text-primary border-primary/30",
  Expired: "bg-muted text-muted-foreground",
  Inactive: "bg-muted text-muted-foreground",
};

export const usePromoLookups = () =>
  useQuery({
    queryKey: ["promo-lookups"],
    queryFn: async () => {
      const [p, d, u] = await Promise.all([
        supabase.from("products").select("id,model_number,series,payout_rate").order("model_number").limit(2000),
        supabase.from("distributors").select("id,code,name").order("code"),
        supabase.from("profiles").select("id,email,distributor_id").order("email").limit(5000),
      ]);
      if (p.error) throw p.error;
      if (d.error) throw d.error;
      if (u.error) throw u.error;
      return { products: p.data ?? [], distributors: d.data ?? [], users: u.data ?? [] };
    },
  });

export const usePromotions = () =>
  useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributor_promotions")
        .select("*, distributor_promotion_products(product_id), distributor_promotion_distributors(distributor_id), distributor_promotion_dealers(user_id)")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PromoRow[];
    },
  });

type Form = {
  id?: string;
  name: string;
  scope: "all" | "selected";
  products: string[];
  distributors: string[];
  dealers: string[];
  extra: string;
  start: string;
  end: string;
  active: boolean;
};

const blank: Form = { name: "", scope: "all", products: [], distributors: [], dealers: [], extra: "", start: "", end: "", active: true };

const AdminPromotions = () => {
  const qc = useQueryClient();
  const { data: promos = [], isLoading } = usePromotions();
  const { data: lk } = usePromoLookups();
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);

  const prodMap = useMemo(() => new Map((lk?.products ?? []).map((p) => [p.id, p])), [lk]);
  const distMap = useMemo(() => new Map((lk?.distributors ?? []).map((d) => [d.id, d])), [lk]);
  const userMap = useMemo(() => new Map((lk?.users ?? []).map((u) => [u.id, u])), [lk]);

  const validate = (f: Form) => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (f.products.length === 0) e.products = "Select at least one product";
    if (f.scope === "selected" && f.distributors.length === 0) e.distributors = "Select at least one distributor";
    const amt = Number(f.extra);
    if (!f.extra || !Number.isFinite(amt) || amt <= 0) e.extra = "Extra amount must be greater than 0";
    if (!f.start) e.start = "Start date is required";
    if (!f.end) e.end = "End date is required";
    if (f.start && f.end && f.end < f.start) e.end = "End date must be on or after start date";
    return e;
  };

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const { data: auth } = await supabase.auth.getUser();
      const payload = {
        name: f.name.trim(),
        distributor_scope: f.scope,
        extra_amount: Number(f.extra),
        start_date: f.start,
        end_date: f.end,
        active: f.active,
      };
      let id = f.id;
      if (id) {
        const { error } = await supabase.from("distributor_promotions").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("distributor_promotions")
          .insert({ ...payload, created_by: auth.user?.id })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
      }
      await supabase.from("distributor_promotion_products").delete().eq("promotion_id", id!);
      await supabase.from("distributor_promotion_distributors").delete().eq("promotion_id", id!);
      await supabase.from("distributor_promotion_dealers").delete().eq("promotion_id", id!);
      const ops = [
        supabase.from("distributor_promotion_products").insert(f.products.map((product_id) => ({ promotion_id: id!, product_id }))),
      ];
      if (f.scope === "selected") {
        ops.push(supabase.from("distributor_promotion_distributors").insert(f.distributors.map((distributor_id) => ({ promotion_id: id!, distributor_id }))) as never);
      }
      if (f.dealers.length) {
        ops.push(supabase.from("distributor_promotion_dealers").insert(f.dealers.map((user_id) => ({ promotion_id: id!, user_id }))) as never);
      }
      const results = await Promise.all(ops);
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    },
    onSuccess: () => {
      toast.success("Promotion saved");
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulk = useMutation({
    mutationFn: async (action: "activate" | "deactivate" | "delete") => {
      const q = supabase.from("distributor_promotions");
      const { error } =
        action === "delete"
          ? await q.delete().in("id", selected)
          : await q.update({ active: action === "activate" }).in("id", selected);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (p: PromoRow) => {
    setErrors({});
    setForm({
      id: p.id,
      name: p.name,
      scope: p.distributor_scope,
      products: p.distributor_promotion_products.map((x) => x.product_id),
      distributors: p.distributor_promotion_distributors.map((x) => x.distributor_id),
      dealers: p.distributor_promotion_dealers.map((x) => x.user_id),
      extra: String(p.extra_amount),
      start: p.start_date,
      end: p.end_date,
      active: p.active,
    });
  };

  const submit = () => {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length === 0) save.mutate(form);
  };

  const eligibleUsers = useMemo(() => {
    if (!lk || !form) return [];
    return lk.users.filter(
      (u) => u.email && (form.scope === "all" ? !!u.distributor_id : form.distributors.includes(u.distributor_id ?? "")),
    );
  }, [lk, form]);

  const listNames = (ids: string[], fn: (id: string) => string | undefined, empty = "-") =>
    ids.length === 0 ? empty : ids.length <= 2 ? ids.map(fn).filter(Boolean).join(", ") : `${fn(ids[0])} +${ids.length - 1}`;

  return (
    <AdminShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Products</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Promotions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Time-limited extra amounts on top of the standard payout rate, targeted by distributor.
          </p>
        </div>
        <Button variant="hero" onClick={() => { setErrors({}); setForm({ ...blank }); }}>
          <Plus className="mr-1 h-4 w-4" /> New promotion
        </Button>
      </header>

      {selected.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulk.mutate("activate")}>Activate</Button>
          <Button size="sm" variant="outline" onClick={() => bulk.mutate("deactivate")}>Deactivate</Button>
          <Button size="sm" variant="outline" onClick={() => confirm("Delete selected promotions? Submitted claims keep their payouts.") && bulk.mutate("delete")}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={promos.length > 0 && selected.length === promos.length}
                      onCheckedChange={(c) => setSelected(c ? promos.map((p) => p.id) : [])}
                    />
                  </th>
                  {["Name", "Products", "Distributors", "Dealers", "Extra Amount", "Start", "End", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => {
                  const st = promoStatus(p);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.includes(p.id)}
                          onCheckedChange={(c) => setSelected((s) => (c ? [...s, p.id] : s.filter((x) => x !== p.id)))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/promotions/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {listNames(p.distributor_promotion_products.map((x) => x.product_id), (id) => prodMap.get(id)?.model_number)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {p.distributor_scope === "all"
                          ? <span className="font-sans">All</span>
                          : listNames(p.distributor_promotion_distributors.map((x) => x.distributor_id), (id) => distMap.get(id)?.code)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {listNames(p.distributor_promotion_dealers.map((x) => x.user_id), (id) => userMap.get(id)?.email ?? undefined, "All")}
                      </td>
                      <td className="px-4 py-3 font-semibold">${Number(p.extra_amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.start_date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.end_date}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={statusClass[st]}>{st}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {promos.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No promotions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form?.id ? "Edit promotion" : "New promotion"}</DialogTitle></DialogHeader>
          {form && lk && (
            <div className="space-y-5">
              <Field label="Name *" error={errors.name}>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Q4 Ferguson Hi Edge bonus" />
              </Field>

              <Field label="Products *" error={errors.products}>
                <MultiPicker
                  items={lk.products.map((p) => ({ id: p.id, label: p.model_number, sub: p.series }))}
                  value={form.products}
                  onChange={(products) => setForm({ ...form, products })}
                  placeholder="Search Hisense Model# or Series"
                />
              </Field>

              <Field label="Distributors" error={errors.distributors}>
                <RadioGroup
                  value={form.scope}
                  onValueChange={(v) => setForm({ ...form, scope: v as Form["scope"], dealers: [] })}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="all" /> All distributors</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="selected" /> Select distributors</label>
                </RadioGroup>
                {form.scope === "selected" && (
                  <div className="mt-2">
                    <MultiPicker
                      items={lk.distributors.map((d) => ({ id: d.id, label: d.code, sub: d.name }))}
                      value={form.distributors}
                      onChange={(distributors) => {
                        const allowed = new Set(lk.users.filter((u) => distributors.includes(u.distributor_id ?? "")).map((u) => u.id));
                        setForm({ ...form, distributors, dealers: form.dealers.filter((d) => allowed.has(d)) });
                      }}
                      placeholder="Search distributor code"
                    />
                  </div>
                )}
              </Field>

              <Field label="Dealers (optional)">
                <p className="mb-2 text-xs text-muted-foreground">Leave empty to include every dealer under the chosen distributor(s).</p>
                <MultiPicker
                  items={eligibleUsers.map((u) => ({ id: u.id, label: u.email!, sub: distMap.get(u.distributor_id ?? "")?.code }))}
                  value={form.dealers}
                  onChange={(dealers) => setForm({ ...form, dealers })}
                  placeholder="Search registered email"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Extra amount (USD) *" error={errors.extra}>
                  <Input type="number" min="0" step="0.01" value={form.extra} onChange={(e) => setForm({ ...form, extra: e.target.value })} />
                </Field>
                <Field label="Start date *" error={errors.start}>
                  <Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </Field>
                <Field label="End date *" error={errors.end}>
                  <Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                </Field>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} /> Active
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button variant="hero" onClick={submit} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider">{label}</Label>
    {children}
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const MultiPicker = ({
  items, value, onChange, placeholder,
}: {
  items: { id: string; label: string; sub?: string | null }[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) => {
  const [q, setQ] = useState("");
  const byId = new Map(items.map((i) => [i.id, i]));
  const s = q.trim().toLowerCase();
  const shown = items.filter((i) => !s || i.label.toLowerCase().includes(s) || (i.sub ?? "").toLowerCase().includes(s)).slice(0, 100);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="rounded-lg border border-border">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border p-2">
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => toggle(id)}>
              {byId.get(id)?.label ?? id} ×
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="rounded-none border-0 pl-9 focus-visible:ring-0" />
      </div>
      <div className="max-h-44 overflow-y-auto border-t border-border">
        {shown.length === 0 && <p className="p-3 text-xs text-muted-foreground">No matches.</p>}
        {shown.map((i) => (
          <label key={i.id} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary">
            <Checkbox checked={value.includes(i.id)} onCheckedChange={() => toggle(i.id)} />
            <span className="font-mono text-xs">{i.label}</span>
            {i.sub && <span className="text-xs text-muted-foreground">{i.sub}</span>}
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
