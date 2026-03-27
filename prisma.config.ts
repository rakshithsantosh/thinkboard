import "dotenv/config";
import { defineConfig } from "prisma/config";

import { getPrismaCliDatabaseUrl } from "./lib/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getPrismaCliDatabaseUrl(),
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
