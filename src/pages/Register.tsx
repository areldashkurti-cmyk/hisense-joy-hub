import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

const Field = ({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs uppercase tracking-wider">
      {label}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      className="h-12 rounded-xl bg-card"
    />
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const Register = () => {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Account ready to create!", {
      description:
        "Sign-up is not wired up yet — your distributor will verify shortly.",
    });
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left rail (dark) */}
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

      {/* Right form */}
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

          <h1 className="text-4xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-muted-foreground">
            It takes less than a minute. You'll need your distributor code.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="firstName" label="First name" placeholder="Jordan" />
              <Field id="lastName" label="Last name" placeholder="Cooper" />
            </div>

            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
            />
            <Field
              id="phone"
              label="Phone (US/CAN)"
              type="tel"
              placeholder="(555) 123-4567"
            />
            <Field
              id="distributor"
              label="Distributor code"
              placeholder="LV12523"
              hint="Provided by your authorized Hisense distributor."
            />

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold">Mailing address</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Where we'll ship physical rewards and program materials.
              </p>

              <div className="mt-5 space-y-5">
                <Field
                  id="street"
                  label="Street address"
                  placeholder="123 Main St"
                />
                <Field
                  id="apt"
                  label="Apt, suite, etc. (optional)"
                  placeholder="Suite 200"
                  required={false}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="city" label="City" placeholder="Las Vegas" />
                  <Field
                    id="state"
                    label="State / Province"
                    placeholder="NV"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="postal"
                    label="Postal / ZIP code"
                    placeholder="89109"
                  />
                  <div className="space-y-2">
                    <Label
                      htmlFor="country"
                      className="text-xs uppercase tracking-wider"
                    >
                      Country
                    </Label>
                    <Select defaultValue="US">
                      <SelectTrigger
                        id="country"
                        className="h-12 rounded-xl bg-card"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <Field id="password" label="Password" type="password" />
              <Field
                id="confirmPassword"
                label="Confirm password"
                type="password"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="h-14 w-full rounded-2xl text-base"
            >
              Create account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
