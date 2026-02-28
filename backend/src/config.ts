import { z } from 'zod'
import dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Load env vars reliably even if Bun is started from the repo root.
// dotenv/config only reads from process.cwd()/.env, which can be wrong.
loadEnvFiles()

function loadEnvFiles() {
  const cwdEnv = resolve(process.cwd(), '.env')

  const here = dirname(fileURLToPath(import.meta.url))
  const backendEnv = resolve(here, '../.env')
  const backendEnvLocal = resolve(here, '../.env.local')

  const candidates = [cwdEnv, backendEnv, backendEnvLocal]
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue
    dotenv.config({ path: envPath, override: false })
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().default('file:./data/dev.sqlite'),

  RPC_URL: z.string().optional(),
  FACTORY_ADDRESS: z.string().optional(),
  ADMIN_PRIVATE_KEY: z.string().optional(),

  ENABLE_INDEXER: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),

  CORS_ORIGIN: z.string().default('*'),
})

type Env = z.infer<typeof envSchema>

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    // Surface a readable message early.
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment:\n${message}`)
  }
  return parsed.data
}
