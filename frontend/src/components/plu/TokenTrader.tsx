'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, Address, isAddress } from 'viem';
import { Inter, Martian_Mono } from 'next/font/google';
import { PANCAKE_ROUTER } from '@/lib/pluConfig';
import { ERC20_ABI } from '@/lib/pluAbi';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

const ROUTER_ABI = [
  {
    "inputs": [
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactETHForTokens",
    "outputs": [{ "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "name": "swapExactTokensForETH",
    "outputs": [{ "name": "amounts", "type": "uint256[]" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function TokenTrader() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState('0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1');
  const [tokenSymbol, setTokenSymbol] = useState('TEST');
  const [buyAmount, setBuyAmount] = useState('0.01');
  const [sellAmount, setSellAmount] = useState('100');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [tokenAddressError, setTokenAddressError] = useState('');
  const [showBalance, setShowBalance] = useState(false);

  const isValidTokenAddress = isAddress(tokenAddress);
  const TOKEN_ADDRESS = isValidTokenAddress ? (tokenAddress as Address) : ('0x0000000000000000000000000000000000000000' as Address);

  const { data: tokenBalance, refetch } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract: buyTokens, data: buyHash } = useWriteContract();
  const { isLoading: isBuying, isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyHash });

  const { writeContract: approveTokens, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: sellTokens, data: sellHash } = useWriteContract();
  const { isLoading: isSelling, isSuccess: sellSuccess } = useWaitForTransactionReceipt({ hash: sellHash });

  const handleBuy = async () => {
    if (!address) return;
    const ethAmount = parseEther(buyAmount);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    
    buyTokens({
      address: PANCAKE_ROUTER as Address,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [
        BigInt(1),
        ['0x0000000000000000000000000000000000000000' as Address, TOKEN_ADDRESS],
        address,
        deadline
      ],
      value: ethAmount,
    });
  };

  const handleApprove = async () => {
    const amount = parseEther(sellAmount);
    approveTokens({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PANCAKE_ROUTER as Address, amount],
    });
  };

  const handleSell = async () => {
    if (!address) return;
    const amount = parseEther(sellAmount);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    
    sellTokens({
      address: PANCAKE_ROUTER as Address,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForETH',
      args: [
        amount,
        BigInt(1),
        [TOKEN_ADDRESS, '0x0000000000000000000000000000000000000000' as Address],
        address,
        deadline
      ],
    });
  };

  if (buySuccess || sellSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  return (
    <div className={`w-full max-w-lg mx-auto bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8 relative ${inter.className}`}>
      <div className="absolute top-0 left-0 w-full h-2 bg-[#111111] rounded-t-2xl"></div>

      <div className="mb-8 mt-2">
        <h2 className="text-sm text-[#111111]/50 uppercase font-bold tracking-widest mb-1">DEX INTERFACE</h2>
        <h3 className={`${martianMono.className} text-2xl md:text-3xl font-bold text-[#111111]`}>Token Trader</h3>
      </div>

      <div className="mb-6 p-5 bg-[#FCFAF6] rounded-xl border border-[#111111]/10">
        <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Token Address</label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => {
            setTokenAddress(e.target.value);
            setTokenAddressError(e.target.value && !isAddress(e.target.value) ? 'Invalid address' : '');
          }}
          placeholder="0x..."
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 bg-white font-mono text-sm ${
            tokenAddressError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#111111]/20 focus:border-[#111111] focus:ring-[#111111]'
          }`}
        />
        {tokenAddressError && <p className="text-xs text-red-500 font-medium mt-2">{tokenAddressError}</p>}
        {isValidTokenAddress && <p className="text-xs text-[#b5e315] font-bold mt-2 uppercase tracking-wide">Valid address</p>}
        
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="mt-4 w-full py-3 bg-[#111111]/5 hover:bg-[#111111]/10 text-[#111111] font-bold text-sm uppercase tracking-wide rounded-xl transition"
        >
          {showBalance ? 'Hide Token Balance' : 'Check Token Balance'}
        </button>
        
        {showBalance && isValidTokenAddress && (
          <div className="mt-4 p-4 bg-white border border-[#111111]/10 rounded-xl space-y-2 text-sm">
            <p className="text-[#111111]/70">
              <span className="font-bold text-[#111111] uppercase tracking-wide text-xs">Wallet:</span> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </p>
            <p className="text-xl font-bold text-[#111111] mt-2">
              {tokenBalance ? formatEther(tokenBalance as bigint) : '0'} <span className="text-sm font-normal text-[#111111]/60">{tokenSymbol}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex mb-6 border-b border-[#111111]/10">
        <button
          className={`flex-1 py-4 font-bold uppercase tracking-wide text-sm transition-colors relative ${
            activeTab === 'buy' 
              ? 'text-[#111111]' 
              : 'text-[#111111]/40 hover:text-[#111111]'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          Buy Tokens
          {activeTab === 'buy' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#111111]"></div>
          )}
        </button>
        <button
          className={`flex-1 py-4 font-bold uppercase tracking-wide text-sm transition-colors relative ${
            activeTab === 'sell' 
              ? 'text-[#111111]' 
              : 'text-[#111111]/40 hover:text-[#111111]'
          }`}
          onClick={() => setActiveTab('sell')}
        >
          Sell Tokens
          {activeTab === 'sell' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#111111]"></div>
          )}
        </button>
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'buy' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Amount to spend (BNB)</label>
              <input
                type="number"
                step="0.01"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] bg-[#FCFAF6] font-mono"
                placeholder="0.01"
              />
            </div>

            <button
              onClick={handleBuy}
              disabled={!address || isBuying}
              className="w-full py-4 bg-[#b5e315] hover:bg-[#a3cc12] disabled:bg-[#FCFAF6] disabled:text-[#111111]/30 disabled:border disabled:border-[#111111]/10 disabled:shadow-none text-[#111111] rounded-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {isBuying ? 'Processing...' : 'Execute Buy'}
            </button>
            
            {buySuccess && (
              <div className="p-4 bg-[#b5e315]/10 border border-[#b5e315]/30 rounded-xl">
                <p className="text-sm text-[#5a7008] font-bold uppercase mb-1">Purchase Successful</p>
                <a href={`https://testnet.bscscan.com/tx/${buyHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#111111]/60 font-mono hover:text-[#111111] underline">View Tx: {buyHash?.slice(0, 10)}...{buyHash?.slice(-8)}</a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Amount to sell</label>
              <input
                type="number"
                step="1"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] bg-[#FCFAF6] font-mono"
                placeholder="100"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={handleApprove}
                disabled={!address || isApproving || approveSuccess}
                className="w-full py-4 bg-[#111111] hover:bg-[#222222] disabled:bg-[#FCFAF6] disabled:text-[#111111]/30 disabled:border disabled:border-[#111111]/10 disabled:shadow-none text-[#FCFAF6] rounded-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_#111111]/20 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                {isApproving ? 'Approving...' : approveSuccess ? 'Approved' : 'Step 1: Approve Token'}
              </button>
              
              <button
                onClick={handleSell}
                disabled={!address || isSelling || !approveSuccess}
                className="w-full py-4 bg-[#b5e315] hover:bg-[#a3cc12] disabled:bg-[#FCFAF6] disabled:text-[#111111]/30 disabled:border disabled:border-[#111111]/10 disabled:shadow-none text-[#111111] rounded-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                {isSelling ? 'Processing...' : 'Step 2: Execute Sell'}
              </button>
              
              {sellSuccess && (
                <div className="p-4 bg-[#b5e315]/10 border border-[#b5e315]/30 rounded-xl">
                  <p className="text-sm text-[#5a7008] font-bold uppercase mb-1">Sale Successful</p>
                  <a href={`https://testnet.bscscan.com/tx/${sellHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#111111]/60 font-mono hover:text-[#111111] underline">View Tx: {sellHash?.slice(0, 10)}...{sellHash?.slice(-8)}</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!address && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]/40 mb-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <p className="text-sm font-bold uppercase tracking-wide text-[#111111]/60">Wallet Disconnected</p>
        </div>
      )}
    </div>
  );
}
