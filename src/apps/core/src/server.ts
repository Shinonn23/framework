import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
// import { db } from "@packages/db";
import { DEFAULT_PORT } from "@packages";

const app = new Elysia()
    .use(cors())
    .use(swagger())
    .get("/", () => ({ message: "Hello from Core API!" }))
    .get("/health", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
    }))
    .get("/users", async () => {
        // Example: fetch users from database
        return { users: [] };
    })
    .listen(DEFAULT_PORT);

console.log(
    `🦊 Core API is running at ${app.server?.hostname}:${app.server?.port}`,
);

export default app;
export type App = typeof app;
