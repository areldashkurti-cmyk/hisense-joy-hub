import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ProgramTeaser } from "@/components/ProgramTeaser";
import { ClosingCTA } from "@/components/ClosingCTA";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <ProgramTeaser />
      <ClosingCTA />
      <SiteFooter />
    </main>
  );
};

export default Index;
