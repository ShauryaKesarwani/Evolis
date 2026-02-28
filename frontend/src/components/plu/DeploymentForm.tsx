'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, usePublicClient } from 'wagmi';
import { decodeEventLog, parseEther } from 'viem';
import { Inter, Martian_Mono } from 'next/font/google';
import { TOKEN_FACTORY_ABI } from '@/lib/pluAbi';
import { FACTORY_ADDRESS, PANCAKE_ROUTER } from '@/lib/pluConfig';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

export default function DeploymentForm() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    initialLiquidityPercent: '20',
    unlockDuration: '30',
    epochDuration: '1',
    bnbAmount: '0.1',
  });

  const [derivedData, setDerivedData] = useState({
    initialTokens: '0',
    lockedTokens: '0',
    totalEpochs: 0,
    unlockPerEpoch: '0',
  });

  const [deployedAddresses, setDeployedAddresses] = useState<{
    token: string;
    controller: string;
  } | null>(null);
  const [deploymentLookupError, setDeploymentLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuccess || !receipt) return;

    try {
      setDeploymentLookupError(null);

      const deploymentLog = receipt.logs.find((log) => {
        if (!log.address) return false;
        return log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase();
      });

      if (!deploymentLog) {
        setDeploymentLookupError('Deployment succeeded, but no factory event log was found for this transaction.');
        return;
      }

      const decoded = decodeEventLog({
        abi: TOKEN_FACTORY_ABI,
        data: deploymentLog.data,
        topics: deploymentLog.topics,
      }) as any;

      if (decoded.eventName !== 'TokenDeployed') {
        setDeploymentLookupError('Deployment succeeded, but TokenDeployed event was not found in receipt logs.');
        return;
      }

      const token = decoded.args.token as `0x${string}`;
      const controller = decoded.args.controller as `0x${string}`;

      setDeployedAddresses({ token, controller });
    } catch (lookupError) {
      console.error('Failed to decode deployment logs:', lookupError);
      setDeploymentLookupError('Deployment succeeded, but addresses could not be decoded from transaction logs.');
    }
  }, [isSuccess, receipt]);

  const calculateDerived = () => {
    const supply = parseFloat(formData.totalSupply) || 0;
    const percent = parseFloat(formData.initialLiquidityPercent) || 0;
    const unlockDur = parseFloat(formData.unlockDuration) || 0;
    const epochDur = parseFloat(formData.epochDuration) || 0;

    const initial = (supply * percent) / 100;
    const locked = supply - initial;
    const epochs = epochDur > 0 ? Math.floor(unlockDur / epochDur) : 0;
    const perEpoch = epochs > 0 ? locked / epochs : 0;

    setDerivedData({
      initialTokens: initial.toFixed(2),
      lockedTokens: locked.toFixed(2),
      totalEpochs: epochs,
      unlockPerEpoch: perEpoch.toFixed(2),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (chainId !== 31337 && chainId !== 97) {
      try {
        await switchChain({ chainId: 97 }); // Switch to testnet by default or local
      } catch (err) {
        console.error('Failed to switch chain:', err);
        alert('Please switch to the correct network in MetaMask');
        return;
      }
    }

    try {
      setDeployedAddresses(null);
      setDeploymentLookupError(null);

      if (!publicClient) {
        alert('RPC client is not ready. Please try again.');
        return;
      }

      if (FACTORY_ADDRESS === '0x' || FACTORY_ADDRESS === '0x0000000000000000000000000000000000000000') {
        alert('Factory address is not set. Update NEXT_PUBLIC_FACTORY_ADDRESS in .env.local');
        return;
      }

      const totalSupplyWei = parseEther(formData.totalSupply);
      const unlockDurationSec = BigInt(parseFloat(formData.unlockDuration) * 24 * 60 * 60);
      const epochDurationSec = BigInt(parseFloat(formData.epochDuration) * 24 * 60 * 60);
      const bnbValue = parseEther(formData.bnbAmount);

      writeContract({
        address: FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'deployTokenV2',
        args: [{
          name: formData.name,
          symbol: formData.symbol,
          totalSupply: totalSupplyWei,
          initialLiquidityPercent: BigInt(parseFloat(formData.initialLiquidityPercent) * 100),
          unlockDuration: unlockDurationSec,
          epochDuration: epochDurationSec,
          evolisFactory: FACTORY_ADDRESS,
        }],
        value: bnbValue,
      });
    } catch (err) {
      console.error('Deployment error:', err);
    }
  };

  return (
    <div className={`bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-10 relative shadow-sm ${inter.className}`}>
      <div className="absolute top-0 left-0 w-full h-2 bg-[#111111] rounded-t-2xl"></div>

      <div className="mb-8 mt-2">
        <h2 className="text-sm font-bold text-[#111111]/50 uppercase tracking-widest mb-1">Deployment</h2>
        <h3 className={`${martianMono.className} text-2xl md:text-3xl font-bold text-[#111111]`}>Create Token with PLU</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-[#111111]/10 rounded-xl p-6 bg-[#FCFAF6]">
          <h4 className="text-xs font-bold text-[#111111]/50 uppercase mb-4">Token Details</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Token Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Evolis Token"
                required
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Token Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="EVO"
                required
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Total Supply</label>
            <input
              type="number"
              name="totalSupply"
              value={formData.totalSupply}
              onChange={handleInputChange}
              onBlur={calculateDerived}
              placeholder="1000000"
              required
              step="any"
              className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
            />
          </div>
        </div>

        <div className="border border-[#111111]/10 rounded-xl p-6 bg-[#FCFAF6]">
          <h4 className="text-xs font-bold text-[#111111]/50 uppercase mb-4">Liquidity Configuration</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Initial Liquidity (%)</label>
              <input
                type="number"
                name="initialLiquidityPercent"
                value={formData.initialLiquidityPercent}
                onChange={handleInputChange}
                onBlur={calculateDerived}
                placeholder="20"
                required
                min="1"
                max="99"
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">BNB Amount</label>
              <input
                type="number"
                name="bnbAmount"
                value={formData.bnbAmount}
                onChange={handleInputChange}
                placeholder="0.1"
                required
                step="0.001"
                min="0.001"
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
          </div>
        </div>

        <div className="border border-[#111111]/10 rounded-xl p-6 bg-[#FCFAF6]">
          <h4 className="text-xs font-bold text-[#111111]/50 uppercase mb-4">Unlock Schedule</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Total Unlock Duration (days)</label>
              <input
                type="number"
                name="unlockDuration"
                value={formData.unlockDuration}
                onChange={handleInputChange}
                onBlur={calculateDerived}
                placeholder="30"
                required
                min="1"
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2 uppercase text-xs">Epoch Duration (days)</label>
              <input
                type="number"
                name="epochDuration"
                value={formData.epochDuration}
                onChange={handleInputChange}
                onBlur={calculateDerived}
                placeholder="1"
                required
                min="1"
                className="w-full px-4 py-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#b5e315] focus:ring-1 focus:ring-[#b5e315] bg-white font-mono text-sm text-[#111111]"
              />
            </div>
          </div>
        </div>

        {derivedData.totalEpochs > 0 && (
          <div className="border border-[#111111]/10 rounded-xl p-5 bg-[#111111] text-[#FCFAF6]">
            <h4 className="text-xs font-bold text-[#b5e315] uppercase mb-4">Calculated Projected Values</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
              <div>
                <p className="text-white/50 mb-1">Initial</p>
                <p className="text-white font-bold">{derivedData.initialTokens}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Locked</p>
                <p className="text-white font-bold">{derivedData.lockedTokens}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Epochs</p>
                <p className="text-white font-bold">{derivedData.totalEpochs}</p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Per Epoch</p>
                <p className="text-white font-bold">{derivedData.unlockPerEpoch}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="bg-[#b5e315]/10 border border-[#b5e315] p-5 rounded-xl">
            <p className="font-bold text-[#111111] mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b5e315]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Token Deployed Successfully!
            </p>
            {deployedAddresses && (
              <div className="font-mono text-sm text-[#111111]/80 space-y-1">
                <p>Token: <span className="font-bold">{deployedAddresses.token}</span></p>
                <p>Controller: <span className="font-bold">{deployedAddresses.controller}</span></p>
              </div>
            )}
            {deploymentLookupError && (
              <p className="mt-2 text-sm text-[#111111]/60">{deploymentLookupError}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!isConnected || isPending || isConfirming}
          className="w-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#111111]/50 text-white font-bold py-4 px-6 rounded-xl shadow-[4px_4px_0px_#b5e315] disabled:shadow-none transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {!isConnected
            ? 'Connect Wallet First'
            : isPending
            ? 'Confirming in Wallet...'
            : isConfirming
            ? 'Deploying...'
            : 'Deploy Token'}
        </button>
      </form>
    </div>
  );
}
