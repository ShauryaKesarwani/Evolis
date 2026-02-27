'use client'

import { useAccount, useReadContract } from 'wagmi'
import { TOKEN_FACTORY_ABI, LIQUIDITY_CONTROLLER_ABI, ERC20_ABI } from '@/lib/abi'
import { FACTORY_ADDRESS } from '@/lib/config'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import LiquidityDashboard from './LiquidityDashboard'

export default function MyDeployments() {
  const { address, isConnected } = useAccount()
  const [selectedController, setSelectedController] = useState<string | null>(null)

  // Get user deployments
  const { data: deployments, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getUserDeployments',
    args: address ? [address] : undefined,
  })

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to view your deployments
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!deployments || deployments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No deployments yet. Deploy your first token!
        </p>
      </div>
    )
  }

  if (selectedController) {
    return (
      <div>
        <button
          onClick={() => setSelectedController(null)}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ← Back to Deployments
        </button>
        <LiquidityDashboard controllerAddress={selectedController} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deployments.map((tokenAddress) => (
        <DeploymentCard
          key={tokenAddress}
          tokenAddress={tokenAddress}
          onManageLiquidity={(controllerAddr) => setSelectedController(controllerAddr)}
        />
      ))}
    </div>
  )
}

function DeploymentCard({ tokenAddress, onManageLiquidity }: { tokenAddress: string; onManageLiquidity: (controller: string) => void }) {
  // Get deployment info
  const { data: deploymentInfo } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'deploymentInfo',
    args: [tokenAddress as `0x${string}`],
  })

  // Get token name
  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'name',
  })

  // Get token symbol
  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
  })

  // Get unlock progress
  const { data: unlockProgress } = useReadContract({
    address: deploymentInfo?.[1] as `0x${string}`,
    abi: LIQUIDITY_CONTROLLER_ABI,
    functionName: 'getUnlockProgress',
  })

  if (!deploymentInfo) return null

  const [, controller, , timestamp, totalSupply, initialTokens, lockedTokens] = deploymentInfo
  const progress = unlockProgress
    ? Number(unlockProgress[0]) / Number(unlockProgress[1]) * 100
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {tokenName} ({tokenSymbol})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
          </p>
        </div>
        <a
          href={`https://bscscan.com/token/${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          View on BSCScan →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Supply</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatEther(totalSupply)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Initial Liquidity</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatEther(initialTokens)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Locked Tokens</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatEther(lockedTokens)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Deployed</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date(Number(timestamp) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {unlockProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unlock Progress</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {unlockProgress[0].toString()} / {unlockProgress[1].toString()} epochs
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onManageLiquidity(controller as string)}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors"
        >
          Manage Liquidity
        </button>
        <a
          href={`https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-primary hover:bg-yellow-500 text-black text-center py-2 px-4 rounded-md font-medium transition-colors"
        >
          Trade on PancakeSwap
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(tokenAddress)}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          Copy Address
        </button>
      </div>
    </div>
  )
}
