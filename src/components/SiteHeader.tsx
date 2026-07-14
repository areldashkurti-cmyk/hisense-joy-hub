import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" aria-label="Hi-PRO+ home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/program"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-foreground/80 transition-colors hover:text-ink-foreground sm:inline-block"
          >
            Program
          </Link>
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-foreground/80 transition-colors hover:text-ink-foreground"
          >
            Sign in
          </Link>
          <Button asChild variant="hero" size="pill">
            <Link to="/register">Join Hi-PRO</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
