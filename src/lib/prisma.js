import { PrismaClient } from "@prisma/client";

/**
 * Klient Prisma (Połączenie z bazą)
 * Ten kod dba o to, żebyśmy mieli tylko jedno aktywne połączenie z bazą danych,
 * szczególnie podczas pracy w trybie developerskim. Zapobiega to "zapychaniu" bazy.
 */
const prismaClientSingleton = () => {
    return new PrismaClient();
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
