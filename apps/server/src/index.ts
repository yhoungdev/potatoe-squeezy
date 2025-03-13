import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'
import type { Env } from './types/env'

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
  c.env = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET!
  }
  await next()
})

app.use('/*', cors())

app.get('/', (c) => {
  return c.json({
    name: 'Potatoe GitHub Users API',
    version: '1.0.0',
    description: '⚡ Instantly tip developers with SOL for their contributions'
  })
})

app.route('/auth', authRouter)

export default app
