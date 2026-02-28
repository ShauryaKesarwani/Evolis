"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface TokenPurchasePanelProps {
  tokenSymbol: string;
  tokenPriceBNB: number;
  userBalanceBNBMock?: number; 
}

export default function TokenPurchasePanel({ tokenSymbol, tokenPriceBNB, userBalanceBNBMock = 0 }: TokenPurchasePanelProps) {
  const [amount, setAmount] = useState<string>('');
  const [isPurchased, setIsPurchased] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use real balance if connected and data is loaded, otherwise use 0 (or mock for testing)
  const actualBalanceBNB = mounted && isConnected && balanceData 
    ? Number(formatEther(balanceData.value)) 
    : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic validation to only allow numbers and decimals
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
  };

  const calculatedTokens = amount && !isNaN(Number(amount)) ? (Number(amount) / tokenPriceBNB).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00';

  const handlePurchase = () => {
    if (!amount || Number(amount) <= 0 || Number(amount) > actualBalanceBNB || !isConnected) return;
    setIsPurchased(true);
    // In actual implementation, this would trigger wagmi writeContract
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-mono text-2xl font-bold text-[#111111]">Support Project</h3>
        <span className="text-xs font-bold bg-[#111111]/5 px-3 py-1.5 rounded-full text-[#111111] border border-[#111111]/10 uppercase tracking-widest">
          1 {tokenSymbol} = {tokenPriceBNB} BNB
        </span>
      </div>

      {isPurchased ? (
        <div className="bg-[#b5e315]/10 border-2 border-[#b5e315] rounded-2xl p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-[#b5e315] rounded-full flex items-center justify-center mx-auto border-2 border-[#111111]">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <h4 className="font-mono font-bold tracking-tight text-xl mb-1 text-[#111111]">Purchase Successful!</h4>
            <p className="text-sm font-medium text-[#111111]/70">You will receive your limited {tokenSymbol} tokens according to the vesting schedule.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2 font-bold text-[#111111]/80">
                <label htmlFor="amount">Amount (BNB)</label>
                <span>Balance: {mounted && isConnected ? actualBalanceBNB.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '---'} BNB</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full bg-[#FCFAF6] border-2 border-[#111111]/20 rounded-xl px-4 py-4 font-mono text-2xl font-bold focus:outline-none focus:border-[#b5e315] focus:ring-4 focus:ring-[#b5e315]/20 transition-all placeholder:text-[#111111]/20 pb-4"
                />
                <button 
                  onClick={() => mounted && isConnected && setAmount(actualBalanceBNB.toString())}
                  disabled={!mounted || !isConnected}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider bg-[#111111]/5 hover:bg-[#111111]/10 px-3 py-1.5 rounded-md transition-colors border border-[#111111]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-[#FCFAF6] border-2 border-[#111111]/5 rounded-xl">
              <span className="font-bold text-[#111111]/70">Tokens to receive</span>
              <span className="font-mono font-bold text-xl text-[#111111]">{calculatedTokens} <span className="text-base opacity-50 ml-1">{tokenSymbol}</span></span>
            </div>
          </div>

          <div className="bg-[#111111]/5 rounded-xl p-4 text-sm font-medium text-[#111111]/70 leading-relaxed border border-[#111111]/10">
            <strong>🔒 Smart Contract Escrow:</strong> Your funds are securely held on-chain and only released to the founders as they achieve verified milestones.
          </div>

          <button 
            onClick={handlePurchase}
            disabled={!mounted || !isConnected || !amount || Number(amount) <= 0 || Number(amount) > actualBalanceBNB}
            className="w-full bg-[#b5e315] hover:bg-[#a3cc13] disabled:bg-[#111111]/10 disabled:text-[#111111]/40 text-[#111111] font-mono font-bold text-lg md:text-xl py-4 rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] disabled:border-[#111111]/20 disabled:shadow-none"
          >
            {mounted && isConnected ? 'Confirm Purchase' : 'Connect Wallet to Purchase'}
          </button>
        </>
      )}
    </div>
  );
}
