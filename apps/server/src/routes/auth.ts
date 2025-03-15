import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { githubAuth } from "@hono-dev/auth-github";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Env } from "../types/env";
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

export const authRouter = new Hono<{ Bindings: Env }>();

const github = githubAuth({
  client_id: process.env.GITHUB_CLIENT_ID!,
  client_secret: process.env.GITHUB_CLIENT_SECRET!,
  redirect_uri: "http://localhost:3000/auth/callback",
  scope: ['read:user', 'user:email']  
});

authRouter.use('/login', github);
authRouter.use('/callback', github);


authRouter.get("/login", (c) => {

  return c.redirect('/'); 
});


authRouter.get("/callback", async (c) => {
  const githubUser = c.get('github-user');
  const githubToken = c.get('github-token');

  console.log('GitHub Authentication Data:', {
    token: githubToken?.access_token?.slice(0, 8), 
    user: githubUser?.login
  });

  if (!githubUser || !githubToken) {
    console.error('Missing GitHub authentication data');
    return c.json({ 
      error: "Authentication failed",
      details: "Missing GitHub user or token data" 
    }, 401);
  }

  try {
    const existingUser = await c.env.DB
      .select()
      .from(users)
      .where(eq(users.githubId, githubUser.id.toString()))
      .limit(1);

    let user;
    
    if (existingUser.length === 0) {
      
      const result = await c.env.DB
        .insert(users)
        .values({
          githubId: githubUser.id.toString(),
          username: githubUser.login,
          name: githubUser.name || null,  
          email: githubUser.email || null,
          avatarUrl: githubUser.avatar_url || null,
        })
        .returning();
      
      user = result[0];
    } else {
     
      const result = await c.env.DB
        .update(users)
        .set({
          username: githubUser.login,
          name: githubUser.name || null,  
          email: githubUser.email || null,
          avatarUrl: githubUser.avatar_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.githubId, githubUser.id.toString()))
        .returning();
      
      user = result[0];
    }

    const token = await sign(
      {
        userId: user.id,
        username: user.username,
      },
      c.env.JWT_SECRET,
    );

    // When setting the cookie, use the actual token string
    setCookie(c, 'github-token', githubToken.access_token, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'Lax'
    });

    return c.json({ token, user });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: "Database operation failed" }, 500);
  }
});


authRouter.post("/logout", async (c) => {
  const githubToken = c.get('github-token');
  if (githubToken) {
    try {
      await fetch(`https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
    } catch (error) {
      console.error('GitHub token revocation failed:', error);
      return c.json({ 
        status: 'error',
        message: 'Failed to revoke GitHub token' 
      }, 500);
    }
  }

  deleteCookie(c, 'auth-token');
  deleteCookie(c, 'github-token');
  
  return c.json({ 
    status: 'success',
    message: 'Successfully logged out'
  });
});
