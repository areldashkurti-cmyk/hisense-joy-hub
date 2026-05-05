import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, EyeOff, Pencil, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { formatCardNumber } from "@/lib/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  apt: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
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

type Role = "admin" | "contractor";

const AdminUsers = () => {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Profile | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile> & { isAdmin?: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const [deletingNow, setDeletingNow] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, street, apt, city, state, postal_code, country, created_at")
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

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-users-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role");
      return (data ?? []) as { user_id: string; role: Role }[];
    },
  });

  const cardMap = new Map(cards.map((c) => [c.user_id, c]));
  const adminSet = useMemo(
    () => new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id)),
    [roles],
  );

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

  useEffect(() => {
    if (editing) {
      setEditForm({
        first_name: editing.first_name ?? "",
        last_name: editing.last_name ?? "",
        email: editing.email ?? "",
        phone: editing.phone ?? "",
        street: editing.street ?? "",
        apt: editing.apt ?? "",
        city: editing.city ?? "",
        state: editing.state ?? "",
        postal_code: editing.postal_code ?? "",
        country: editing.country ?? "",
        isAdmin: adminSet.has(editing.id),
      });
    }
  }, [editing, adminSet]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          first_name: editForm.first_name || null,
          last_name: editForm.last_name || null,
          email: editForm.email || null,
          phone: editForm.phone || null,
          street: editForm.street || null,
          apt: editForm.apt || null,
          city: editForm.city || null,
          state: editForm.state || null,
          postal_code: editForm.postal_code || null,
          country: editForm.country || null,
        })
        .eq("id", editing.id);
      if (pErr) throw pErr;

      const wasAdmin = adminSet.has(editing.id);
      if (editForm.isAdmin && !wasAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: editing.id, role: "admin" });
        if (error) throw error;
      } else if (!editForm.isAdmin && wasAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editing.id)
          .eq("role", "admin");
        if (error) throw error;
      }

      toast.success("User updated");
      setEditing(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-users-profiles"] }),
        qc.invalidateQueries({ queryKey: ["admin-users-roles"] }),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingNow(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: deleting.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("User deleted");
      setDeleting(null);
      setActive((a) => (a?.id === deleting.id ? null : a));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-users-profiles"] }),
        qc.invalidateQueries({ queryKey: ["admin-users-cards"] }),
        qc.invalidateQueries({ queryKey: ["admin-users-txs"] }),
        qc.invalidateQueries({ queryKey: ["admin-users-roles"] }),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
    } finally {
      setDeletingNow(false);
    }
  };

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
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Card</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const card = cardMap.get(p.id);
                const isAdmin = adminSet.has(p.id);
                const isSelf = currentUser?.id === p.id;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isAdmin
                            ? "inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                            : "inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {isAdmin ? "Admin" : "Contractor"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {card ? `•••• ${card.card_last4}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${(balances.get(p.id) ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(p.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditing(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          disabled={isSelf}
                          title={isSelf ? "You cannot delete your own account" : "Delete user"}
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(active)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={currentUser?.id === active.id}
                  onClick={() => setDeleting(active)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </Button>
              </div>

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

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile details, address, and role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={editForm.first_name ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={editForm.last_name ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                value={editForm.street ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, street: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apt">Apt / Suite</Label>
              <Input
                id="apt"
                value={editForm.apt ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, apt: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editForm.city ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={editForm.state ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postal_code">Postal code</Label>
              <Input
                id="postal_code"
                value={editForm.postal_code ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, postal_code: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={editForm.country ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={editForm.isAdmin ? "admin" : "contractor"}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, isAdmin: v === "admin" }))
                }
                disabled={editing?.id === currentUser?.id}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {editing?.id === currentUser?.id && (
                <p className="text-xs text-muted-foreground">
                  You cannot change your own role.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-semibold">
                {[deleting?.first_name, deleting?.last_name].filter(Boolean).join(" ") ||
                  deleting?.email}
              </span>{" "}
              and all of their claims, transactions, payouts, and cards. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingNow}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deletingNow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingNow ? "Deleting…" : "Delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
