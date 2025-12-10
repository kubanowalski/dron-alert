import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Konfiguracja Prisma (Bazy Danych)
 * Ten plik mówi aplikacji gdzie znajduje się schemat bazy danych i jak się z nią połączyć.
 * Używamy zmiennych środowiskowych (env), żeby bezpiecznie przechowywać adres bazy.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
