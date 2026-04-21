import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useUserRole = () => {
  const { user, isReady } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data?.map((r) => r.role) ?? [];
    },
  });

  return {
    roles,
    isAdmin: roles.includes("admin"),
    isLoading: !isReady || isLoading,
  };
};
