import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-[#FCFAF6]">
      {/* Abstract Background Element for extra warmth */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column (Copy & CTA) */}
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-mono tracking-tighter text-[#111111] leading-[0.9] mb-8 uppercase">
            Fund the <br />
            <span className="relative inline-block z-10">
              Future,
              <span className="absolute bottom-2 left-0 w-full h-4 bg-accent -z-10 rotate-[-1deg]"></span>
            </span>
            <br /> Milestone by Milestone.
          </h1>
          
          <p className="text-xl md:text-2xl text-[#111111]/70 font-sans mb-10 leading-relaxed max-w-xl">
            Store, fund, and engage with early-stage startups securely through 
            milestone-gated token escrows directly on BNB Chain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 font-mono">
            <Link 
              href="#explore"
              className="px-8 py-4 rounded-full bg-accent text-[#111111] font-bold text-center border-2 border-[#111111] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#111111] transition-all duration-200"
            >
              Explore Campaigns ↗
            </Link>
            <Link 
              href="/create"
              className="px-8 py-4 rounded-full bg-transparent text-[#111111] font-bold text-center border-2 border-[#111111] hover:bg-[#111111] hover:text-[#FCFAF6] transition-all duration-200"
            >
              Launch a Project
            </Link>
          </div>
        </div>
        
        {/* Right Column (Visual / Graphic) */}
        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] bg-accent border-[3px] border-[#111111] p-8 flex items-center justify-center overflow-hidden shadow-[8px_8px_0px_#111111]">
          {/* Abstract Mockup Element inside */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          
          <div className="w-[85%] h-[90%] bg-white rounded-2xl border-[3px] border-[#111111] p-6 flex flex-col shadow-lg z-10">
            <div className="flex justify-between items-center mb-8 border-b border-[#111111]/10 pb-4">
              <div className="font-mono font-bold text-sm">Escrow Status</div>
              <div className="px-3 py-1 bg-accent/20 text-[#111111] text-xs font-bold rounded-full border border-[#111111]/20">Active</div>
            </div>
            
            <div className="text-4xl font-mono font-black mb-1">35,450 <span className="text-lg text-[#111111]/50">BNB</span></div>
            <div className="text-sm font-sans text-[#111111]/60 mb-8 tracking-wide">LOCKED IN SMART CONTRACT</div>
            
            <div className="space-y-4 flex-grow">
              <div className="w-full bg-[#f4f4f4] h-8 rounded-full border border-[#111111]/10 overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-[#111111] h-full w-[25%] border-r border-[#111111]"></div>
                <div className="absolute inset-0 flex items-center px-4 font-mono text-[10px] text-[#FCFAF6] z-10 mix-blend-difference font-bold tracking-widest uppercase">
                  Milestone 1 unlocked
                </div>
              </div>
              
              <div className="w-full bg-[#f4f4f4] h-8 rounded-full border border-[#111111]/10 overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center px-4 font-mono text-[10px] text-[#111111]/50 tracking-widest uppercase">
                  Milestone 2 pending verification
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
