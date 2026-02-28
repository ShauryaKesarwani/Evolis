'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, Address, isAddress } from 'viem';

const ROUTER_ADDRESS = '0x0B306BF915C4d645ff596e518fAf3F9669b97016' as Address;

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

const TOKEN_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
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

  // Read token balance
  const { data: tokenBalance, refetch } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Buy transaction
  const { writeContract: buyTokens, data: buyHash } = useWriteContract();
  const { isLoading: isBuying, isSuccess: buySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Approve transaction
  const { writeContract: approveTokens, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Sell transaction
  const { writeContract: sellTokens, data: sellHash } = useWriteContract();
  const { isLoading: isSelling, isSuccess: sellSuccess } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  const handleBuy = async () => {
    if (!address) return;
    
    const ethAmount = parseEther(buyAmount);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    
    buyTokens({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [
        BigInt(1), // amountOutMin
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
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS, amount],
    });
  };

  const handleSell = async () => {
    if (!address) return;
    
    const amount = parseEther(sellAmount);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    
    sellTokens({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForETH',
      args: [
        amount,
        BigInt(1), // amountOutMin
        [TOKEN_ADDRESS, '0x0000000000000000000000000000000000000000' as Address],
        address,
        deadline
      ],
    });
  };

  // Refetch balance after successful transactions
  if (buySuccess || sellSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        🪙 Token Trading
      </h2>

      {/* Token Address Input */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Token Address
        </label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => {
            setTokenAddress(e.target.value);
            setTokenAddressError(e.target.value && !isAddress(e.target.value) ? 'Invalid address' : '');
          }}
          placeholder="0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"
          className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            tokenAddressError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {tokenAddressError && <p className="text-xs text-red-600 mt-1">{tokenAddressError}</p>}
        {isValidTokenAddress && <p className="text-xs text-green-600 mt-1">✅ Valid address</p>}
        <p className="text-xs text-gray-500 mt-2">Paste your token address to trade it</p>
        
        {/* Check Balance Button */}
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="mt-3 w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded transition"
        >
          {showBalance ? '🔽 Hide' : '🔍'} Direct Balance Check
        </button>
        
        {showBalance && isValidTokenAddress && (
          <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Your address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </p>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Token contract:</strong> {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
            </p>
            <p className="text-sm font-bold text-gray-900">
              Balance: {tokenBalance ? formatEther(tokenBalance) : '0'} tokens
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              This reads directly from the blockchain. If 0, tokens haven't reached this address yet.
            </p>
          </div>
        )}
      </div>

      {/* Token Balance */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Your Token Balance</p>
        <p className="text-3xl font-bold text-gray-900">
          {isValidTokenAddress && tokenBalance ? formatEther(tokenBalance) : '0'} <span className="text-lg">{tokenSymbol}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'buy' 
              ? 'border-b-2 border-green-500 text-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          🟢 Buy Tokens
        </button>
        <button
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'sell' 
              ? 'border-b-2 border-red-500 text-red-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sell')}
        >
          🔴 Sell Tokens
        </button>
      </div>

      {/* Buy Interface */}
      {activeTab === 'buy' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ETH Amount to Spend
            </label>
            <input
              type="number"
              step="0.01"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.01"
            />
            <p className="text-xs text-gray-500 mt-2">
              ≈ {Number(buyAmount) * 10000} TEST tokens @ 1 ETH = 10,000 TEST
            </p>
          </div>

          <button
            onClick={handleBuy}
            disabled={!address || isBuying}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-md hover:shadow-lg"
          >
            {isBuying ? '⏳ Buying...' : '🚀 Buy Tokens'}
          </button>
          
          {buySuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-semibold">✅ Purchase successful!</p>
              <p className="text-xs text-green-600 mt-1">Tx: {buyHash?.slice(0, 10)}...{buyHash?.slice(-8)}</p>
            </div>
          )}
        </div>
      )}

      {/* Sell Interface */}
      {activeTab === 'sell' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Amount to Sell
            </label>
            <input
              type="number"
              step="1"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-2">
              ≈ {Number(sellAmount) / 10000} ETH @ 10,000 TEST = 1 ETH
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleApprove}
              disabled={!address || isApproving || approveSuccess}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-md hover:shadow-lg"
            >
              {isApproving ? '⏳ Approving...' : approveSuccess ? '✅ Approved' : '1️⃣ Approve Router'}
            </button>
            
            {approveSuccess && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 font-semibold">✅ Approval successful!</p>
              </div>
            )}

            <button
              onClick={handleSell}
              disabled={!address || isSelling || !approveSuccess}
              className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-md hover:shadow-lg"
            >
              {isSelling ? '⏳ Selling...' : '2️⃣ Sell Tokens'}
            </button>
            
            {sellSuccess && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">✅ Sale successful!</p>
                <p className="text-xs text-red-600 mt-1">Tx: {sellHash?.slice(0, 10)}...{sellHash?.slice(-8)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!address && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ Please connect your wallet to trade
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 space-y-1">
          <strong className="block text-gray-800">📊 Exchange Rate:</strong>
          1 ETH = 10,000 tokens
          <br />
          <strong className="block text-gray-800 mt-2">📍 Current Token:</strong>
          <span className="font-mono text-xs">{isValidTokenAddress ? tokenAddress : 'Invalid'}</span>
          <br />
          <strong className="block text-gray-800 mt-2">📌 How to Add to MetaMask:</strong>
          <span className="text-gray-700">
            1. Open MetaMask<br/>
            2. Click "Import Tokens"<br/>
            3. Paste: <span className="font-mono">{tokenAddress}</span><br/>
            4. MetaMask auto-fills name & symbol<br/>
            5. Click "Import"
          </span>
        </p>
      </div>
    </div>
  );
}
