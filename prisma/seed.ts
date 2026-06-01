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

  // ── Users ──────────────────────────────────────────────────────────────────

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

  // ── Training 1 ─────────────────────────────────────────────────────────────

  const training1 = await prisma.training.upsert({
    where: { id: "seed-training-001" },
    update: {},
    create: {
      id: "seed-training-001",
      name: "Aviation Safety Management System (SMS)",
      description:
        "Pelatihan sistem manajemen keselamatan penerbangan sesuai standar ICAO Doc 9859 dan peraturan DGCA.",
      jobFamilies: ["Operations", "Safety", "Engineering"],
      trainingType: "MANDATORY",
      organizer: "Direktorat Jenderal Perhubungan Udara",
      room: "Ruang Garuda – Lantai 3",
      startDate: new Date("2026-06-10T00:00:00.000Z"),
      endDate: new Date("2026-06-12T00:00:00.000Z"),
      duration: "3 Hari",
      cost: "Rp 5.500.000",
      status: "PLANNING",
      preparations: {
        create: [
          {
            activityName: "Distribusi undangan peserta",
            category: "Administrasi",
            dueDate: new Date("2026-06-03T00:00:00.000Z"),
            priority: "High",
            pic: "Sari Dewi",
            team: "HR",
            isCompleted: false,
            progress: "0%",
            linkOutput: null,
            note: "Kirim via email dan WhatsApp grup",
          },
          {
            activityName: "Persiapan materi & modul pelatihan",
            category: "Konten",
            dueDate: new Date("2026-06-07T00:00:00.000Z"),
            priority: "High",
            pic: "Ahmad Fauzi",
            team: "Training",
            isCompleted: false,
            progress: "50%",
            linkOutput: null,
            note: "Koordinasi dengan DGCA untuk materi terbaru",
          },
          {
            activityName: "Setup ruangan & peralatan AV",
            category: "Logistik",
            dueDate: new Date("2026-06-09T00:00:00.000Z"),
            priority: "Normal",
            pic: "Rendi Pratama",
            team: "GA",
            isCompleted: false,
            progress: "0%",
            linkOutput: null,
            note: null,
          },
        ],
      },
      participants: {
        create: [
          {
            nik: "IAS-2021-0045",
            name: "Budi Santoso",
            department: "Operations",
            trainingDate: new Date("2026-06-10T00:00:00.000Z"),
            attendedHours: 0,
          },
          {
            nik: "IAS-2020-0112",
            name: "Dewi Rahayu",
            department: "Safety",
            trainingDate: new Date("2026-06-10T00:00:00.000Z"),
            attendedHours: 0,
          },
          {
            nik: "IAS-2022-0078",
            name: "Hendra Wijaya",
            department: "Engineering",
            trainingDate: new Date("2026-06-10T00:00:00.000Z"),
            attendedHours: 0,
          },
        ],
      },
    },
  });

  // ── Training 2 ─────────────────────────────────────────────────────────────

  const training2 = await prisma.training.upsert({
    where: { id: "seed-training-002" },
    update: {},
    create: {
      id: "seed-training-002",
      name: "Leadership & People Management",
      description:
        "Program pengembangan kompetensi kepemimpinan untuk level supervisor dan manajer dalam mengelola tim secara efektif.",
      jobFamilies: ["All Functions"],
      trainingType: "IMPROVEMENT",
      organizer: "PT Integrasi Aviasi Solusi – Internal",
      room: "Aula Nusantara – Lantai 5",
      startDate: new Date("2026-05-20T00:00:00.000Z"),
      endDate: new Date("2026-05-21T00:00:00.000Z"),
      duration: "2 Hari",
      cost: "Rp 2.000.000",
      status: "DONE",
      preparations: {
        create: [
          {
            activityName: "Konfirmasi narasumber & jadwal",
            category: "Administrasi",
            dueDate: new Date("2026-05-10T00:00:00.000Z"),
            priority: "High",
            pic: "Sari Dewi",
            team: "HR",
            isCompleted: true,
            progress: "100%",
            linkOutput: null,
            note: null,
          },
          {
            activityName: "Cetak sertifikat peserta",
            category: "Administrasi",
            dueDate: new Date("2026-05-18T00:00:00.000Z"),
            priority: "Normal",
            pic: "Putri Ayu",
            team: "HR",
            isCompleted: true,
            progress: "100%",
            linkOutput: null,
            note: "Desain sertifikat sudah disetujui",
          },
          {
            activityName: "Evaluasi post-training & feedback form",
            category: "Evaluasi",
            dueDate: new Date("2026-05-25T00:00:00.000Z"),
            priority: "Normal",
            pic: "Ahmad Fauzi",
            team: "Training",
            isCompleted: true,
            progress: "100%",
            linkOutput: null,
            note: "Hasil rata-rata skor 4.3/5.0",
          },
        ],
      },
      participants: {
        create: [
          {
            nik: "IAS-2019-0033",
            name: "Rina Kusumawati",
            department: "Finance",
            trainingDate: new Date("2026-05-20T00:00:00.000Z"),
            attendedHours: 16,
          },
          {
            nik: "IAS-2018-0007",
            name: "Doni Firmansyah",
            department: "Operations",
            trainingDate: new Date("2026-05-20T00:00:00.000Z"),
            attendedHours: 16,
          },
          {
            nik: "IAS-2020-0055",
            name: "Maya Sari",
            department: "HR",
            trainingDate: new Date("2026-05-20T00:00:00.000Z"),
            attendedHours: 14,
          },
          {
            nik: "IAS-2021-0089",
            name: "Fajar Nugroho",
            department: "IT",
            trainingDate: new Date("2026-05-20T00:00:00.000Z"),
            attendedHours: 16,
          },
        ],
      },
    },
  });

  // ── Licenses ───────────────────────────────────────────────────────────────
  // Dates relative to 2026-06-01 (today):
  //   EXPIRED         → expiryDate < today
  //   EXPIRING_1_MONTH → ≤ 30 days  → by 2026-07-01
  //   EXPIRING_3_MONTHS→ ≤ 90 days  → by 2026-08-30
  //   EXPIRING_5_MONTHS→ ≤ 150 days → by 2026-10-29
  //   ACTIVE          → > 150 days

  const licenseSeeds = [
    {
      id: "seed-lic-001",
      nik: "IAS-2019-0078",
      name: "Siti Rahma",
      position: "Aviation Safety Inspector",
      workLocation: "CGK",
      employeeStatus: "PKWTT",
      lob: "Ground Handling",
      licenseName: "Aircraft Maintenance Engineer (AME)",
      licenseNumber: "AME-2023-078",
      category: "Operasional",
      issuedDate: new Date("2023-08-15T00:00:00.000Z"),
      expiryDate: new Date("2025-08-15T00:00:00.000Z"), // EXPIRED
    },
    {
      id: "seed-lic-002",
      nik: "IAS-2022-0103",
      name: "Andi Pratama",
      position: "Customer Service Agent",
      workLocation: "SUB",
      employeeStatus: "PKWT",
      lob: "Food",
      licenseName: "Customer Excellence Certification",
      licenseNumber: "-",
      category: "Akademik",
      issuedDate: new Date("2025-02-10T00:00:00.000Z"),
      expiryDate: new Date("2028-02-10T00:00:00.000Z"), // ACTIVE
    },
    {
      id: "seed-lic-003",
      nik: "IAS-2020-0212",
      name: "Budi Santoso",
      position: "Ground Handling Supervisor",
      workLocation: "CGK",
      employeeStatus: "PKWTT",
      lob: "Cargo & Logistik",
      licenseName: "Dangerous Goods Regulations (DGR)",
      licenseNumber: "DGR-2024-212",
      category: "Operasional",
      issuedDate: new Date("2024-06-20T00:00:00.000Z"),
      expiryDate: new Date("2026-08-01T00:00:00.000Z"), // EXPIRING_3_MONTHS (61 hari)
    },
    {
      id: "seed-lic-004",
      nik: "IAS-2021-0519",
      name: "Dewi Lestari",
      position: "Flight Dispatcher",
      workLocation: "KNO",
      employeeStatus: "PKWTT",
      lob: "Ground Handling",
      licenseName: "Flight Dispatcher License (FOO)",
      licenseNumber: "FOO-2026-0519",
      category: "Operasional",
      issuedDate: new Date("2026-01-10T00:00:00.000Z"),
      expiryDate: new Date("2026-09-15T00:00:00.000Z"), // EXPIRING_5_MONTHS (106 hari)
    },
    {
      id: "seed-lic-005",
      nik: "IAS-2021-0721",
      name: "Ahmad Fauzi",
      position: "Aviation Security Officer",
      workLocation: "CGK",
      employeeStatus: "PKWT",
      lob: "Aviation Security",
      licenseName: "Basic Aviation Security (AVSEC)",
      licenseNumber: "AVSEC-2024-721",
      category: "Operasional",
      issuedDate: new Date("2024-06-15T00:00:00.000Z"),
      expiryDate: new Date("2026-06-20T00:00:00.000Z"), // EXPIRING_1_MONTH (19 hari)
    },
    {
      id: "seed-lic-006",
      nik: "IAS-2018-0888",
      name: "Reza Firmansyah",
      position: "Cargo Handler",
      workLocation: "DPS",
      employeeStatus: "PKWTT",
      lob: "Cargo & Logistik",
      licenseName: "Cargo Security Awareness",
      licenseNumber: "CSA-2025-888",
      category: "Operasional",
      issuedDate: new Date("2025-03-01T00:00:00.000Z"),
      expiryDate: new Date("2027-03-01T00:00:00.000Z"), // ACTIVE
    },
  ];

  for (const data of licenseSeeds) {
    await prisma.license.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }

  console.log("Seed complete.");
  console.log("  superadmin@ias.id  / admin123  (Super Admin)");
  console.log("  admin@ias.id       / admin123  (Admin)");
  console.log("  budi.s@ias.id      / user123   (User)");
  console.log(`  Training 1: ${training1.id} — ${training1.name}`);
  console.log(`  Training 2: ${training2.id} — ${training2.name}`);
  console.log(`  Licenses: ${licenseSeeds.length} records seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
