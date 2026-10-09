import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MyPromotion = {
  promotion_id: string;
  product_id: string;
  model_number: string;
  series: string;
  name: string;
  extra_amount: number;
  end_date: string;
};

/** Promotions the signed-in dealer is eligible for today (filtered server-side). */
export const useMyPromotions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-promotions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_promotions");
      if (error) throw error;
      return (data ?? []) as MyPromotion[];
    },
  });
};
