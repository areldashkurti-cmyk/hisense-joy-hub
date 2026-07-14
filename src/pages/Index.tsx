import { Hero } from "@/components/Hero";
import { WhyJoin } from "@/components/WhyJoin";
import { ProgramHighlights } from "@/components/ProgramHighlights";
import { HowItWorks } from "@/components/HowItWorks";
import { ToolsSupport } from "@/components/ToolsSupport";
import { ProgramFAQ } from "@/components/ProgramFAQ";
import { ClosingCTA } from "@/components/ClosingCTA";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <WhyJoin />
      <ProgramHighlights />
      <HowItWorks />
      <ToolsSupport />
      <ProgramFAQ />
      <ClosingCTA />
      <SiteFooter />
    </main>
  );
};

export default Index;
