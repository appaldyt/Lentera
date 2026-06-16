import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createPrismaClient>;
} & typeof global;

const prisma = createPrismaClient();

export default prisma;

