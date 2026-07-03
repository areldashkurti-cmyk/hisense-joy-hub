import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(20).optional(),
  street: z.string().trim().max(200).optional(),
  apt: z.string().trim().max(60).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(40).optional(),
  postal: z.string().trim().max(12).optional(),
  country: z.string(),
});

const Profile = () => {
  const { user, isReady } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, distributors(name, code)")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [country, setCountry] = useState("US");
  useEffect(() => {
    if (profile?.country) setCountry(profile.country);
  }, [profile?.country]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      phone: (fd.get("phone") as string) || "",
      street: (fd.get("street") as string) || "",
      apt: (fd.get("apt") as string) || "",
      city: (fd.get("city") as string) || "",
      state: (fd.get("state") as string) || "",
      postal: (fd.get("postal") as string) || "",
      country,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone,
        street: parsed.data.street,
        apt: parsed.data.apt,
        city: parsed.data.city,
        state: parsed.data.state,
        postal_code: parsed.data.postal,
        country: parsed.data.country,
      })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      toast.error("Couldn't save", { description: error.message });
      return;
    }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const onResetPassword = async () => {
    if (!user?.email) return;
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) {
      toast.error("Couldn't send reset email", { description: error.message });
      return;
    }
    toast.success("Password reset email sent", {
      description: `Check ${user.email}.`,
    });
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Account
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          My profile
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage your contact details, mailing address, and password.
        </p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading profile…</p>
      ) : (
        <div className="space-y-8">
          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Personal details</h2>
                <p className="text-sm text-muted-foreground">
                  Your email address is used to sign in and can't be changed
                  here.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label="First name"
                  defaultValue={profile?.first_name ?? ""}
                />
                <Field
                  id="lastName"
                  label="Last name"
                  defaultValue={profile?.last_name ?? ""}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="email" label="Email" defaultValue={user?.email ?? ""} disabled />
                <Field
                  id="phone"
                  label="Phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">
                  Distributor
                </Label>
                <div className="flex h-12 items-center rounded-xl border border-border bg-secondary/50 px-4 text-sm">
                  {profile?.distributors
                    ? `${profile.distributors.name} (${profile.distributors.code})`
                    : "Not assigned — contact support"}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold">Mailing address</h2>
                <p className="text-sm text-muted-foreground">
                  Where physical rewards and program materials are sent.
                </p>

                <div className="mt-5 space-y-5">
                  <Field id="street" label="Street address" defaultValue={profile?.street ?? ""} />
                  <Field
                    id="apt"
                    label="Apt, suite, etc. (optional)"
                    defaultValue={profile?.apt ?? ""}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="city" label="City" defaultValue={profile?.city ?? ""} />
                    <Field
                      id="state"
                      label="State / Province"
                      defaultValue={profile?.state ?? ""}
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="postal"
                      label="Postal / ZIP code"
                      defaultValue={profile?.postal_code ?? ""}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-xs uppercase tracking-wider">
                        Country
                      </Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger id="country" className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                disabled={saving}
                className="h-12 w-full rounded-xl sm:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </Card>

          <Card className="space-y-4 p-6 sm:p-8">
            <div>
              <h2 className="text-lg font-semibold">Password</h2>
              <p className="text-sm text-muted-foreground">
                Send yourself a secure password reset link.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onResetPassword}
              disabled={resetting}
              className="h-11 rounded-xl"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send password reset email"
              )}
            </Button>
          </Card>

          <RedeemInvitationCode />
        </div>
      )}
    </AppShell>
  );
};

const RedeemInvitationCode = () => {
  const { user, isReady } = useAuth();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["my-bonus", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("registration_bonuses")
        .select("amount, claimed_at")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const onRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("redeem_bonus_code", {
      _code: code.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't redeem code", { description: error.message });
      return;
    }
    const amount = Array.isArray(data) && data[0]?.amount ? Number(data[0].amount) : 100;
    toast.success("Bonus redeemed!", {
      description: `$${amount.toFixed(2)} has been added to your account.`,
    });
    setCode("");
    qc.invalidateQueries({ queryKey: ["my-bonus"] });
  };

  if (existing) {
    return (
      <Card className="space-y-2 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Sign-on bonus</h2>
        <p className="text-sm text-muted-foreground">
          You redeemed a ${Number(existing.amount).toFixed(2)} sign-on bonus.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-6 sm:p-8">
      <div>
        <h2 className="text-lg font-semibold">Invitation code</h2>
        <p className="text-sm text-muted-foreground">
          Received a private invitation code from Hisense? Enter it here to redeem your sign-on bonus.
        </p>
      </div>
      <form onSubmit={onRedeem} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX"
          maxLength={40}
          className="h-11 rounded-xl sm:max-w-xs"
        />
        <Button
          type="submit"
          variant="hero"
          disabled={submitting || !code.trim()}
          className="h-11 rounded-xl"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem code"}
        </Button>
      </form>
    </Card>
  );
};

const Field = ({
  id,
  label,
  type = "text",
  defaultValue,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  defaultValue?: string;
  disabled?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs uppercase tracking-wider">
      {label}
    </Label>
    <Input
      id={id}
      name={id}
      type={type}
      defaultValue={defaultValue}
      disabled={disabled}
      className="h-12 rounded-xl"
    />
  </div>
);

export default Profile;
