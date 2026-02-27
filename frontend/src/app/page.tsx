import HeroSection from "@/components/home/HeroSection";
import CampaignFilters from "@/components/home/CampaignFilters";
import CampaignGrid from "@/components/home/CampaignGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FCFAF6] text-[#111111]">
      <HeroSection />
      <CampaignFilters />
      <CampaignGrid />
    </main>
  );
}
