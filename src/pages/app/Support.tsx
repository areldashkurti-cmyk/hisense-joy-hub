import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, MessageCircle, Mail, Clock } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const FAQS = [
  {
    q: "How long does it take to review a claim?",
    a: "Most claims are reviewed within 3 business days. You'll see status updates on your Dashboard and receive an email when a decision is made.",
  },
  {
    q: "When are payouts processed?",
    a: "Approved claims credit your rewards card balance within one business day. Withdrawals are processed weekly on Fridays.",
  },
  {
    q: "What counts as a qualifying installation?",
    a: "Any new Hisense Comfort residential installation with a verifiable proof of purchase, valid serial number, and matching model number registered to a homeowner address.",
  },
  {
    q: "What file types can I upload as proof of purchase?",
    a: "PDF, JPG, or PNG up to 10 MB. The document should clearly show the date, model, and customer name.",
  },
  {
    q: "Can I submit claims for installs from prior months?",
    a: "Yes, claims must be submitted within 90 days of the sale date. After 90 days, claims are not eligible for rewards.",
  },
  {
    q: "How do I update my mailing address for physical rewards?",
    a: "Go to Profile → Mailing address. Changes take effect immediately for any new physical reward shipments.",
  },
];

const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(120),
  message: z.string().trim().min(10, "Please add a few more details").max(2000),
});

const Support = () => {
  const { user, isReady } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets", user?.id],
    enabled: isReady && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = ticketSchema.safeParse({
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't send", { description: error.message });
      return;
    }
    toast.success("Ticket submitted!", {
      description: "Our team will reply within 1 business day.",
    });
    (e.target as HTMLFormElement).reset();
    qc.invalidateQueries({ queryKey: ["tickets"] });
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Resource center
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Support
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find answers fast or get in touch with the program team.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* FAQ */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search FAQ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl bg-card pl-11"
            />
          </div>

          <Card className="p-2">
            {filteredFaqs.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                No results. Try a different search or send us a message.
              </p>
            ) : (
              <Accordion type="single" collapsible>
                {filteredFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="px-4 text-left font-semibold">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Card>

          {/* My tickets */}
          {tickets.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 text-base font-semibold">My tickets</h3>
              <Card className="divide-y divide-border p-0">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium">{t.subject}</p>
                      <Badge variant="secondary" className="capitalize">
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(t.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </section>

        {/* Contact */}
        <aside className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Hours & contact</h2>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Mon–Fri, 8am – 6pm ET
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                rewards@hisense-comfort.com
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Reply within 1 business day
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Send us a message</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs uppercase tracking-wider">
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  maxLength={120}
                  placeholder="Question about claim #…"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs uppercase tracking-wider">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  maxLength={2000}
                  placeholder="How can we help?"
                  className="min-h-32 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                disabled={submitting}
                className="h-12 w-full rounded-xl"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
};

export default Support;
