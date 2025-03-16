import { Hono } from "hono";
import { db } from "../db";
import { UserWithWallets } from "../types";

const userRoute = new Hono();

userRoute.get("/profile/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        wallets: true
      }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { userRoute };
