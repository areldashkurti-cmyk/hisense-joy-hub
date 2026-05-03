import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardList,
  Banknote,
  BarChart3,
  Users,
  Megaphone,
  Package,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/admin", label: "Claims queue", icon: ClipboardList, end: true },
  { to: "/admin/payouts", label: "Payouts", icon: Banknote },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Users & cards", icon: Users },
  { to: "/admin/content", label: "Promotions & news", icon: Megaphone },
  { to: "/admin/products", label: "Products", icon: Package },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card px-5 py-7 lg:flex lg:flex-col">
          <Link to="/admin" aria-label="HiPro Admin home" className="mb-2">
            <Logo variant="dark" />
          </Link>
          <div className="mb-8 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin portal
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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
          <div className="mt-auto space-y-3 pt-6">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Link to="/app">
                <ArrowLeft className="h-4 w-4" /> Back to app
              </Link>
            </Button>
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

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Link to="/admin" aria-label="HiPro Admin home">
            <Logo variant="dark" size="sm" />
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app">App</Link>
          </Button>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
