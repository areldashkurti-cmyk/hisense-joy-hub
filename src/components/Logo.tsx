import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export const Logo = ({ className, variant = "light" }: LogoProps) => {
  const textColor =
    variant === "light" ? "text-ink-foreground" : "text-foreground";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow">
        <div className="h-3.5 w-3.5 rotate-45 rounded-sm bg-ink/80" />
      </div>
      <span className={cn("text-xl font-bold tracking-tight", textColor)}>
        HiPro<span className="text-primary">+</span>
      </span>
    </div>
  );
};
