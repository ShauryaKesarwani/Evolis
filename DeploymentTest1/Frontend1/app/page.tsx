import DeploymentForm from '@/components/DeploymentForm'
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
                Token Factory
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Progressive Liquidity Unlock
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/deployments"
                className="text-gray-700 dark:text-gray-300 hover:text-primary text-sm font-medium"
              >
                My Deployments
              </a>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Deploy Your Token in One Click
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create tokens with automatic progressive liquidity unlock. 
            Reduce volatility, build trust, grow sustainably.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Atomic Deployment
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
              Gradual liquidity addition over time reduces early volatility
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Deterministic
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Time-based releases, fully transparent, no admin control
            </p>
          </div>
        </div>

        {/* Deployment Form */}
        <DeploymentForm />

        {/* How It Works */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Configure Your Token
                </h4>
                <p>
                  Set token details, initial liquidity percentage, and unlock schedule
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Sign One Transaction
                </h4>
                <p>
                  Factory deploys token, controller, and adds initial liquidity atomically
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Automatic Unlocks
                </h4>
                <p>
                  Remaining tokens unlock gradually based on your schedule, injected into AMM pool
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Built for BNB Chain • Powered by PancakeSwap
          </p>
        </footer>
      </div>
    </main>
  )
}
