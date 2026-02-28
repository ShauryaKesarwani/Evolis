'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { parseEther } from 'viem';
import { factoryAbi } from '@/chain/abis';

export default function CreatePoolPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [bondingSupply, setBondingSupply] = useState('400000');
  const [initialPrice, setInitialPrice] = useState('0.000001');
  const [fundingGoal, setFundingGoal] = useState('1');
  const [deadlineDays, setDeadlineDays] = useState('30');
  
  const { isConnected, chainId, address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      alert('Please enter a valid token address');
      return;
    }

    setIsDeploying(true);

    try {
      // Switch to BSC Testnet if needed
      if (chainId !== bscTestnet.id) {
        if (!switchChainAsync) {
          alert('Please switch to BSC Testnet manually');
          setIsDeploying(false);
          return;
        }
        await switchChainAsync({ chainId: bscTestnet.id });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
      if (!factoryAddress) {
        throw new Error('Factory address not configured');
      }

      // Calculate values
      const bondingSupplyWei = BigInt(Math.floor(parseFloat(bondingSupply) * 1e18));
      const initialPriceWei = BigInt(Math.floor(parseFloat(initialPrice) * 1e18));
      const fundingGoalWei = parseEther(fundingGoal);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (parseInt(deadlineDays) * 24 * 60 * 60);
      const milestoneDeadline = deadlineTimestamp + (30 * 24 * 60 * 60); // 30 days after deadline

      console.log('Creating pool with config:', {
        tokenAddress,
        owner: address,
        bondingSupply: bondingSupplyWei.toString(),
        initialPrice: initialPriceWei.toString(),
        fundingGoal: fundingGoalWei.toString(),
        deadline: deadlineTimestamp,
        milestoneDeadline
      });

      const txHash = await writeContractAsync({
        abi: factoryAbi,
        address: factoryAddress,
        functionName: 'createPool',
        chainId: bscTestnet.id,
        args: [{
          lpName: 'Evolis LP',
          lpSymbol: 'EvoLP',
          projectToken: tokenAddress as `0x${string}`,
          projectOwner: address as `0x${string}`,
          bondingSupply: bondingSupplyWei,
          bondingInitialPrice: initialPriceWei,
          bondingSlope: BigInt(0), // Fixed price
          fundingGoal: fundingGoalWei,
          deadline: BigInt(deadlineTimestamp),
          milestoneDeadline: BigInt(milestoneDeadline)
        }]
      });

      console.log('Pool created! Transaction:', txHash);
      alert(`Pool created successfully!\\n\\nTransaction: ${txHash}\\n\\nView on BSCScan: https://testnet.bscscan.com/tx/${txHash}`);
      
    } catch (error: any) {
      console.error('Failed to create pool:', error);
      alert(`Failed to create pool: ${error.message || error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Fundraising Pool</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="bg-yellow-900/50 border border-yellow-600 rounded p-4 mb-6">
            <h3 className="font-bold mb-2">⚠️ Prerequisites</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Deploy your Token &amp; Controller using forge scripts</li>
              <li>Transfer bonding tokens to the pool (after creation)</li>
              <li>See <code className="bg-gray-900 px-2 py-1 rounded">DEPLOYMENT_GUIDE.md</code> for details</li>
            </ol>
          </div>

          <form onSubmit={handleCreatePool} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Your Token Address *</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                Must be deployed on BSC Testnet first
              </p>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Bonding Supply (tokens)</label>
              <input
                type="number"
                value={bondingSupply}
                onChange={(e) => setBondingSupply(e.target.value)}
                placeholder="400000"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                Tokens available for sale via bonding curve
              </p>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Initial Price (BNB per token)</label>
              <input
                type="number"
                step="0.000001"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                placeholder="0.000001"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                Fixed price (slope = 0)
              </p>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Funding Goal (BNB)</label>
              <input
                type="number"
                step="0.1"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Deadline (days)</label>
              <input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isDeploying || !isConnected}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {isDeploying ? 'Creating Pool...' : isConnected ? 'Create Pool' : 'Connect Wallet First'}
            </button>
          </form>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="font-bold mb-3">📝 After Pool Creation:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Note the pool address from the transaction</li>
            <li>Transfer tokens from your wallet to the pool</li>
            <li>Users can then buy tokens via the bonding curve</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
