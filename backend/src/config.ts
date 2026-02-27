import { z } from 'zod'

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
