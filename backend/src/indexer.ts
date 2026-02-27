import { getEnv } from './config'
import { getProvider } from './chain/client'
import { Interface } from 'ethers'
import { factoryAbi } from './chain/abis'
import { getSyncState, setSyncState, upsertProject } from './db'
import { fetchProjectFromChain } from './chain/client'

const LAST_BLOCK_KEY = 'factory:lastProcessedBlock'

export async function startIndexer() {
  const env = getEnv()
  if (!env.RPC_URL || !env.FACTORY_ADDRESS) {
    console.warn('Indexer disabled: RPC_URL or FACTORY_ADDRESS missing')
    return
  }

  const provider = getProvider()
  const iface = new Interface(factoryAbi as unknown as string[])

  let lastProcessed = Number(getSyncState(LAST_BLOCK_KEY) ?? 0)

  // If no state, start from a recent window to avoid huge scans during hackathon.
  if (!lastProcessed) {
    const latest = await provider.getBlockNumber()
    lastProcessed = Math.max(0, latest - 25_000)
  }

  console.log('[indexer] starting from block', lastProcessed)

  // Simple polling loop (Bun-friendly).
  while (true) {
    const latest = await provider.getBlockNumber()
    if (lastProcessed >= latest) {
      await sleep(3000)
      continue
    }

    const fromBlock = lastProcessed + 1
    const toBlock = Math.min(latest, fromBlock + 2_000)

    const logs = await provider.getLogs({
      address: env.FACTORY_ADDRESS,
      fromBlock,
      toBlock,
    })

    for (const log of logs) {
      let parsed: any
      try {
        parsed = iface.parseLog({ topics: log.topics as string[], data: log.data })
      } catch {
        continue
      }

      if (parsed?.name === 'ProjectCreated') {
        const projectId = Number(parsed.args.projectId)
        try {
          const chainProject = await fetchProjectFromChain(projectId)
          upsertProject(chainProject)
          console.log('[indexer] upserted project', projectId)
        } catch (err) {
          console.warn('[indexer] failed to fetch project meta', projectId, err)
        }
      }
    }

    lastProcessed = toBlock
    setSyncState(LAST_BLOCK_KEY, String(lastProcessed))
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
