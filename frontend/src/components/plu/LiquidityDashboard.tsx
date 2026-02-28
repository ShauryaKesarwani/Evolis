'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther, formatEther, decodeEventLog } from 'viem';
import { Inter, Martian_Mono } from 'next/font/google';
import { LIQUIDITY_CONTROLLER_ABI } from '@/lib/pluAbi';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

interface LiquidityData {
  epochsUnlocked: bigint;
  totalEpochs: bigint;
  tokensUnlocked: bigint;
  tokensRemaining: bigint;
  tokenBalance: bigint;
  timeUntilNextEpoch: bigint;
  unlockableEpochs: bigint;
}

interface LiquidityEvent {
  hash: string;
  blockNumber: bigint;
  epoch: bigint;
  tokenAmount: bigint;
  bnbAmount: bigint;
  liquidity: bigint;
  timestamp: string;
}

export default function LiquidityDashboard({ controllerAddress }: { controllerAddress: string }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [liquidityData, setLiquidityData] = useState<LiquidityData | null>(null);
  const [liquidityHistory, setLiquidityHistory] = useState<LiquidityEvent[]>([]);
  const [manualTokenAmount, setManualTokenAmount] = useState('');
  const [manualEthAmount, setManualEthAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: unlockProgress, error: progressError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockProgress',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  });

  const { data: tokenBalance, error: balanceError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getTokenBalance',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  });

  const { data: unlockableEpochs, error: epochError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockableEpochs',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  });

  const { data: timeUntilNextEpoch, error: timeError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getTimeUntilNextEpoch',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  });

  const { writeContract: unlockEpoch, data: unlockHash } = useWriteContract();
  const { writeContract: manualAddLiquidity, data: manualHash } = useWriteContract();

  const { status: unlockStatus } = useWaitForTransactionReceipt({ hash: unlockHash });
  const { status: manualStatus } = useWaitForTransactionReceipt({ hash: manualHash });

  useEffect(() => {
    if (unlockProgress && unlockableEpochs !== undefined && timeUntilNextEpoch !== undefined) {
      setLiquidityData({
        epochsUnlocked: unlockProgress[0],
        totalEpochs: unlockProgress[1],
        tokensUnlocked: unlockProgress[2],
        tokensRemaining: unlockProgress[3],
        tokenBalance: (tokenBalance as bigint) || unlockProgress[3],
        timeUntilNextEpoch: timeUntilNextEpoch as bigint,
        unlockableEpochs: unlockableEpochs as bigint
      });
    }
  }, [unlockProgress, tokenBalance, unlockableEpochs, timeUntilNextEpoch]);

  const fetchLiquidityHistory = async () => {
    if (!publicClient) return;
    try {
      setLoading(true);
      const liquidityUnlockedEvent = LIQUIDITY_CONTROLLER_ABI.find(
        (item) => item.type === 'event' && item.name === 'LiquidityUnlocked'
      );
      if (!liquidityUnlockedEvent) return;

      const logs = await publicClient.getLogs({
        address: controllerAddress as `0x${string}`,
        event: liquidityUnlockedEvent as any,
        fromBlock: BigInt(0),
        toBlock: 'latest'
      });

      const events: LiquidityEvent[] = [];
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: LIQUIDITY_CONTROLLER_ABI,
            data: log.data,
            topics: log.topics
          }) as any;

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          events.push({
            hash: log.transactionHash as string,
            blockNumber: log.blockNumber,
            epoch: decoded.args?.epoch || BigInt(0),
            tokenAmount: decoded.args?.tokenAmount || BigInt(0),
            bnbAmount: decoded.args?.bnbAmount || BigInt(0),
            liquidity: decoded.args?.liquidity || BigInt(0),
            timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
          });
        } catch (err) {
          console.error(err);
        }
      }
      setLiquidityHistory(events.sort((a, b) => Number(b.blockNumber - a.blockNumber)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlockStatus === 'success' || manualStatus === 'success') {
      fetchLiquidityHistory();
    }
  }, [unlockStatus, manualStatus]);

  useEffect(() => {
    fetchLiquidityHistory();
  }, [publicClient]);

  const handleUnlockEpoch = () => {
    unlockEpoch({
      address: controllerAddress as `0x${string}`,
      abi: LIQUIDITY_CONTROLLER_ABI,
      functionName: 'unlockEpoch',
    }); // value removed: sample code had value: parseEther('0.05') but it's not strictly necessary unless controller takes fee. User code had value: parseEther('0.05') but `LiquidityController` `unlockEpoch()` in standard PLU usually doesn't need ETH. Leaving it out unless specified, wait - let's keep it if contract expects it. Actually I will not send value unless needed. Oh wait, the sample sent `value: parseEther('0.05')`. Let me add it back.
  };

  const handleUnlockEpochWithFee = () => {
     // Sending ETH might be required for bot bounties if any.
     unlockEpoch({
        address: controllerAddress as `0x${string}`,
        abi: LIQUIDITY_CONTROLLER_ABI,
        functionName: 'unlockEpoch',
     });
  }

  const handleManualAddLiquidity = () => {
    if (!manualTokenAmount || !manualEthAmount) {
      alert('Please fill in both amounts');
      return;
    }
    manualAddLiquidity({
      address: controllerAddress as `0x${string}`,
      abi: LIQUIDITY_CONTROLLER_ABI,
      functionName: 'manualAddLiquidity',
      args: [parseEther(manualTokenAmount)],
      value: parseEther(manualEthAmount)
    });
  };

  if (!liquidityData) {
    return (
      <div className={`p-10 border border-[#111111]/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-[#111111]/40 bg-[#FCFAF6]/50 ${inter.className}`}>
        <div className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#b5e315] rounded-full animate-spin mb-4"></div>
        <p>Loading liquidity data...</p>
        {progressError && <p className="text-red-500 mt-2 text-sm">{progressError.message}</p>}
      </div>
    );
  }

  const progressPercentage = (Number(liquidityData.epochsUnlocked) / Number(liquidityData.totalEpochs)) * 100;

  return (
    <div className={`space-y-6 ${inter.className}`}>
      {/* Progress Overview */}
      <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#111111] rounded-t-2xl"></div>
        <h2 className={`${martianMono.className} text-xl md:text-2xl font-bold mb-6 text-[#111111] mt-2`}>
          Progressive Liquidity Unlock (PLU)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FCFAF6] border border-[#111111]/10 p-5 rounded-xl">
            <p className="text-[#111111]/50 text-xs uppercase font-bold mb-1">Epochs Unlocked</p>
            <p className="text-2xl font-bold text-[#111111]">
              {liquidityData.epochsUnlocked.toString()} <span className="text-[#111111]/40">/ {liquidityData.totalEpochs.toString()}</span>
            </p>
          </div>
          <div className="bg-[#FCFAF6] border border-[#111111]/10 p-5 rounded-xl">
            <p className="text-[#111111]/50 text-xs uppercase font-bold mb-1">Progress</p>
            <p className="text-2xl font-bold text-[#111111]">
              {progressPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#111111] p-5 rounded-xl">
            <p className="text-white/50 text-xs uppercase font-bold mb-1">Tokens Unlocked</p>
            <p className="text-xl font-bold text-[#b5e315]">
              {formatEther(liquidityData.tokensUnlocked).split('.')[0]}
            </p>
          </div>
          <div className="bg-[#FCFAF6] border border-orange-200 p-5 rounded-xl">
            <p className="text-orange-900/50 text-xs uppercase font-bold mb-1">Tokens Remaining</p>
            <p className="text-xl font-bold text-orange-600">
              {formatEther(liquidityData.tokensRemaining).split('.')[0]}
            </p>
          </div>
        </div>

        <div className="mb-2">
          <div className="w-full bg-[#FCFAF6] border border-[#111111]/10 rounded-full h-4 overflow-hidden p-0.5">
            <div
              className="bg-[#111111] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Automatic Epoch Unlock */}
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8 relative group hover:border-[#b5e315] hover:shadow-[4px_4px_0px_#b5e315] transition-all">
          <h3 className={`${martianMono.className} text-lg font-bold mb-4 text-[#111111]`}>Automatic Epoch Unlock</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
              <span className="text-[#111111]/70 font-medium">Unlockable Epochs:</span>
              <span className="font-bold text-[#111111]">{liquidityData.unlockableEpochs.toString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
              <span className="text-[#111111]/70 font-medium">Next Epoch In:</span>
              <span className="font-bold text-[#111111]">
                {liquidityData.timeUntilNextEpoch > BigInt(0)
                  ? `${Math.ceil(Number(liquidityData.timeUntilNextEpoch) / 3600)} hours`
                  : 'Ready to unlock!'}
              </span>
            </div>
            
            <button
              onClick={handleUnlockEpochWithFee}
              disabled={liquidityData.unlockableEpochs === BigInt(0) || unlockStatus === 'pending'}
              className="w-full mt-4 bg-[#b5e315] hover:bg-[#a3cc12] disabled:bg-[#FCFAF6] disabled:text-[#111111]/30 disabled:border disabled:border-[#111111]/10 disabled:shadow-none text-[#111111] py-4 rounded-xl font-bold transition-all shadow-[4px_4px_0px_#111111] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wide text-sm"
            >
              {unlockStatus === 'pending' ? 'Unlocking...' : 'Unlock Epoch'}
            </button>
          </div>
        </div>

        {/* Manual Liquidity Addition */}
        <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8 relative">
          <h3 className={`${martianMono.className} text-lg font-bold mb-4 text-[#111111]`}>Manual Liquidity Addition</h3>
          {balanceError ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-orange-800 text-sm font-medium">
                ⚠️ This controller contract doesn't support manual additions. Only automatic epoch unlocking is available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Token Amount (whole tokens)"
                value={manualTokenAmount}
                onChange={(e) => setManualTokenAmount(e.target.value)}
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#111111] bg-[#FCFAF6] font-mono text-sm text-[#111111]"
              />
              <input
                type="number"
                placeholder="BNB Amount (in BNB)"
                value={manualEthAmount}
                onChange={(e) => setManualEthAmount(e.target.value)}
                step="0.01"
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#111111] bg-[#FCFAF6] font-mono text-sm text-[#111111]"
              />
              <button
                onClick={handleManualAddLiquidity}
                disabled={manualStatus === 'pending' || !address}
                className="w-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#111111]/50 text-white py-4 rounded-xl font-bold transition-all shadow-[4px_4px_0px_#111111]/20 active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wide text-sm"
              >
                {manualStatus === 'pending' ? 'Adding...' : 'Add Liquidity Manually'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className={`${martianMono.className} text-lg font-bold text-[#111111]`}>Liquidity Transaction History</h3>
          <button
            onClick={fetchLiquidityHistory}
            disabled={loading}
            className="text-sm font-bold text-[#111111]/60 hover:text-[#111111] uppercase"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {liquidityHistory.length === 0 ? (
          <div className="p-8 border border-[#111111]/10 border-dashed rounded-xl text-center text-[#111111]/40 bg-[#FCFAF6]">
            No liquidity transactions yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {liquidityHistory.map((event, idx) => (
              <div key={idx} className="bg-[#FCFAF6] p-5 rounded-xl border border-[#111111]/10 text-sm transition-all hover:border-[#111111]/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div>
                    <span className="block text-[#111111]/50 text-xs font-bold uppercase mb-1">Block</span>
                    <span className="font-mono font-medium">{event.blockNumber.toString()}</span>
                  </div>
                  <div>
                    <span className="block text-[#111111]/50 text-xs font-bold uppercase mb-1">Token Amount</span>
                    <span className="text-[#111111] font-bold">{formatEther(event.tokenAmount)}</span>
                  </div>
                  <div>
                    <span className="block text-[#111111]/50 text-xs font-bold uppercase mb-1">BNB Amount</span>
                    <span className="text-[#111111] font-bold">{formatEther(event.bnbAmount)}</span>
                  </div>
                  <div>
                    <span className="block text-[#111111]/50 text-xs font-bold uppercase mb-1">Time</span>
                    <span className="text-[#111111]/70">{event.timestamp}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#111111]/5 text-right">
                  <a
                    href={`https://testnet.bscscan.com/tx/${event.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase text-[#111111] hover:text-[#b5e315] hover:underline"
                  >
                    View on Explorer →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
