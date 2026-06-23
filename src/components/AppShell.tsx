import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  LifeBuoy,
  User as UserIcon,
  LogOut,
  Plus,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/claims/new", label: "Submit claim", icon: Plus },
  { to: "/app/dashboard", label: "Dashboard", icon: Wallet },
  { to: "/app/support", label: "Support", icon: LifeBuoy },
  { to: "/app/profile", label: "Profile", icon: UserIcon },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  const navItems = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link to="/app" aria-label="Hisense Rewards home">
          <Logo variant="dark" size="sm" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card px-5 py-7 lg:flex lg:flex-col">
          <Link to="/app" aria-label="Hisense Rewards home" className="mb-10">
            <Logo variant="dark" />
          </Link>
          {navItems}
          <div className="mt-auto space-y-3 pt-6">
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4" /> Admin portal
                </Link>
              </Button>
            )}
            <div className="truncate rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-x-0 top-16 z-30 border-b border-border bg-background px-4 py-4 lg:hidden">
            {navItems}
            <div className="mt-4 border-t border-border pt-4">
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="mb-3 w-full justify-start gap-2">
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <ShieldCheck className="h-4 w-4" /> Admin portal
                  </Link>
                </Button>
              )}
              <div className="mb-3 truncate text-xs text-muted-foreground">
                {user?.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
