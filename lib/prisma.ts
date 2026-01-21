/**
 * Prisma Client Singleton
 * 
 * Создает единственный экземпляр Prisma Client для использования в приложении.
 * Это предотвращает создание множественных подключений к БД в development режиме.
 * 
 * Для ВКР: демонстрирует паттерн Singleton для работы с БД.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}











