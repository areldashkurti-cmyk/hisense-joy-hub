import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: String(formData.get("email") ?? "") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error("Couldn't send reset email", { description: error.message });
      return;
    }
    setSent(true);
    toast.success("Check your inbox for the reset link.");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container flex h-20 items-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 pb-20 pt-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>

          <div className="mt-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Reset password</h1>
            <p className="mt-2 text-muted-foreground">
              {sent
                ? "If an account exists for that email, a reset link is on its way."
                : "Enter your email and we'll send you a link to reset your password."}
            </p>
          </div>

          {!sent && (
            <form onSubmit={onSubmit} className="mt-10 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  className="h-12 rounded-xl bg-card"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                disabled={loading}
                className="h-14 w-full rounded-2xl text-base"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
