import MyDeployments from '@/components/MyDeployments'
import ConnectWallet from '@/components/ConnectWallet'

export default function DeploymentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Deployments
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your deployed tokens
              </p>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <a
            href="/"
            className="text-primary hover:underline text-sm"
          >
            ← Back to Deploy
          </a>
        </div>

        <MyDeployments />
      </div>
    </main>
  )
}
