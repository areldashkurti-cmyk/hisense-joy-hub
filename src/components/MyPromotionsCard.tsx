import { Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { useMyPromotions } from "@/hooks/useMyPromotions";

export const MyPromotionsCard = () => {
  const { data = [] } = useMyPromotions();
  if (data.length === 0) return null;
  return (
    <Card className="mb-8 border-primary/40 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Your active promotions</h2>
      </div>
      <ul className="divide-y divide-border">
        {data.map((p) => (
          <li key={p.product_id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div>
              <span className="font-mono font-semibold">{p.model_number}</span>
              <span className="ml-2 text-muted-foreground">{p.series}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-primary">+${Number(p.extra_amount).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">
                Ends {format(parseISO(p.end_date), "MMM d, yyyy")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};
