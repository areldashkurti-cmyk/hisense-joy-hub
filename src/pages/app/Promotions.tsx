import { format, parseISO } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { useMyPromotions } from "@/hooks/useMyPromotions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Promotions = () => {
  const { data = [], isLoading } = useMyPromotions();
  const ids = [...new Set(data.map((p) => p.promotion_id))];
  const { data: meta = [] } = useQuery({
    queryKey: ["my-promo-meta", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("distributor_promotions").select("id,start_date").in("id", ids);
      return data ?? [];
    },
  });
  const groups = ids.map((id) => {
    const rows = data.filter((p) => p.promotion_id === id);
    return { id, name: rows[0].name, amount: rows[0].extra_amount, end: rows[0].end_date,
      start: meta.find((m) => m.id === id)?.start_date, products: rows.map((r) => r.model_number) };
  });

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Earn more</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Your promotions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Extra rewards paid on top of the standard amount for these products.</p>
      </header>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : groups.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No active promotions for you right now.</Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.id} className="border-primary/40 p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{g.name}</h2>
                <span className="text-xl font-bold text-primary">+${Number(g.amount).toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {g.start ? format(parseISO(g.start), "MMM d, yyyy") : ""} - {format(parseISO(g.end), "MMM d, yyyy")}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.products.map((m) => (
                  <span key={m} className="rounded-md bg-secondary px-2 py-1 font-mono text-xs">{m}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Promotions;
