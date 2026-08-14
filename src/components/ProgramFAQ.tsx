import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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
