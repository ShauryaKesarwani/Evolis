import 'dotenv/config'

import { createApp } from './app'
import { getEnv } from './config'
import { startIndexer } from './indexer'

const env = getEnv()
const app = createApp()

if (env.ENABLE_INDEXER) {
  startIndexer().catch((err) => {
    console.error('Indexer failed to start:', err)
  })
}

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
})

console.log(`Backend listening on http://localhost:${env.PORT}`)

export default app
