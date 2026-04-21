import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady } = useAuth();
  const { isAdmin, isLoading } = useUserRole();

  if (!isReady || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo variant="dark" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return <>{children}</>;
};
