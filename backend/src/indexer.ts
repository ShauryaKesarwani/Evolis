import { getEnv } from './config'
import { getFactoryContract, fetchProjectFromChain } from './chain/client'
import { getProject, upsertProject } from './db'

export async function startIndexer() {
  const env = getEnv()
  if (!env.RPC_URL || !env.FACTORY_ADDRESS) {
    console.warn('Indexer disabled: RPC_URL or FACTORY_ADDRESS missing')
    return
  }

  console.log('[indexer] starting — using direct contract call strategy')

  // Polling loop: every cycle, check getTotalDeployments() and sync any new ones.
  while (true) {
    try {
      const factory = getFactoryContract()
      const total = Number(await factory.getTotalDeployments())

      if (total > 0) {
        // Check each deployment, skip ones we already have
        for (let i = 0; i < total; i++) {
          const existing = getProject(i)
          if (existing) continue // Already indexed

          try {
            const chainProject = await fetchProjectFromChain(i)
            upsertProject(chainProject)
            console.log(`[indexer] upserted project ${i}`)
          } catch (err) {
            console.warn(`[indexer] failed to fetch deployment ${i}:`, err)
          }

          // Small delay between fetches to be polite to RPC
          await sleep(500)
        }
      }
    } catch (err: any) {
      console.warn('[indexer] poll error:', err.message)
    }

    // Poll every 10 seconds
    await sleep(10_000)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
