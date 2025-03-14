import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/auth";
import walletsRoute from "./routes/wallets";
import { db } from "./db";
import { sql } from "drizzle-orm";
import type { Env } from "./types/env";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  c.env = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    JWT_SECRET: process.env.JWT_SECRET!,
    DB: db,
  };
  await next();
});

app.use("/*", cors());

app.get("/", (c) => {
  return c.json({
    name: "Potatoe GitHub Users API",
    version: "1.0.0",
    description: "⚡ Instantly tip developers with SOL for their contributions",
  });
});

app.get("/db-test", async (c) => {
  try {
    const result = await c.env.DB.query(sql`SELECT NOW()`);
    return c.json({
      status: "Connected",
      timestamp: result[0].now,
      message: "Database connection successful!",
    });
  } catch (error) {
    return c.json(
      {
        status: "Error",
        message: error.message,
      },
      500,
    );
  }
});

app.route("/auth", authRouter);
app.route("/wallets", walletsRoute);

export default app;
