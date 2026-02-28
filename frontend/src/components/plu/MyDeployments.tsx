'use client';

import { useAccount, useReadContract } from 'wagmi';
import { TOKEN_FACTORY_ABI, LIQUIDITY_CONTROLLER_ABI, ERC20_ABI } from '@/lib/pluAbi';
import { FACTORY_ADDRESS } from '@/lib/pluConfig';
import { formatEther } from 'viem';
import { useState } from 'react';
import { Inter, Martian_Mono } from 'next/font/google';
import LiquidityDashboard from './LiquidityDashboard';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

export default function MyDeployments() {
  const { address, isConnected } = useAccount();
  const [selectedController, setSelectedController] = useState<string | null>(null);

  const { data: deployments, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getUserDeployments',
    args: address ? [address] : undefined,
  });

  if (!isConnected) {
    return (
      <div className={`p-10 border border-[#111111]/10 border-dashed rounded-2xl flex items-center justify-center text-[#111111]/40 bg-[#FCFAF6]/50 ${inter.className}`}>
        Connect your wallet to view your deployments.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-10 border border-[#111111]/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-[#111111]/40 bg-[#FCFAF6]/50 ${inter.className}`}>
        <div className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#b5e315] rounded-full animate-spin mb-4"></div>
        <p>Loading deployments...</p>
      </div>
    );
  }

  if (!deployments || (deployments as string[]).length === 0) {
    return (
      <div className={`p-10 border border-[#111111]/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-[#111111]/40 bg-[#FCFAF6]/50 ${inter.className}`}>
        <p className="text-lg font-medium">No deployments yet.</p>
        <p className="text-sm">Deploy your first token to see it here.</p>
      </div>
    );
  }

  const typedDeployments = deployments as string[];

  if (selectedController) {
    return (
      <div className={inter.className}>
        <button
          onClick={() => setSelectedController(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-[#111111]/60 hover:text-[#111111] uppercase tracking-wide transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Deployments
        </button>
        <LiquidityDashboard controllerAddress={selectedController} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${inter.className}`}>
      {typedDeployments.map((tokenAddress) => (
        <DeploymentCard
          key={tokenAddress}
          tokenAddress={tokenAddress}
          onManageLiquidity={(controllerAddr) => setSelectedController(controllerAddr)}
        />
      ))}
    </div>
  );
}

function DeploymentCard({ tokenAddress, onManageLiquidity }: { tokenAddress: string; onManageLiquidity: (controller: string) => void }) {
  const { data: deploymentInfo } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'deploymentInfo',
    args: [tokenAddress as `0x${string}`],
  });

  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
  });

  const controllerAddr = deploymentInfo ? (deploymentInfo as any)[1] : null;

  const { data: unlockProgress } = useReadContract({
    address: controllerAddr as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockProgress',
  });

  if (!deploymentInfo) return null;

  const typedInfo = deploymentInfo as unknown as any[];
  const [, controller, , timestamp, totalSupply, initialTokens, lockedTokens] = typedInfo;
  
  const progressData = unlockProgress as bigint[] | undefined;
  const progress = progressData && Number(progressData[1]) > 0
    ? (Number(progressData[0]) / Number(progressData[1])) * 100
    : 0;

  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8 relative hover:border-[#b5e315] hover:shadow-[4px_4px_0px_#b5e315] transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-[#111111]/10 pb-6">
        <div>
          <h3 className={`${martianMono.className} text-xl md:text-2xl font-bold text-[#111111] flex items-center gap-3`}>
            {tokenName as string} 
            <span className="text-xs uppercase bg-[#111111] text-[#b5e315] px-2 py-1 rounded font-mono tracking-widest">{tokenSymbol as string}</span>
          </h3>
          <p className="text-sm text-[#111111]/50 font-mono mt-2">
            Contract: {tokenAddress}
          </p>
        </div>
        <a
          href={`https://testnet.bscscan.com/token/${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase text-[#111111] hover:text-[#b5e315] hover:underline mt-4 md:mt-0"
        >
          View on Explorer →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#111111]/10 p-4 rounded-xl bg-[#FCFAF6]">
          <p className="text-[#111111]/50 text-xs font-bold uppercase mb-1">Total Supply</p>
          <p className="font-bold text-[#111111]">{formatEther(totalSupply as bigint)}</p>
        </div>
        <div className="border border-[#111111]/10 p-4 rounded-xl bg-[#FCFAF6]">
          <p className="text-[#111111]/50 text-xs font-bold uppercase mb-1">Initial Liq.</p>
          <p className="font-bold text-[#111111]">{formatEther(initialTokens as bigint)}</p>
        </div>
        <div className="border border-[#111111]/10 p-4 rounded-xl bg-[#FCFAF6]">
          <p className="text-[#111111]/50 text-xs font-bold uppercase mb-1">Locked Tokens</p>
          <p className="font-bold text-[#111111]">{formatEther(lockedTokens as bigint)}</p>
        </div>
        <div className="border border-[#b5e315]/30 p-4 rounded-xl bg-[#b5e315]/10">
          <p className="text-[#111111]/50 text-xs font-bold uppercase mb-1">Deployed On</p>
          <p className="font-bold text-[#111111]">
            {new Date(Number(timestamp) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {progressData && (
        <div className="mb-8 bg-[#FCFAF6] border border-[#111111]/10 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold uppercase text-[#111111]/60">PLU Unlock Progress</p>
            <p className="text-sm font-bold text-[#111111]">
              {progressData[0].toString()} / {progressData[1].toString()} epochs
            </p>
          </div>
          <div className="w-full bg-white border border-[#111111]/10 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-[#111111] h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onManageLiquidity(controller as string)}
          className="flex-1 bg-[#111111] hover:bg-[#222222] text-[#FCFAF6] font-bold py-4 px-6 rounded-xl transition-all shadow-[4px_4px_0px_#111111]/20 active:translate-x-1 active:translate-y-1 active:shadow-none text-center uppercase text-sm tracking-wide"
        >
          Manage Liquidity
        </button>
        <a
          href={`https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#b5e315] hover:bg-[#a3cc12] text-[#111111] font-bold py-4 px-6 rounded-xl transition-all shadow-[4px_4px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none text-center uppercase text-sm tracking-wide"
        >
          Trade Token
        </a>
      </div>
    </div>
  );
}
