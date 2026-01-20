import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const DEFAULT_CONN_LIMIT = Number(process.env.PRISMA_CONNECTION_LIMIT ?? "5");

function resolveDatabaseUrl() {
  const url =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
      : process.env.DATABASE_URL || process.env.DATABASE_URL_PROD;

  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (
      Number.isFinite(DEFAULT_CONN_LIMIT) &&
      DEFAULT_CONN_LIMIT > 0 &&
      !parsed.searchParams.has("connection_limit")
    ) {
      parsed.searchParams.set("connection_limit", String(DEFAULT_CONN_LIMIT));
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
