import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export const Logo = ({ className, variant = "light" }: LogoProps) => {
  const textColor =
    variant === "light" ? "text-ink-foreground" : "text-foreground";

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span className={cn("text-2xl font-black tracking-tighter", textColor)}>
        Hisense
      </span>
      <span className="text-xs font-medium tracking-widest text-primary uppercase">
        rewards
      </span>
    </div>
  );
};
