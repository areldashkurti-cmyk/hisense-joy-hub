import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
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
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RegistrationBonusCard } from "@/components/RegistrationBonusCard";


const phoneRegex = /^[+()\-.\s\d]{7,20}$/;

const DISTRIBUTOR_CODES = [
  "20143098JS",
  "581392AS",
  "514990CR",
  "518143PL",
  "514992PO",
  "518163CF",
  "518444DA",
  "514797RS",
  "518731VI",
  "515218BA",
] as const;
const OTHER_CODE = "__OTHER__";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().min(1, "Last name is required").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid US/CA phone").max(20),
    distributorCode: z.string().trim().min(1, "Distributor code is required").max(40),
    street: z.string().trim().min(1, "Street is required").max(200),
    apt: z.string().trim().max(60).optional(),
    city: z.string().trim().min(1, "City is required").max(80),
    state: z.string().trim().min(1, "State is required").max(40),
    postal: z.string().trim().min(3, "Postal code is required").max(12),
    country: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

const Register = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  const [selection, setSelection] = useState<string>("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isOther = selection === OTHER_CODE;
  const effectiveCode = useMemo(
    () => (isOther ? customCode.trim().toUpperCase() : selection),
    [isOther, customCode, selection],
  );

  useEffect(() => {
    if (isReady && user) navigate("/app", { replace: true });
  }, [isReady, user, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      distributorCode: effectiveCode,
      street: fd.get("street"),
      apt: fd.get("apt") || "",
      city: fd.get("city"),
      state: fd.get("state"),
      postal: fd.get("postal"),
      country: fd.get("country") || "US",
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
    });

    if (!selection) {
      toast.error("Please select your distributor");
      return;
    }
    if (isOther && !customCode.trim()) {
      toast.error("Enter your distributor code");
      return;
    }
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the form");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
          distributor_code: parsed.data.distributorCode,
          street: parsed.data.street,
          apt: parsed.data.apt,
          city: parsed.data.city,
          state: parsed.data.state,
          postal_code: parsed.data.postal,
          country: parsed.data.country,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Couldn't create account", { description: error.message });
      return;
    }
    toast.success("Account created!", {
      description: "You're all set — welcome to Hisense Rewards.",
    });
    navigate("/app", { replace: true });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink bg-hero p-12 lg:flex">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>

        <div>
          <Logo />
          <h2 className="mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight text-ink-foreground">
            Join the program built for HVAC pros.
          </h2>
          <p className="mt-4 max-w-md text-ink-muted">
            Earn rewards on every qualified Hisense Comfort installation. Track
            every claim. Get paid faster.
          </p>
        </div>

        <div className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Hisense Comfort
        </div>
      </aside>

      <section className="overflow-y-auto bg-background px-6 py-12 sm:px-12">
        <div className="mx-auto max-w-xl">
          <div className="lg:hidden mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="mt-6">
              <Logo variant="dark" />
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            It takes less than a minute. You'll need your distributor code.
          </p>

          <RegistrationBonusCard preview className="mt-8" />

          <form onSubmit={onSubmit} className="mt-10 space-y-6">

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="firstName" label="First name" placeholder="Jordan" />
              <Field id="lastName" label="Last name" placeholder="Cooper" />
            </div>

            <Field id="email" label="Email" type="email" placeholder="you@company.com" />
            <Field
              id="phone"
              label="Phone (US/CAN)"
              type="tel"
              placeholder="(555) 123-4567"
            />

            <div className="space-y-2">
              <Label htmlFor="distributorCode" className="text-xs uppercase tracking-wider">
                Distributor / Customer number
              </Label>
              <Select value={selection} onValueChange={setSelection}>
                <SelectTrigger id="distributorCode" className="h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Select your customer number" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTOR_CODES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_CODE}>
                    Other / I do not know my customer number
                  </SelectItem>
                </SelectContent>
              </Select>

              {isOther && (
                <div className="space-y-2 pt-2">
                  <Input
                    placeholder="Enter your distributor code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    maxLength={40}
                    className="h-12 rounded-xl bg-card"
                  />
                  <p className="text-xs text-muted-foreground">
                    We will review this code to ensure it is eligible.
                  </p>
                </div>
              )}

              {!isOther && (
                <p className="text-xs text-muted-foreground">
                  Provided by your authorized Hisense distributor.
                </p>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold">Mailing address</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Where we'll ship physical rewards and program materials.
              </p>

              <div className="mt-5 space-y-5">
                <Field id="street" label="Street address" placeholder="123 Main St" />
                <Field
                  id="apt"
                  label="Apt, suite, etc. (optional)"
                  placeholder="Suite 200"
                  required={false}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="city" label="City" placeholder="Las Vegas" />
                  <Field id="state" label="State / Province" placeholder="NV" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="postal" label="Postal / ZIP code" placeholder="89109" />
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs uppercase tracking-wider">
                      Country
                    </Label>
                    <Select name="country" defaultValue="US">
                      <SelectTrigger id="country" className="h-12 rounded-xl bg-card">
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

            <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <Field id="password" label="Password" type="password" />
              <Field id="confirmPassword" label="Confirm password" type="password" />
            </div>

            <Button
              type="submit"
              variant="hero"
              disabled={loading}
              className="h-14 w-full rounded-2xl text-base"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

const Field = ({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs uppercase tracking-wider">
      {label}
    </Label>
    <Input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      required={required}
      className="h-12 rounded-xl bg-card"
    />
  </div>
);

export default Register;
