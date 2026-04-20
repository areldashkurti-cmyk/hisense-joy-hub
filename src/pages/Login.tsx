import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Welcome back!", {
      description: "Sign-in is not wired up yet — coming soon.",
    });
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container flex h-20 items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 pb-20 pt-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>

          <div className="mt-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your HiPro account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                className="h-12 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wider"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-12 rounded-xl bg-card"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="h-14 w-full rounded-2xl text-base"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to HiPro?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
