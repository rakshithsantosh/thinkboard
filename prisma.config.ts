import "dotenv/config";
import { defineConfig } from "prisma/config";

const prismaCliUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!prismaCliUrl) {
  throw new Error(
    "Set DIRECT_URL or DATABASE_URL before running Prisma commands.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: prismaCliUrl,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
