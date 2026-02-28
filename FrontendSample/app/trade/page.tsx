import TokenTrader from '@/components/TokenTrader';
import ConnectWallet from '@/components/ConnectWallet';

export default function TradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Token Trading
          </h1>
          <p className="text-gray-600 text-lg">
            Buy and sell TEST tokens directly with MetaMask
          </p>
        </div>

        {/* Connect Wallet Button */}
        <div className="flex justify-center mb-8">
          <ConnectWallet />
        </div>
        
        {/* Trading Interface */}
        <TokenTrader />

        {/* Instructions */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📚 How to Test with MetaMask
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1️⃣ Setup Anvil Network in MetaMask</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Network Name:</strong> Anvil Local</li>
                  <li><strong>RPC URL:</strong> http://127.0.0.1:8545</li>
                  <li><strong>Chain ID:</strong> 31337</li>
                  <li><strong>Currency Symbol:</strong> ETH</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2️⃣ Import Test Account</h3>
                <p className="text-gray-700 mb-2">Import this private key to MetaMask:</p>
                <code className="block bg-gray-100 p-3 rounded text-xs font-mono break-all">
                  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ This is Anvil's default test account with 10,000 ETH
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3️⃣ Add Test Token to MetaMask</h3>
                <p className="text-gray-700 mb-2">Import custom token with address:</p>
                <code className="block bg-gray-100 p-3 rounded text-xs font-mono break-all">
                  0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Token symbol: TEST | Decimals: 18
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4️⃣ Start Trading!</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Buy:</strong> Enter ETH amount → Click "Buy Tokens" → Confirm in MetaMask</li>
                  <li><strong>Sell:</strong> Enter token amount → Approve Router → Sell Tokens → Confirm both in MetaMask</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
