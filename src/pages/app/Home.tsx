import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Newspaper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const Home = () => {
  const { user, isReady } = useAuth();

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
          title="View card"
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
