import PoolViewer from '@/components/PoolViewer'
import ConnectWallet from '@/components/ConnectWallet'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Evolis Crowdfunding
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Milestone-Based Token Fundraising
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support Milestone-Based Projects
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buy tokens through bonding curve fundraising. Get refunds if milestones fail.
            Claim liquidity tokens when goals are reached.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Milestone Protection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Token, controller, and initial liquidity deployed in single transaction
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Progressive Unlock
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Projects must complete milestones to unlock funds progressively
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bonding Curve
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fair token pricing with automatic liquidity pool creation
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Refund Safety
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get your money back if funding goal not reached by deadline
            </p>
          </div>
        </div>

        {/* Pool Viewer */}
        <PoolViewer />

        {/* How It Works */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Buy Through Bonding Curve
                </h4>
                <p>
                  Send BNB to purchase tokens at fair market price through bonding curve mechanism
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Project Delivers Milestones
                </h4>
                <p>
                  Project owner submits proof of milestone completion to unlock funds progressively
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Claim Liquidity Tokens
                </h4>
                <p>
                  When goal is reached, backers can claim EvoLP tokens representing their share of liquidity pool
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Built on BSC Testnet • Milestone-Based Crowdfunding
          </p>
        </footer>
      </div>
    </main>
  )
}
