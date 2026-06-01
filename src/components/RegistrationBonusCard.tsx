import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const BONUS_CAP = 100;
const BONUS_AMOUNT = 100;

interface Props {
  /** When true, the card is informational only (e.g. on the register page) */
  preview?: boolean;
  className?: string;
}

export const RegistrationBonusCard = ({ preview = false, className }: Props) => {
  const { user, isReady } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: bonusData } = useQuery({
    queryKey: ["registration-bonus", user?.id],
    enabled: !preview && isReady,
    queryFn: async () => {
      const [{ count }, mine] = await Promise.all([
        supabase
          .from("registration_bonuses")
          .select("*", { count: "exact", head: true }),
        user
          ? supabase
              .from("registration_bonuses")
              .select("id, claimed_at, amount")
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        total: count ?? 0,
        mine: (mine as { data: { claimed_at: string; amount: number } | null }).data,
      };
    },
  });

  const claimed = !!bonusData?.mine;
  const total = bonusData?.total ?? 0;
  const remaining = Math.max(0, BONUS_CAP - total);
  const soldOut = remaining === 0 && !claimed;

  const progressValue = useMemo(
    () => Math.min(100, (total / BONUS_CAP) * 100),
    [total],
  );

  const handleClaim = async () => {
    if (!user) {
      toast.error("Please sign in to claim your bonus");
      return;
    }
    if (!ack) {
      toast.error("Please acknowledge the terms to continue");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("registration_bonuses").insert({
      user_id: user.id,
      amount: BONUS_AMOUNT,
      acknowledged: true,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't claim bonus", { description: error.message });
      return;
    }
    toast.success("Bonus claimed!", {
      description: "Your $100 Registration Bonus has been recorded.",
    });
    setOpen(false);
    setAck(false);
    qc.invalidateQueries({ queryKey: ["registration-bonus"] });
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden border-0 bg-ink bg-card-dark p-6 text-ink-foreground shadow-card sm:p-8 ${className ?? ""}`}
      >
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <Badge className="rounded-full bg-primary/20 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1 h-3 w-3" />
              Limited to First 100 Members
            </Badge>
            <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              $100 Registration Bonus
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              The first 100 approved users in the Jewelry Rewards Program receive
              a one-time $100 bonus on enrollment.
            </p>

            {!preview && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Bonuses claimed</span>
                  <span className="font-mono font-semibold text-ink-foreground">
                    {total} / {BONUS_CAP}
                  </span>
                </div>
                <Progress value={progressValue} className="h-2 bg-ink-card" />
                <p className="text-xs text-ink-muted">
                  {remaining > 0
                    ? `${remaining} bonus${remaining === 1 ? "" : "es"} remaining`
                    : "All bonuses have been claimed"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="rounded-2xl border border-ink-border bg-ink-card/60 px-5 py-3 text-right backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Reward
              </p>
              <p className="text-3xl font-black tracking-tight">$100</p>
            </div>
            {preview ? (
              <Badge variant="secondary" className="rounded-full">
                Sign up to claim
              </Badge>
            ) : claimed ? (
              <Badge className="rounded-full bg-primary text-primary-foreground">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Claimed
              </Badge>
            ) : (
              <Button
                variant="hero"
                size="pill"
                onClick={() => setOpen(true)}
                disabled={soldOut}
              >
                <Gift className="mr-1 h-4 w-4" />
                {soldOut ? "All claimed" : "Claim Bonus"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setAck(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim your $100 Registration Bonus</DialogTitle>
            <DialogDescription>
              Please review and acknowledge the terms below to claim your bonus.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
            By clicking <span className="font-semibold">"Claim Bonus,"</span> I
            acknowledge and agree to receive a $100 Registration Bonus as part
            of my enrollment in the Jewelry Rewards Program, subject to program
            terms and eligibility requirements.
          </div>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={ack}
              onCheckedChange={(v) => setAck(v === true)}
              className="mt-0.5"
            />
            <span>
              I have read and agree to the terms above.
            </span>
          </label>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleClaim}
              disabled={!ack || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Gift className="mr-1 h-4 w-4" />
                  Claim Bonus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegistrationBonusCard;
