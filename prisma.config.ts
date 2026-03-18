import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { normalizeDatabaseUrl } from "./lib/database-url";

config({ path: ".env.local", override: false });
config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      normalizeDatabaseUrl(
        process.env["DATABASE_URL"] ??
          process.env["PRISMA_DATABASE_URL"] ??
          process.env["POSTGRES_URL"] ??
          "",
      ),
  },
});
