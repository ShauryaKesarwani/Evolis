import { getEnv } from './config'
import { getFactoryContract, fetchProjectFromChain } from './chain/client'
import { getProject, upsertProject } from './db'

export async function startIndexer() {
  const env = getEnv()
  if (!env.RPC_URL || !env.FACTORY_ADDRESS) {
    console.warn('[indexer] disabled: RPC_URL or FACTORY_ADDRESS missing')
    return
  }

  console.log('[indexer] starting — using direct contract call strategy')

  // Validate factory contract is reachable before entering polling loop
  try {
    const factory = getFactoryContract()
    const total = Number(await factory.poolCount())
    console.log(`[indexer] factory validated — ${total} pool(s) found`)
  } catch (err: any) {
    console.warn(
      `[indexer] ⚠️  Factory contract at ${env.FACTORY_ADDRESS} is not responding.`
    )
    console.warn(
      `[indexer]    Error: ${err.message?.split('(')[0]?.trim() || err.message}`
    )
    console.warn(
      '[indexer]    The contract may not be deployed on this network. Indexer will not start.'
    )
    console.warn(
      '[indexer]    Deploy EvolisFactory to BNB Testnet and update FACTORY_ADDRESS in .env'
    )
    return
  }

  // Polling loop: every cycle, check poolCount() and sync any new ones.
  let consecutiveErrors = 0
  while (true) {
    try {
      const factory = getFactoryContract()
      const total = Number(await factory.poolCount())

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
      consecutiveErrors = 0
    } catch (err: any) {
      consecutiveErrors++
      if (consecutiveErrors <= 3) {
        console.warn('[indexer] poll error:', err.message)
      }
      if (consecutiveErrors === 3) {
        console.warn('[indexer] Too many consecutive errors, suppressing further logs until recovery.')
      }
    }

    // Poll every 10 seconds
    await sleep(10_000)
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
