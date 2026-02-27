import CampaignCard from "./CampaignCard";

export default function CampaignGrid() {
  const dummyCampaigns = [
    {
      id: "1",
      name: "ZenCrypto Wallet",
      category: "Infra",
      status: "Funding",
      milestoneStr: "1 / 4 Unlocked",
      raised: "35,450",
      target: "50,000",
      price: "0.05",
      progressPercent: 71,
    },
    {
      id: "2",
      name: "Nebula Protocol",
      category: "DeFi",
      status: "Funding",
      milestoneStr: "0 / 3 Pending",
      raised: "12,000",
      target: "100,000",
      price: "0.10",
      progressPercent: 12,
    },
    {
      id: "3",
      name: "Lumina DEX",
      category: "DeFi",
      status: "Verified",
      milestoneStr: "5 / 5 Unlocked",
      raised: "250,000",
      target: "250,000",
      price: "0.25",
      progressPercent: 100,
    },
    {
      id: "4",
      name: "Aether Gaming",
      category: "Gaming",
      status: "Funding",
      milestoneStr: "2 / 5 Unlocked",
      raised: "85,200",
      target: "150,000",
      price: "0.15",
      progressPercent: 56,
    },
    {
      id: "5",
      name: "Echo Storage",
      category: "Infra",
      status: "Upcoming",
      milestoneStr: "TGE Pending",
      raised: "0",
      target: "75,000",
      price: "0.08",
      progressPercent: 0,
    },
    {
      id: "6",
      name: "Chronos DAO",
      category: "Social",
      status: "Funding",
      milestoneStr: "1 / 6 Unlocked",
      raised: "115,000",
      target: "125,000",
      price: "0.50",
      progressPercent: 92,
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#FCFAF6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#111111]">
            Active Campaigns.
          </h2>
          <span className="hidden md:inline-block text-sm font-sans font-semibold text-[#111111]/50 uppercase tracking-widest border border-[#111111]/20 rounded-full px-4 py-1">
            Displaying {dummyCampaigns.length} Projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyCampaigns.map((campaign) => (
            <div key={campaign.id} className="h-auto aspect-[4/5] sm:aspect-auto sm:h-[420px]">
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center">
          <button className="px-8 py-4 rounded-full bg-white text-[#111111] font-bold text-center border-2 border-[#111111]/10 hover:border-[#111111] shadow-sm hover:-translate-y-1 transition-all duration-200">
            Load More Projects
          </button>
        </div>
      </div>
    </section>
  );
}
