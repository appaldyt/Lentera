import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  await prisma.user.upsert({
    where: { email: "superadmin@ias.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@ias.id",
      password: await hash("admin123"),
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@ias.id" },
    update: {},
    create: {
      name: "Admin HR LENTERA",
      email: "admin@ias.id",
      password: await hash("admin123"),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "budi.s@ias.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "budi.s@ias.id",
      password: await hash("user123"),
      role: "USER",
    },
  });

  console.log("Seed complete.");
  console.log("  superadmin@ias.id  / admin123  (Super Admin)");
  console.log("  admin@ias.id       / admin123  (Admin)");
  console.log("  budi.s@ias.id      / user123   (User)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
