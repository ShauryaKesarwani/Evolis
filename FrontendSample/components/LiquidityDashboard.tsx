'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from 'wagmi'
import { parseEther, formatEther, decodeEventLog } from 'viem'
import { LIQUIDITY_CONTROLLER_ABI } from '@/lib/abi'

interface LiquidityData {
  epochsUnlocked: bigint
  totalEpochs: bigint
  tokensUnlocked: bigint
  tokensRemaining: bigint
  tokenBalance: bigint
  timeUntilNextEpoch: bigint
  unlockableEpochs: bigint
}

interface LiquidityEvent {
  hash: string
  blockNumber: bigint
  epoch: bigint
  tokenAmount: bigint
  bnbAmount: bigint
  liquidity: bigint
  timestamp: string
}

export default function LiquidityDashboard({ controllerAddress }: { controllerAddress: string }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [liquidityData, setLiquidityData] = useState<LiquidityData | null>(null)
  const [liquidityHistory, setLiquidityHistory] = useState<LiquidityEvent[]>([])
  const [manualTokenAmount, setManualTokenAmount] = useState('')
  const [manualEthAmount, setManualEthAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // Read unlock progress
  const { data: unlockProgress, error: progressError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockProgress',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  })

  // Read token balance
  const { data: tokenBalance, error: balanceError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getTokenBalance',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  })

  // Read unlockable epochs
  const { data: unlockableEpochs, error: epochError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockableEpochs',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  })

  // Read time until next epoch
  const { data: timeUntilNextEpoch, error: timeError } = useReadContract({
    address: controllerAddress as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getTimeUntilNextEpoch',
    query: { enabled: !!controllerAddress, refetchInterval: 10000 }
  })

  // Write contracts
  const { writeContract: unlockEpoch, data: unlockHash } = useWriteContract()
  const { writeContract: manualAddLiquidity, data: manualHash } = useWriteContract()

  // Wait for transactions
  const { status: unlockStatus } = useWaitForTransactionReceipt({ hash: unlockHash })
  const { status: manualStatus } = useWaitForTransactionReceipt({ hash: manualHash })

  // Update liquidity data
  useEffect(() => {
    if (unlockProgress && unlockableEpochs !== undefined && timeUntilNextEpoch !== undefined) {
      setLiquidityData({
        epochsUnlocked: unlockProgress[0],
        totalEpochs: unlockProgress[1],
        tokensUnlocked: unlockProgress[2],
        tokensRemaining: unlockProgress[3],
        tokenBalance: tokenBalance as bigint || unlockProgress[3], // Fallback to tokensRemaining if getTokenBalance fails
        timeUntilNextEpoch: timeUntilNextEpoch as bigint,
        unlockableEpochs: unlockableEpochs as bigint
      })
    }
  }, [unlockProgress, tokenBalance, unlockableEpochs, timeUntilNextEpoch])

  // Log errors for debugging (but don't block on tokenBalance error for old contracts)
  useEffect(() => {
    if (progressError) console.error('Progress error:', progressError)
    if (balanceError) console.warn('Balance error (old contract?):', balanceError)
    if (epochError) console.error('Epoch error:', epochError)
    if (timeError) console.error('Time error:', timeError)
  }, [progressError, balanceError, epochError, timeError])

  // Fetch transaction history
  const fetchLiquidityHistory = async () => {
    if (!publicClient) return
    
    try {
      setLoading(true)
      
      // Find the LiquidityUnlocked event from ABI
      const liquidityUnlockedEvent = LIQUIDITY_CONTROLLER_ABI.find(
        (item) => item.type === 'event' && item.name === 'LiquidityUnlocked'
      )

      if (!liquidityUnlockedEvent) {
        console.error('LiquidityUnlocked event not found in ABI')
        return
      }

      const logs = await publicClient.getLogs({
        address: controllerAddress as `0x${string}`,
        event: liquidityUnlockedEvent as any,
        fromBlock: BigInt(0),
        toBlock: 'latest'
      })

      const events: LiquidityEvent[] = []
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: LIQUIDITY_CONTROLLER_ABI,
            data: log.data,
            topics: log.topics
          }) as any

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          
          events.push({
            hash: log.transactionHash as string,
            blockNumber: log.blockNumber,
            epoch: decoded.args?.epoch || BigInt(0),
            tokenAmount: decoded.args?.tokenAmount || BigInt(0),
            bnbAmount: decoded.args?.bnbAmount || BigInt(0),
            liquidity: decoded.args?.liquidity || BigInt(0),
            timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString()
          })
        } catch (err) {
          console.error('Error decoding log:', err)
        }
      }

      setLiquidityHistory(events.sort((a, b) => Number(b.blockNumber - a.blockNumber)))
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (unlockStatus === 'success' || manualStatus === 'success') {
      fetchLiquidityHistory()
    }
  }, [unlockStatus, manualStatus])

  useEffect(() => {
    fetchLiquidityHistory()
  }, [publicClient])

  const handleUnlockEpoch = () => {
    unlockEpoch({
      address: controllerAddress as `0x${string}`,
      abi: LIQUIDITY_CONTROLLER_ABI,
      functionName: 'unlockEpoch',
      value: parseEther('0.05')
    })
  }

  const handleManualAddLiquidity = () => {
    if (!manualTokenAmount || !manualEthAmount) {
      alert('Please fill in both amounts')
      return
    }

    manualAddLiquidity({
      address: controllerAddress as `0x${string}`,
      abi: LIQUIDITY_CONTROLLER_ABI,
      functionName: 'manualAddLiquidity',
      args: [parseEther(manualTokenAmount)],
      value: parseEther(manualEthAmount)
    })
  }

  if (!liquidityData) {
    return (
      <div className="text-center py-8 bg-slate-700/50 rounded-lg p-6">
        <p className="text-slate-300 mb-2">Loading liquidity data...</p>
        <p className="text-xs text-slate-500">
          Controller: {controllerAddress.slice(0, 10)}...{controllerAddress.slice(-8)}
        </p>
        {progressError && <p className="text-xs text-red-400 mt-2">Error loading progress</p>}
        {balanceError && <p className="text-xs text-red-400 mt-2">Error loading balance</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      {/* Progress Overview */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
        <h2 className="text-2xl font-bold mb-4 text-green-400">Progressive Liquidity Unlock (PLU)</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded">
            <p className="text-slate-400 text-sm">Epochs Unlocked</p>
            <p className="text-2xl font-bold text-white">
              {liquidityData.epochsUnlocked.toString()} / {liquidityData.totalEpochs.toString()}
            </p>
          </div>
          
          <div className="bg-slate-800 p-4 rounded">
            <p className="text-slate-400 text-sm">Progress</p>
            <p className="text-2xl font-bold text-white">
              {((Number(liquidityData.epochsUnlocked) / Number(liquidityData.totalEpochs)) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded">
            <p className="text-slate-400 text-sm">Tokens Unlocked</p>
            <p className="text-lg font-bold text-green-400">
              {formatEther(liquidityData.tokensUnlocked).split('.')[0]}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded">
            <p className="text-slate-400 text-sm">Tokens Remaining</p>
            <p className="text-lg font-bold text-orange-400">
              {formatEther(liquidityData.tokensRemaining).split('.')[0]}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
              style={{
                width: `${(Number(liquidityData.epochsUnlocked) / Number(liquidityData.totalEpochs)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Controller Balance */}
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
        <p className="text-slate-400">Tokens in Controller</p>
        <p className="text-xl font-bold text-blue-400">{formatEther(liquidityData.tokenBalance)}</p>
      </div>

      {/* Automatic Epoch Unlock */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-blue-600">
        <h3 className="text-lg font-bold mb-3 text-blue-400">Automatic Epoch Unlock</h3>
        <div className="space-y-3">
          <p className="text-slate-300">
            Unlockable Epochs: <span className="font-bold text-yellow-400">{liquidityData.unlockableEpochs.toString()}</span>
          </p>
          <p className="text-slate-300">
            Time until next epoch:{' '}
            <span className="font-bold text-yellow-400">
              {liquidityData.timeUntilNextEpoch > BigInt(0)
                ? `${Math.ceil(Number(liquidityData.timeUntilNextEpoch) / 3600)} hours`
                : 'Ready to unlock!'}
            </span>
          </p>
          
          <button
            onClick={handleUnlockEpoch}
            disabled={liquidityData.unlockableEpochs === BigInt(0) || unlockStatus === 'pending'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded font-bold transition"
          >
            {unlockStatus === 'pending' ? 'Unlocking...' : 'Unlock Epoch'}
          </button>
        </div>
      </div>

      {/* Manual Liquidity Addition */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-purple-600">
        <h3 className="text-lg font-bold mb-3 text-purple-400">Manual Liquidity Addition</h3>
        
        {balanceError ? (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded p-4 mb-4">
            <p className="text-yellow-300 text-sm">
              ⚠️ This controller contract doesn't support manual liquidity additions.
              Only automatic epoch unlocking is available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Token Amount (whole tokens)"
              value={manualTokenAmount}
              onChange={(e) => setManualTokenAmount(e.target.value)}
              className="w-full bg-slate-800 text-white p-3 rounded border border-slate-600 placeholder-slate-500"
            />
            
            <input
              type="number"
              placeholder="ETH Amount (in ETH)"
              value={manualEthAmount}
              onChange={(e) => setManualEthAmount(e.target.value)}
              step="0.01"
              className="w-full bg-slate-800 text-white p-3 rounded border border-slate-600 placeholder-slate-500"
            />
            
            <button
              onClick={handleManualAddLiquidity}
              disabled={manualStatus === 'pending' || !address}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white py-3 rounded font-bold transition"
            >
              {manualStatus === 'pending' ? 'Adding...' : 'Add Liquidity Manually'}
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-bold mb-4 text-green-400">Liquidity Transaction History</h3>
        
        <button
          onClick={fetchLiquidityHistory}
          disabled={loading}
          className="mb-4 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Refresh History'}
        </button>

        {liquidityHistory.length === 0 ? (
          <p className="text-slate-400">No liquidity transactions yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liquidityHistory.map((event, idx) => (
              <div key={idx} className="bg-slate-800 p-4 rounded border border-slate-600 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Block:</span>
                  <span className="text-white font-mono">{event.blockNumber.toString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Token Amount:</span>
                  <span className="text-green-400 font-bold">{formatEther(event.tokenAmount)} tokens</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">BNB Amount:</span>
                  <span className="text-blue-400 font-bold">{formatEther(event.bnbAmount)} ETH</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">LP Tokens:</span>
                  <span className="text-purple-400 font-bold">{formatEther(event.liquidity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-slate-300">{event.timestamp}</span>
                </div>
                <a
                  href={`https://etherscan.io/tx/${event.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2 block"
                >
                  View on Explorer →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
