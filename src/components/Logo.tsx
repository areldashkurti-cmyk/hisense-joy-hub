import { cn } from "@/lib/utils";
import logoTeal from "@/assets/hisense-logo.png";
import logoWhite from "@/assets/hisense-logo-white.png";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo = ({
  className,
  variant = "light",
  size = "md",
  showTagline = true,
}: LogoProps) => {
  // "light" = on dark background → use white logo. "dark" = on light bg → teal logo.
  const src = variant === "light" ? logoWhite : logoTeal;

  const sizeClass = {
    sm: "h-6",
    md: "h-9",
    lg: "h-12",
  }[size];

  const taglineClass = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  }[size];

  const taglineColor =
    variant === "light" ? "text-ink-foreground/80" : "text-foreground/70";

  return (
    <div className={cn("inline-flex flex-col items-start leading-none", className)}>
      <img
        src={src}
        alt="Hisense"
        className={cn("w-auto object-contain", sizeClass)}
        loading="eager"
        decoding="async"
      />
      {showTagline && (
        <span
          className={cn(
            "mt-1.5 font-semibold uppercase tracking-[0.18em]",
            taglineClass,
            taglineColor,
          )}
        >
          Hi-PRO Contractor Rewards
        </span>
      )}
    </div>
  );
};
