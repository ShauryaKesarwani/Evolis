import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { getEnv } from './config'
import { projectsRoutes } from './routes/projects'
import { adminRoutes } from './routes/admin'

export function createApp() {
  const env = getEnv()
  const app = new Hono()

  app.use('*', logger())
  app.use(
    '*',
    cors({
      origin: env.CORS_ORIGIN,
    }),
  )

  app.get('/', (c) => c.json({ ok: true, name: 'Evolis Backend' }))
  app.get('/health', (c) => c.json({ ok: true }))

  app.route('/', projectsRoutes)
  app.route('/', adminRoutes)

  app.onError((err, c) => {
    console.error(err)
    return c.json({ error: err.message ?? 'Internal Server Error' }, 500)
  })

  return app
}
