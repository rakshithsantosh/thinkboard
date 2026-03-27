import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

import { getPrismaCliDatabaseUrl } from "./lib/env";

loadEnv({
  path: process.env.DOTENV_CONFIG_PATH ?? ".env",
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getPrismaCliDatabaseUrl(),
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
