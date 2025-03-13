import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth'
import type { Env } from './types/env'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors())
app.route('/auth', authRouter)

export default app
