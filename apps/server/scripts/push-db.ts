import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config();

async function push() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log("Connected to database");
    console.log("Schema push completed");
  } catch (error) {
    console.error("Failed to connect:", error);
  }
}

push();
