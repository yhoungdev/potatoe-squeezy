import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import type { Env } from "../types/env";

export const auth = async (
  c: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  console.log('Received Token:', token);

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    console.log('Decoded Payload:', payload);
    c.set("user", payload);
    c.set("userId", payload.userId || payload.sub); // Ensure userId is set correctly
    await next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    return c.json({ error: "Invalid token", details: error.message }, 401);
  }
};
