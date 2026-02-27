import Link from "next/link";
import Image from "next/image";

interface CampaignCardProps {
  id: string;
  name: string;
  category: string;
  status: string;
  milestoneStr: string;
  raised: string;
  target: string;
  price: string;
  progressPercent: number;
}

export default function CampaignCard({
  id,
  name,
  category,
  status,
  milestoneStr,
  raised,
  target,
  price,
  progressPercent,
}: CampaignCardProps) {
  return (
    <Link href={`/project/${id}`} className="group block h-full">
      <div className="h-full flex flex-col bg-white rounded-3xl border border-[#111111]/10 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#111111]/30 hover:-translate-y-1 relative overflow-hidden">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FCFAF6] rounded-xl border border-[#111111]/10 flex items-center justify-center font-mono font-bold text-xl text-[#111111]">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111111] leading-tight group-hover:text-accent transition-colors">{name}</h3>
              <p className="text-xs text-[#111111]/50 font-sans uppercase tracking-wider">{category}</p>
            </div>
          </div>
          
          <div className="px-3 py-1 bg-accent text-[#111111] text-xs font-bold font-mono tracking-tight rounded-full border border-[#111111]/10 shadow-sm">
            {status}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2 font-mono">
            <span className="text-2xl font-black text-[#111111] tracking-tighter">
              {raised} <span className="text-sm font-medium text-[#111111]/50">/ {target}</span>
            </span>
            <span className="text-xs font-bold text-[#111111]">{progressPercent}%</span>
          </div>
          
          <div className="w-full bg-[#FCFAF6] h-3 rounded-full border border-[#111111]/5 overflow-hidden mb-8">
            <div 
              className="h-full bg-[#111111] transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20"></div>
            </div>
          </div>

          {/* Bottom Metrics Row */}
          <div className="flex justify-between items-center pt-5 border-t border-[#111111]/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#111111]/50 font-sans uppercase tracking-widest mb-1">Current Price</span>
              <span className="font-mono font-bold text-sm text-[#111111]">{price} BNB</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#111111]/50 font-sans uppercase tracking-widest mb-1">Milestones</span>
              <span className="font-mono font-bold text-sm text-[#111111]">{milestoneStr}</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
