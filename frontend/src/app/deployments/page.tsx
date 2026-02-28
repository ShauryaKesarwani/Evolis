import React from 'react';
import Link from 'next/link';
import { Inter, Martian_Mono } from 'next/font/google';
import MyDeployments from '@/components/plu/MyDeployments';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

export default function DeploymentsPage() {
  return (
    <div className={`min-h-screen bg-[#FCFAF6] text-[#111111] ${inter.className}`}>
      {/* Header Area */}
      <header className="border-b border-[#111111]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className={`${martianMono.className} text-xl md:text-2xl font-bold uppercase tracking-tighter text-[#111111]`}>
              TOKEN FACTORY
            </h1>
            <p className="text-xs text-[#111111]/50 font-bold uppercase tracking-widest mt-1">
              Progressive Liquidity Unlock
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/deploy" 
              className="text-[#111111]/60 hover:text-[#111111] text-sm font-bold uppercase tracking-wide transition-colors"
            >
              Deploy New Token
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className={`${martianMono.className} text-3xl md:text-4xl font-black text-[#111111] uppercase tracking-tight mb-2`}>
                  My Deployments
              </h2>
              <p className="font-medium text-[#111111]/60">Manage your deployed tokens and unlock liquidity epochs.</p>
            </div>
        </div>

        {/* MyDeployments Component */}
        <div className="mb-16">
          <MyDeployments />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-[#111111]/10 py-8 text-center bg-white mt-auto">
        <p className="text-xs font-bold text-[#111111]/40 uppercase tracking-widest">
          Built for BNB Chain • Powered by PancakeSwap
        </p>
      </footer>
    </div>
  );
}
