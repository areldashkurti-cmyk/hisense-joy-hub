import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Promo = {
  id: string;
  title: string;
  description: string;
  incentive_amount: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
  eligibility: string | null;
  image_url: string | null;
};

type News = {
  id: string;
  title: string;
  excerpt: string;
  body: string | null;
  image_url: string | null;
  is_banner: boolean;
  published_at: string;
};

const AdminContent = () => {
  return (
    <AdminShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Promotions &amp; news
        </h1>
      </header>

      <Tabs defaultValue="promotions">
        <TabsList>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="news">News posts</TabsTrigger>
        </TabsList>
        <TabsContent value="promotions" className="mt-5">
          <PromotionsManager />
        </TabsContent>
        <TabsContent value="news" className="mt-5">
          <NewsManager />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
};

const PromotionsManager = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Promo> | null>(null);

  const { data: promos = [] } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Promo[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Promo>) => {
      const payload = {
        title: p.title!,
        description: p.description!,
        incentive_amount: Number(p.incentive_amount ?? 0),
        starts_at: p.starts_at!,
        ends_at: p.ends_at!,
        active: p.active ?? true,
        eligibility: p.eligibility ?? null,
        image_url: p.image_url ?? null,
      };
      if (p.id) {
        const { error } = await supabase.from("promotions").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="hero"
          onClick={() =>
            setEditing({
              title: "",
              description: "",
              incentive_amount: 0,
              starts_at: format(new Date(), "yyyy-MM-dd"),
              ends_at: format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd"),
              active: true,
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> New promotion
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        {promos.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No promotions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Incentive</th>
                <th className="px-4 py-3 font-semibold">Window</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">${Number(p.incentive_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(p.starts_at), "MMM d")} →{" "}
                    {format(new Date(p.ends_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">{p.active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"?`)) remove.mutate(p.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit promotion" : "New promotion"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="amt">Incentive ($)</Label>
                  <Input
                    id="amt"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.incentive_amount ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        incentive_amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="starts">Starts</Label>
                  <Input
                    id="starts"
                    type="date"
                    value={editing.starts_at?.slice(0, 10) ?? ""}
                    onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ends">Ends</Label>
                  <Input
                    id="ends"
                    type="date"
                    value={editing.ends_at?.slice(0, 10) ?? ""}
                    onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={editing.active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              disabled={save.isPending}
              onClick={() => editing && save.mutate(editing)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const NewsManager = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<News> | null>(null);

  const { data: news = [] } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false });
      return (data ?? []) as News[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<News>) => {
      const payload = {
        title: p.title!,
        excerpt: p.excerpt!,
        body: p.body ?? null,
        image_url: p.image_url ?? null,
        is_banner: p.is_banner ?? false,
        published_at: p.published_at ?? new Date().toISOString(),
      };
      if (p.id) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-news"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="hero"
          onClick={() =>
            setEditing({
              title: "",
              excerpt: "",
              body: "",
              is_banner: false,
              published_at: new Date().toISOString(),
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> New post
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        {news.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No news posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Banner</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{n.title}</td>
                  <td className="px-4 py-3">{n.is_banner ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(n.published_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(n)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete "${n.title}"?`)) remove.mutate(n.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ntitle">Title</Label>
                <Input
                  id="ntitle"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  rows={2}
                  value={editing.excerpt ?? ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  maxLength={300}
                />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  rows={5}
                  value={editing.body ?? ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  maxLength={5000}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <Label htmlFor="banner">Show as banner on home</Label>
                <Switch
                  id="banner"
                  checked={editing.is_banner ?? false}
                  onCheckedChange={(v) => setEditing({ ...editing, is_banner: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              disabled={save.isPending}
              onClick={() => editing && save.mutate(editing)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminContent;
