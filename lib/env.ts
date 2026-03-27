const PRISMA_BUILD_PLACEHOLDER_URL =
  "postgresql://build:build@127.0.0.1:5432/thinkboard_build";

function normalizeEnvValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function readDatabaseUrl(preferDirect = false) {
  if (preferDirect) {
    return (
      normalizeEnvValue(process.env.DIRECT_URL) ??
      normalizeEnvValue(process.env.DATABASE_URL)
    );
  }

  return (
    normalizeEnvValue(process.env.DATABASE_URL) ??
    normalizeEnvValue(process.env.DIRECT_URL)
  );
}

export function getRuntimeDatabaseUrl() {
  const databaseUrl = readDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Think Board is missing DATABASE_URL. Add a Neon pooled connection string in your deployment environment before starting the app.",
    );
  }

  return databaseUrl;
}

export function getPrismaCliDatabaseUrl() {
  const databaseUrl = readDatabaseUrl(true);

  if (databaseUrl) {
    return databaseUrl;
  }

  if (process.env.CI || process.env.VERCEL) {
    console.warn(
      "Prisma CLI is using a placeholder datasource URL during CI/build because DIRECT_URL and DATABASE_URL are not set. Runtime still requires DATABASE_URL.",
    );
    return PRISMA_BUILD_PLACEHOLDER_URL;
  }

  throw new Error(
    "Set DIRECT_URL or DATABASE_URL before running Prisma schema commands locally.",
  );
}
