import { PrismaClient } from "./generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { join } from "path";

const dbPath = join(import.meta.dir, "database", "main.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
export const prisma = new PrismaClient({ adapter });
