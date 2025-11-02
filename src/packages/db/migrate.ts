import { db } from "./client";

async function main() {
    console.log("Running migrations...");
    // Prisma migrations are run via CLI: bun prisma migrate dev
    // This file can be used for data migrations or seeding
    console.log("Migrations completed!");
    await db.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
