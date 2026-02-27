import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FCFAF6] border-t border-[#111111]/10 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-[#111111]">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold font-mono tracking-tighter block mb-4">
            EVOLIS<span className="text-accent">_</span>
          </Link>
          <p className="text-[#111111]/70 max-w-sm text-sm leading-relaxed font-sans">
            Store, fund, and engage with early-stage startups securely through 
            milestone-gated token escrows on the BNB Chain.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6 font-mono text-sm uppercase tracking-wider">Platform</h4>
          <ul className="space-y-4 text-sm text-[#111111]/70 font-sans">
            <li><Link href="/" className="hover:text-[#111111] transition-colors">Explore</Link></li>
            <li><Link href="#" className="hover:text-[#111111] transition-colors">Create Campaign</Link></li>
            <li><Link href="#" className="hover:text-[#111111] transition-colors">How it Works</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6 font-mono text-sm uppercase tracking-wider">Resources</h4>
          <ul className="space-y-4 text-sm text-[#111111]/70 font-sans">
            <li><Link href="#" className="hover:text-[#111111] transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-[#111111] transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-[#111111] transition-colors">GitHub</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#111111]/10 flex justify-between items-center text-xs text-[#111111]/50 font-sans">
        <p>© {new Date().getFullYear()} Evolis Protocol. All rights reserved.</p>
        <p>Built on BNB Chain</p>
      </div>
    </footer>
  );
}
