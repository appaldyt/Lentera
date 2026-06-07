import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const seeds = [
  { id: "seed-sl-001", nik: "IAS-2021-0045", name: "Budi Santoso",       department: "Operations",      year: "2026", platform: "LMS",               hours: 12 },
  { id: "seed-sl-002", nik: "IAS-2021-0045", name: "Budi Santoso",       department: "Operations",      year: "2025", platform: "LinkedIn Learning",  hours: 8  },
  { id: "seed-sl-003", nik: "IAS-2020-0112", name: "Dewi Rahayu",        department: "Safety",          year: "2026", platform: "LMS",               hours: 20 },
  { id: "seed-sl-004", nik: "IAS-2020-0112", name: "Dewi Rahayu",        department: "Safety",          year: "2025", platform: "LinkedIn Learning",  hours: 15 },
  { id: "seed-sl-005", nik: "IAS-2022-0078", name: "Hendra Wijaya",      department: "Engineering",     year: "2026", platform: "LMS",               hours: 10 },
  { id: "seed-sl-006", nik: "IAS-2019-0033", name: "Rina Kusumawati",    department: "Finance",         year: "2026", platform: "LinkedIn Learning",  hours: 18 },
  { id: "seed-sl-007", nik: "IAS-2019-0033", name: "Rina Kusumawati",    department: "Finance",         year: "2025", platform: "LMS",               hours: 22 },
  { id: "seed-sl-008", nik: "IAS-2018-0007", name: "Doni Firmansyah",    department: "Operations",      year: "2026", platform: "LinkedIn Learning",  hours: 14 },
  { id: "seed-sl-009", nik: "IAS-2018-0007", name: "Doni Firmansyah",    department: "Operations",      year: "2025", platform: "LMS",               hours: 9  },
  { id: "seed-sl-010", nik: "IAS-2020-0055", name: "Maya Sari",          department: "Human Resources", year: "2026", platform: "LMS",               hours: 25 },
  { id: "seed-sl-011", nik: "IAS-2020-0055", name: "Maya Sari",          department: "Human Resources", year: "2025", platform: "LinkedIn Learning",  hours: 30 },
  { id: "seed-sl-012", nik: "IAS-2021-0089", name: "Fajar Nugroho",      department: "IT",              year: "2026", platform: "LinkedIn Learning",  hours: 35 },
  { id: "seed-sl-013", nik: "IAS-2021-0089", name: "Fajar Nugroho",      department: "IT",              year: "2025", platform: "LMS",               hours: 40 },
  { id: "seed-sl-014", nik: "IAS-2019-0078", name: "Siti Rahma",         department: "Safety",          year: "2026", platform: "LMS",               hours: 6  },
  { id: "seed-sl-015", nik: "IAS-2022-0103", name: "Andi Pratama",       department: "Ground Handling", year: "2026", platform: "LinkedIn Learning",  hours: 8  },
  { id: "seed-sl-016", nik: "IAS-2020-0212", name: "Budi Setiawan",      department: "Ground Handling", year: "2026", platform: "LMS",               hours: 12 },
  { id: "seed-sl-017", nik: "IAS-2021-0519", name: "Dewi Lestari",       department: "Operations",      year: "2026", platform: "LinkedIn Learning",  hours: 16 },
  { id: "seed-sl-018", nik: "IAS-2021-0519", name: "Dewi Lestari",       department: "Operations",      year: "2025", platform: "LMS",               hours: 11 },
  { id: "seed-sl-019", nik: "IAS-2021-0721", name: "Ahmad Fauzi",        department: "Security",        year: "2026", platform: "LMS",               hours: 7  },
  { id: "seed-sl-020", nik: "IAS-2018-0888", name: "Reza Firmansyah",    department: "Cargo",           year: "2025", platform: "LinkedIn Learning",  hours: 5  },
  { id: "seed-sl-021", nik: "IAS-2023-0301", name: "Putri Ayu",          department: "Human Resources", year: "2026", platform: "LMS",               hours: 20 },
  { id: "seed-sl-022", nik: "IAS-2022-0415", name: "Rendi Pratama",      department: "General Affairs", year: "2026", platform: "LinkedIn Learning",  hours: 9  },
  { id: "seed-sl-023", nik: "IAS-2022-0415", name: "Rendi Pratama",      department: "General Affairs", year: "2025", platform: "LMS",               hours: 13 },
];

async function main() {
  console.log("Seeding SelfLearning...");

  let upserted = 0;
  for (const data of seeds) {
    await prisma.selfLearning.upsert({
      where: { id: data.id },
      update: { platform: data.platform },
      create: data,
    });
    upserted++;
  }
  console.log(`Done: ${upserted} upserted.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
