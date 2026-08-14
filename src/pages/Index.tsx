import { Hero } from "@/components/Hero";
import { EarnFunds } from "@/components/EarnFunds";
import { HowItWorks } from "@/components/HowItWorks";
import { ProgramFAQ } from "@/components/ProgramFAQ";
import { HiProProgram } from "@/components/HiProProgram";
import { ClosingCTA } from "@/components/ClosingCTA";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <EarnFunds />
      <HowItWorks />
      <ProgramFAQ />
      <ClosingCTA />
      <HiProProgram />
      <SiteFooter />
    </main>
  );
};

export default Index;
