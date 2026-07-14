import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who qualifies for the Hi-PRO Dealer Program?",
    a: "The Hi-PRO Dealer Program is designed for professional HVAC dealers committed to installing Hisense HVAC systems. To begin earning marketing accruals, dealers must reach $50,000 in qualifying Hisense HVAC purchases per calendar year.",
  },
  {
    q: "How do I earn rewards?",
    a: "Every qualified Hisense installation earns up to $100 per system, paid to your reloadable Hisense Rewards Mastercard®. Submit a claim in your dealer portal, and approved rewards are loaded to your card automatically.",
  },
  {
    q: "How do marketing accruals work?",
    a: "You earn 2% on Hisense HD Ducted and Ductless Systems and 3% on Hisense VRF Systems. Accruals can fund advertising, digital marketing, events, training, and other approved marketing activities that grow your local business.",
  },
  {
    q: "What's included with extended labor coverage?",
    a: "Qualifying Hisense systems include up to two years of extended labor coverage at no cost. Dealers can also purchase additional coverage — up to ten years total. Program details, eligibility, and coverage terms apply.",
  },
  {
    q: "How do I get technical support?",
    a: "Hi-PRO Dealers receive priority access to Hisense technical support through the Hisense Comfort Hi-TECH support app, available on Apple and Android devices.",
  },
  {
    q: "How do I sign up?",
    a: "Create your Hi-PRO account online in minutes. Your participating Hisense distributor can walk you through eligibility and answer any program-specific questions.",
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
              Program questions, answered.
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
