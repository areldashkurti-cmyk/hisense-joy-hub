import { Logo } from "@/components/Logo";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo variant="dark" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hisense Comfort · HiPro Contractor
          Rewards Program. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
