import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Promotions = () => {
  const { user, isReady } = useAuth();
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["promotions"],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("active", true)
        .order("ends_at", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Earn more
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Active promotions
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Stack these limited-time incentives on top of your standard rewards.
          New promotions are added every month.
        </p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading promotions…</p>
      ) : promos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No active promotions right now. Check back soon.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {promos.map((p) => (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="bg-ink bg-hero p-8 text-ink-foreground">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                      Active
                    </Badge>
                    <h2 className="mt-3 text-2xl font-bold leading-tight">
                      {p.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                      Bonus
                    </p>
                    <p className="text-3xl font-black text-primary">
                      ${Number(p.incentive_amount).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-foreground">{p.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(p.starts_at), "MMM d")} –{" "}
                    {format(new Date(p.ends_at), "MMM d, yyyy")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Per qualifying install
                  </span>
                </div>
                {p.eligibility && (
                  <div className="rounded-xl border border-border bg-secondary/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Eligibility
                    </p>
                    <p className="mt-1 text-sm">{p.eligibility}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Promotions;
