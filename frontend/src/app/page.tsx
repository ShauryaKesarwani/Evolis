import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CampaignFilters from "@/components/home/CampaignFilters";
import CampaignGrid from "@/components/home/CampaignGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FCFAF6] text-[#111111]">
      <HeroSection />
      <HowItWorksSection />
      
      <section id="explore">
        <CampaignFilters />
        <CampaignGrid />
      </section>
    </main>
  );
}
