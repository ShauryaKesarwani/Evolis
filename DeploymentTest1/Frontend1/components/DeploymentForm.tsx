'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, usePublicClient } from 'wagmi'
import { decodeEventLog, parseEther, formatEther } from 'viem'
import { TOKEN_FACTORY_ABI } from '@/lib/abi'
import { FACTORY_ADDRESS, PANCAKE_ROUTER } from '@/lib/config'

export default function DeploymentForm() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    initialLiquidityPercent: '20',
    unlockDuration: '30',
    epochDuration: '1',
    bnbAmount: '0.1',
  })

  const [derivedData, setDerivedData] = useState({
    initialTokens: '0',
    lockedTokens: '0',
    totalEpochs: 0,
    unlockPerEpoch: '0',
  })

  const [deployedAddresses, setDeployedAddresses] = useState<{
    token: string
    controller: string
  } | null>(null)
  const [deploymentLookupError, setDeploymentLookupError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSuccess || !receipt) {
      return
    }

    try {
      setDeploymentLookupError(null)

      const deploymentLog = receipt.logs.find((log) => {
        if (!log.address) {
          return false
        }
        return log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()
      })

      if (!deploymentLog) {
        setDeploymentLookupError('Deployment succeeded, but no factory event log was found for this transaction.')
        return
      }

      const decoded = decodeEventLog({
        abi: TOKEN_FACTORY_ABI,
        data: deploymentLog.data,
        topics: deploymentLog.topics,
      })

      if (decoded.eventName !== 'TokenDeployed') {
        setDeploymentLookupError('Deployment succeeded, but TokenDeployed event was not found in receipt logs.')
        return
      }

      const token = decoded.args.token as `0x${string}`
      const controller = decoded.args.controller as `0x${string}`

      setDeployedAddresses({ token, controller })
    } catch (lookupError) {
      console.error('Failed to decode deployment logs:', lookupError)
      setDeploymentLookupError('Deployment succeeded, but addresses could not be decoded from transaction logs.')
    }
  }, [isSuccess, receipt])

  // Calculate derived values
  const calculateDerived = () => {
    const supply = parseFloat(formData.totalSupply) || 0
    const percent = parseFloat(formData.initialLiquidityPercent) || 0
    const unlockDur = parseFloat(formData.unlockDuration) || 0
    const epochDur = parseFloat(formData.epochDuration) || 0

    const initial = (supply * percent) / 100
    const locked = supply - initial
    const epochs = Math.floor(unlockDur / epochDur)
    const perEpoch = epochs > 0 ? locked / epochs : 0

    setDerivedData({
      initialTokens: initial.toFixed(2),
      lockedTokens: locked.toFixed(2),
      totalEpochs: epochs,
      unlockPerEpoch: perEpoch.toFixed(2),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      alert('Please connect your wallet')
      return
    }

    // Switch to Anvil Local (Chain ID: 31337) if not already on it
    if (chainId !== 31337) {
      try {
        await switchChain({ chainId: 31337 })
      } catch (err) {
        console.error('Failed to switch chain:', err)
        alert('Please switch to Anvil Local network in MetaMask')
        return
      }
    }

    try {
      setDeployedAddresses(null)
      setDeploymentLookupError(null)

      if (!publicClient) {
        alert('RPC client is not ready. Please try again.')
        return
      }

      if (FACTORY_ADDRESS === '0x') {
        alert('Factory address is not set. Update NEXT_PUBLIC_FACTORY_ADDRESS in Frontend/.env.local')
        return
      }

      const factoryCode = await publicClient.getCode({ address: FACTORY_ADDRESS })
      if (!factoryCode || factoryCode === '0x') {
        alert('No factory contract found at configured address. Redeploy factory and update NEXT_PUBLIC_FACTORY_ADDRESS.')
        return
      }

      if (PANCAKE_ROUTER === '0x') {
        alert('Router address is not set. Update NEXT_PUBLIC_PANCAKE_ROUTER in Frontend/.env.local')
        return
      }

      const routerCode = await publicClient.getCode({ address: PANCAKE_ROUTER })
      if (!routerCode || routerCode === '0x') {
        alert('No router contract found at configured address. Redeploy mock router and update NEXT_PUBLIC_PANCAKE_ROUTER.')
        return
      }

      const totalSupplyWei = parseEther(formData.totalSupply)
      const unlockDurationSec = BigInt(parseFloat(formData.unlockDuration) * 24 * 60 * 60)
      const epochDurationSec = BigInt(parseFloat(formData.epochDuration) * 24 * 60 * 60)
      const bnbValue = parseEther(formData.bnbAmount)

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
          router: PANCAKE_ROUTER,
        }],
        value: bnbValue,
      })
    } catch (err) {
      console.error('Deployment error:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Deploy Token with PLU
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Token Details
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Token Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My Token"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Token Symbol
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="MTK"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Supply
            </label>
            <input
              type="number"
              name="totalSupply"
              value={formData.totalSupply}
              onChange={handleInputChange}
              onBlur={calculateDerived}
              placeholder="1000000"
              required
              step="any"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Liquidity Configuration */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Liquidity Configuration
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Liquidity (%)
            </label>
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentage of tokens for initial liquidity pool
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              BNB Amount
            </label>
            <input
              type="number"
              name="bnbAmount"
              value={formData.bnbAmount}
              onChange={handleInputChange}
              placeholder="0.1"
              required
              step="0.001"
              min="0.001"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              BNB for initial liquidity pool
            </p>
          </div>
        </div>

        {/* Unlock Schedule */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Unlock Schedule
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Unlock Duration (days)
            </label>
            <input
              type="number"
              name="unlockDuration"
              value={formData.unlockDuration}
              onChange={handleInputChange}
              onBlur={calculateDerived}
              placeholder="30"
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Epoch Duration (days)
            </label>
            <input
              type="number"
              name="epochDuration"
              value={formData.epochDuration}
              onChange={handleInputChange}
              onBlur={calculateDerived}
              placeholder="1"
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time between each liquidity unlock
            </p>
          </div>
        </div>

        {/* Derived Values */}
        {derivedData.totalEpochs > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md space-y-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              Calculated Values
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>Initial Tokens: {derivedData.initialTokens}</p>
              <p>Locked Tokens: {derivedData.lockedTokens}</p>
              <p>Total Epochs: {derivedData.totalEpochs}</p>
              <p>Unlock Per Epoch: {derivedData.unlockPerEpoch}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isPending || isConfirming}
          className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {!isConnected
            ? 'Connect Wallet First'
            : isPending
            ? 'Confirming in Wallet...'
            : isConfirming
            ? 'Deploying...'
            : 'Deploy Token'}
        </button>

        {/* Status Messages */}
        {hash && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              Transaction Hash: {hash}
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              Token deployed successfully! 🎉
            </p>
            {deployedAddresses && (
              <div className="mt-2 text-sm text-green-800 dark:text-green-200 space-y-1 break-all">
                <p>
                  Token: {deployedAddresses.token}
                </p>
                <p>
                  Controller: {deployedAddresses.controller}
                </p>
              </div>
            )}
            {deploymentLookupError && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                {deploymentLookupError}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error: {error.message}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
