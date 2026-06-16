import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 is "Rust-free": the runtime connects through a driver adapter.
// For Supabase/Postgres we use the pooled DATABASE_URL (pgbouncer) here.
// A singleton avoids exhausting connections during dev hot-reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  // max: 1 keeps each warm serverless instance to a single server-side connection
  // through the Supabase pgbouncer pooler (otherwise node-postgres defaults to 10).
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Cache unconditionally so any in-process module re-evaluation reuses one client/pool.
globalForPrisma.prisma = prisma;
