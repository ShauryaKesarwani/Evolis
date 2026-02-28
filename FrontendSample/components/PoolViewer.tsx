'use client'

import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { EVOLIS_POOL_ABI } from '@/lib/abi'
import { EVOLIS_POOL, TOKEN_ADDRESS } from '@/lib/config'

export default function PoolViewer() {
  const { address, isConnected } = useAccount()
  const [buyAmount, setBuyAmount] = useState('0.01')
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Read pool data
  const { data: fundingGoal, refetch: refetchGoal } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'fundingGoal',
  })
  
  const { data: totalRaised, refetch: refetchRaised } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'totalRaised',
  })
  
  const { data: goalReached, refetch: refetchGoalReached } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'goalReached',
  })
  
  const { data: tokensSold, refetch: refetchTokensSold } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'tokensSoldInCurve',
  })
  
  const { data: bondingSupply, refetch: refetchSupply } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'bondingSupply',
  })
  
  const { data: deadline, refetch: refetchDeadline } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'deadline',
  })
  
  const { data: myContribution, refetch: refetchContribution } = useReadContract({
    address: EVOLIS_POOL,
    abi: EVOLIS_POOL_ABI,
    functionName: 'contributions',
    args: address ? [address] : undefined,
  })

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Refetch data after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchGoal()
      refetchRaised()
      refetchGoalReached()
      refetchTokensSold()
      refetchSupply()
      refetchContribution()
    }
  }, [isConfirmed])

  const handleBuy = () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      const bnbValue = parseEther(buyAmount)
      
      writeContract({
        address: EVOLIS_POOL,
        abi: EVOLIS_POOL_ABI,
        functionName: 'buyBondingCurve',
        args: [BigInt(1)], // minTokensOut = 1 (accept any amount)
        value: bnbValue,
      })
    } catch (err) {
      console.error('Buy error:', err)
    }
  }

  const handleClaimEvoLp = () => {
    if (!isConnected || !goalReached) {
      alert('Goal must be reached before claiming EvoLP')
      return
    }
    
    writeContract({
      address: EVOLIS_POOL,
      abi: EVOLIS_POOL_ABI,
      functionName: 'claimEvoLp',
    })
  }

  const handleRefund = () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    writeContract({
      address: EVOLIS_POOL,
      abi: EVOLIS_POOL_ABI,
      functionName: 'refund',
    })
  }

  const progressPercent = fundingGoal && totalRaised 
    ? Math.min((Number(totalRaised) / Number(fundingGoal)) * 100, 100) 
    : 0

  const tokensRemaining = bondingSupply && tokensSold
    ? formatEther(BigInt(bondingSupply) - BigInt(tokensSold))
    : '0'

  const deadlineDate = deadline ? new Date(Number(deadline) * 1000) : null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Evolis Crowdfunding Pool</h1>
      
      {/* Pool Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Progress</h2>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progressPercent.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Raised</p>
            <p className="text-2xl font-bold">
              {totalRaised ? formatEther(totalRaised) : '0'} BNB
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Funding Goal</p>
            <p className="text-2xl font-bold">
              {fundingGoal ? formatEther(fundingGoal) : '0'} BNB
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tokens Remaining</p>
            <p className="text-lg font-semibold">
              {Number(tokensRemaining).toLocaleString()} tokens
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-lg font-semibold ${goalReached ? 'text-green-600' : 'text-blue-600'}`}>
              {goalReached ? '✅ Goal Reached!' : '🚀 Active'}
            </p>
          </div>
        </div>

        {deadlineDate && (
          <div className="text-sm text-gray-600">
            <p>Deadline: {deadlineDate.toLocaleDateString()} {deadlineDate.toLocaleTimeString()}</p>
          </div>
        )}

        {myContribution && Number(myContribution) > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-700">
              Your Contribution: <span className="font-semibold">{formatEther(myContribution)} BNB</span>
            </p>
        </div>
        )}
      </div>

      {/* Buy Tokens */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Buy Tokens</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (BNB)
          </label>
          <input
            type="number"
            step="0.01"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">
            Price: 1 BNB = 1000 tokens (minus 1.5% fees)
          </p>
          <p className="text-sm text-gray-700 mt-1">
            You'll receive: ~{(parseFloat(buyAmount) * 1000 * 0.985).toFixed(2)} tokens
          </p>
        </div>

        <button
          onClick={handleBuy}
          disabled={!isConnected || isPending || isConfirming || goalReached === true}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {!isConnected
            ? 'Connect Wallet First'
            : isPending
            ? 'Confirming...'
            : isConfirming
            ? 'Processing...'
            : goalReached
            ? 'Goal Reached - Buying Closed'
            : 'Buy Tokens'}
        </button>

        {hash && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="text-sm text-gray-700">
              Transaction: <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" className="text-blue-600 hover:underline" rel="noreferrer">View on BSCscan</a>
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <p className="text-sm text-red-700">Error: {error.message}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="space-y-3">
          {goalReached && (
            <button
              onClick={handleClaimEvoLp}
              disabled={!isConnected || isPending}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 transition"
            >
              Claim EvoLP Tokens
            </button>
          )}

          {!goalReached && (
            <button
              onClick={handleRefund}
              disabled={!isConnected || isPending}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 transition"
            >
              Refund (if deadline passed)
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Pool Address:</strong> {EVOLIS_POOL}</p>
          <p><strong>Token Address:</strong> {TOKEN_ADDRESS}</p>
        </div>
      </div>
    </div>
  )
}
