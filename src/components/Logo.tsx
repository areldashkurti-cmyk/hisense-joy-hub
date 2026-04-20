import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, variant = "light", size = "md" }: LogoProps) => {
  const textColor =
    variant === "light" ? "text-ink-foreground" : "text-foreground";

  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  const subClass = {
    sm: "text-[9px]",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  return (
    <div className={cn("inline-flex flex-col items-start leading-none", className)}>
      <span className={cn("font-black tracking-tighter", sizeClass, textColor)}>
        Hisense
      </span>
      <span
        className={cn(
          "mt-1 font-semibold uppercase tracking-[0.25em] text-primary",
          subClass,
        )}
      >
        Rewards
      </span>
    </div>
  );
};
