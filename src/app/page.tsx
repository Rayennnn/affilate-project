import { Navbar } from "@/components/Navbar";
import { Hero, TrustBar } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ValueProposition } from "@/components/ValueProposition";
import { FeaturedOpportunities } from "@/components/FeaturedOpportunities";
import { StatsSection } from "@/components/StatsSection";
import { Testimonials } from "@/components/Testimonials";
import { BrandLogos } from "@/components/BrandLogos";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg-page)]">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ValueProposition />
      <FeaturedOpportunities />
      <StatsSection />
      <Testimonials />
      <BrandLogos />
      <CtaBanner />
      <Footer />
    </main>
  );
}
