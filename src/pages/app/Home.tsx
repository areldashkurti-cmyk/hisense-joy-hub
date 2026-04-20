import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Newspaper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Home = () => {
  const { user, isReady } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["news-banners"],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .eq("is_banner", true)
        .order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: news = [] } = useQuery({
    queryKey: ["news"],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  // Auto-rotate banner
  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(
      () => setActiveBanner((i) => (i + 1) % banners.length),
      6000,
    );
    return () => clearInterval(id);
  }, [banners.length]);

  const banner = banners[activeBanner];

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Welcome back
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {profile?.first_name ? `Hi, ${profile.first_name}.` : "Hi there."}
        </h1>
      </header>

      {/* Dynamic banner */}
      {banner && (
        <Card className="relative overflow-hidden border-0 bg-ink bg-hero p-8 text-ink-foreground sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full border border-ink-border bg-ink-card/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary backdrop-blur">
              Featured
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
              {banner.title}
            </h2>
            <p className="mt-3 text-ink-muted">{banner.excerpt}</p>
            <Button asChild variant="hero" size="pill" className="mt-6">
              <Link to="/app/promotions">
                See promotions <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBanner(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeBanner
                      ? "w-8 bg-primary"
                      : "w-2 bg-ink-foreground/30 hover:bg-ink-foreground/60",
                  )}
                  aria-label={`Show banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Quick stats / shortcuts */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ShortcutCard
          to="/app/claims/new"
          eyebrow="Quick action"
          title="Submit a claim"
          body="Upload a proof of purchase and get paid faster."
        />
        <ShortcutCard
          to="/app/dashboard"
          eyebrow="Wallet"
          title="View virtual card"
          body="Check your balance and recent transactions."
        />
        <ShortcutCard
          to="/app/promotions"
          eyebrow="Earn more"
          title="Active promotions"
          body="See limited-time bonuses on Hisense systems."
        />
      </div>

      {/* Latest news */}
      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Newspaper className="h-5 w-5 text-primary" />
            Latest news
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((post) => (
            <Card key={post.id} className="p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {format(new Date(post.published_at), "MMM d, yyyy")}
              </p>
              <h3 className="mt-2 text-base font-semibold leading-snug">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

const ShortcutCard = ({
  to,
  eyebrow,
  title,
  body,
}: {
  to: string;
  eyebrow: string;
  title: string;
  body: string;
}) => (
  <Link to={to}>
    <Card className="group h-full p-6 transition-all hover:border-primary/40 hover:shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
    </Card>
  </Link>
);

export default Home;
