import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in URL hash; client picks it up automatically.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Reset link is invalid or expired", {
          description: "Request a new reset email from your profile.",
        });
      }
      setReady(true);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    setSaving(false);
    if (error) {
      toast.error("Couldn't update password", { description: error.message });
      return;
    }
    toast.success("Password updated");
    navigate("/app", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo variant="dark" />
        </div>
        <h1 className="mt-10 text-center text-3xl font-bold tracking-tight">
          Set a new password
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Choose something you haven't used before.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider">
              New password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="h-12 rounded-xl bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs uppercase tracking-wider">
              Confirm password
            </Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              className="h-12 rounded-xl bg-card"
            />
          </div>
          <Button
            type="submit"
            variant="hero"
            disabled={!ready || saving}
            className="h-14 w-full rounded-2xl text-base"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
