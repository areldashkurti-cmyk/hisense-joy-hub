import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can register for Hisense Dealer Rewards?",
    a: "Any dealer who purchases and installs qualifying Hisense products can register on their own — no invitation or sponsorship required.",
  },
  {
    q: "How do I earn rewards?",
    a: "Register your account, then submit a claim for each qualifying Hisense system you install. Approved claims earn a flat dollar reward, up to $100 per qualifying installed system.",
  },
  {
    q: "How do I get paid?",
    a: "Approved rewards are loaded to your reloadable Hisense Dealer Rewards Mastercard®. Spend the funds anywhere Mastercard® is accepted.",
  },
  {
    q: "How long does registration take?",
    a: "Under a minute. You'll need your name, email, an optional phone number, your distributor, and a mailing address.",
  },
  {
    q: "What if I don't know my distributor number?",
    a: "Choose \"Other / I don't know my distributor number\" and enter what you know. Our team will review and verify it before your claims are approved.",
  },
  {
    q: "How is this different from the Hi-PRO Dealer Program?",
    a: "Hisense Dealer Rewards is the self-serve rewards platform on this site. The Hi-PRO Dealer Program is a separate program administered through participating distributors — contact your distributor for registration and complete benefits.",
  },
];

export const ProgramFAQ = () => {
  return (
    <section className="bg-secondary/40 py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Frequently Asked
            </div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Questions, answered.
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-card px-6"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
