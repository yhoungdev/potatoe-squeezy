import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import type { Env } from '../types/env'

export const authRouter = new Hono<{ Bindings: Env }>()

authRouter.get('/login', async (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID
  const redirectUri = `${c.req.url}/callback`
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`
  
  return c.redirect(githubAuthUrl)
})

authRouter.get('/callback', async (c) => {
  const code = c.req.query('code')
  
  if (!code) {
    return c.json({ error: 'No code provided' }, 400)
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code
      })
    })

    const tokenData = await tokenResponse.json()
    
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      }
    })

    const userData = await userResponse.json()

    const token = await jwt.sign({
      userId: userData.id,
      username: userData.login
    }, c.env.JWT_SECRET)

    return c.json({ token, user: userData })
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 500)
  }
})