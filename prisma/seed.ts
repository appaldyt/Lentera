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

  // ── Employees ──────────────────────────────────────────────────────────────

  const employeeSeeds = [
    { id: "seed-emp-001", nik: "IAS-2021-0045", name: "Budi Santoso",       division: "Operations",      position: "Ground Handling Supervisor",   email: "budi.santoso@ias.id",       phone: "0812-3456-7890", workLocation: "CGK", lob: "Ground Handling",    employeeStatus: "PKWTT" },
    { id: "seed-emp-002", nik: "IAS-2020-0112", name: "Dewi Rahayu",        division: "Safety",          position: "Aviation Safety Inspector",    email: "dewi.rahayu@ias.id",        phone: "0813-2233-4455", workLocation: "CGK", lob: "Ground Handling",    employeeStatus: "PKWTT" },
    { id: "seed-emp-003", nik: "IAS-2022-0078", name: "Hendra Wijaya",      division: "Engineering",     position: "Maintenance Technician",       email: "hendra.wijaya@ias.id",      phone: "0811-9988-7766", workLocation: "DPS", lob: "Cargo & Logistik",   employeeStatus: "PKWT"  },
    { id: "seed-emp-004", nik: "IAS-2019-0033", name: "Rina Kusumawati",    division: "Finance",         position: "Finance Officer",              email: "rina.kusumawati@ias.id",    phone: "0856-1234-5678", workLocation: "CGK", lob: "Finance",            employeeStatus: "PKWTT" },
    { id: "seed-emp-005", nik: "IAS-2018-0007", name: "Doni Firmansyah",    division: "Operations",      position: "Operations Manager",           email: "doni.firmansyah@ias.id",    phone: "0821-4455-6677", workLocation: "SUB", lob: "Ground Handling",    employeeStatus: "PKWTT" },
    { id: "seed-emp-006", nik: "IAS-2020-0055", name: "Maya Sari",          division: "Human Resources", position: "HR Specialist",                email: "maya.sari@ias.id",          phone: "0857-8899-0011", workLocation: "CGK", lob: "Human Resources",    employeeStatus: "PKWT"  },
    { id: "seed-emp-007", nik: "IAS-2021-0089", name: "Fajar Nugroho",      division: "IT",              position: "System Analyst",               email: "fajar.nugroho@ias.id",      phone: "0878-2345-6789", workLocation: "CGK", lob: "IT",                 employeeStatus: "PKWTT" },
    { id: "seed-emp-008", nik: "IAS-2019-0078", name: "Siti Rahma",         division: "Safety",          position: "Aviation Safety Inspector",    email: "siti.rahma@ias.id",         phone: "0812-9988-1122", workLocation: "CGK", lob: "Ground Handling",    employeeStatus: "PKWTT" },
    { id: "seed-emp-009", nik: "IAS-2022-0103", name: "Andi Pratama",       division: "Ground Handling", position: "Customer Service Agent",       email: "andi.pratama@ias.id",       phone: "0822-3344-5566", workLocation: "SUB", lob: "Food",               employeeStatus: "PKWT"  },
    { id: "seed-emp-010", nik: "IAS-2020-0212", name: "Budi Setiawan",      division: "Ground Handling", position: "Ground Handling Supervisor",   email: "budi.setiawan@ias.id",      phone: "0833-4455-6677", workLocation: "CGK", lob: "Cargo & Logistik",   employeeStatus: "PKWTT" },
    { id: "seed-emp-011", nik: "IAS-2021-0519", name: "Dewi Lestari",       division: "Operations",      position: "Flight Dispatcher",            email: "dewi.lestari@ias.id",       phone: "0844-5566-7788", workLocation: "KNO", lob: "Ground Handling",    employeeStatus: "PKWTT" },
    { id: "seed-emp-012", nik: "IAS-2021-0721", name: "Ahmad Fauzi",        division: "Security",        position: "Aviation Security Officer",    email: "ahmad.fauzi@ias.id",        phone: "0855-6677-8899", workLocation: "CGK", lob: "Aviation Security",  employeeStatus: "PKWT"  },
    { id: "seed-emp-013", nik: "IAS-2018-0888", name: "Reza Firmansyah",    division: "Cargo",           position: "Cargo Handler",                email: "reza.firmansyah@ias.id",    phone: "0866-7788-9900", workLocation: "DPS", lob: "Cargo & Logistik",   employeeStatus: "PKWTT" },
    { id: "seed-emp-014", nik: "IAS-2023-0301", name: "Putri Ayu",          division: "Human Resources", position: "HR Administrator",             email: "putri.ayu@ias.id",          phone: "0877-8899-0011", workLocation: "CGK", lob: "Human Resources",    employeeStatus: "PKWT"  },
    { id: "seed-emp-015", nik: "IAS-2022-0415", name: "Rendi Pratama",      division: "General Affairs", position: "GA Coordinator",               email: "rendi.pratama@ias.id",      phone: "0888-9900-1122", workLocation: "CGK", lob: "General Affairs",    employeeStatus: "PKWTT" },
  ];

  for (const data of employeeSeeds) {
    await prisma.employee.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }

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

  // ── Budgets ────────────────────────────────────────────────────────────────

  const budgetSeeds = [
    {
      id: "seed-bgt-001",
      trainingName: "Aviation Safety Leadership",
      budgetYear: 2026, budgetMonth: 5,
      trainingType: "Mandatori",
      plannedAmount: 15000000, actualAmount: 15000000,
      invoiceDate: new Date("2026-05-02T00:00:00.000Z"),
      organizer: "GMF AeroAsia",
      dueDate: new Date("2026-05-15T00:00:00.000Z"),
      status: "Lunas", approvalStatus: "Disetujui",
    },
    {
      id: "seed-bgt-002",
      trainingName: "Customer Service Excellence",
      budgetYear: 2026, budgetMonth: 6,
      trainingType: "Non-Mandatori",
      plannedAmount: 5000000, actualAmount: 0,
      invoiceDate: null,
      organizer: "Internal Trainer",
      dueDate: new Date("2026-06-01T00:00:00.000Z"),
      status: "Belum Dibayar", approvalStatus: "Menunggu Persetujuan",
    },
    {
      id: "seed-bgt-003",
      trainingName: "Basic Fire Fighting & Safety",
      budgetYear: 2026, budgetMonth: 4,
      trainingType: "Mandatori",
      plannedAmount: 7500000, actualAmount: 7500000,
      invoiceDate: new Date("2026-04-05T00:00:00.000Z"),
      organizer: "Angkasa Pura II",
      dueDate: new Date("2026-04-20T00:00:00.000Z"),
      status: "Lunas", approvalStatus: "Disetujui",
    },
    {
      id: "seed-bgt-004",
      trainingName: "Ground Handling Operations",
      budgetYear: 2026, budgetMonth: 5,
      trainingType: "Mandatori",
      plannedAmount: 25000000, actualAmount: 10000000,
      invoiceDate: new Date("2026-05-10T00:00:00.000Z"),
      organizer: "JAS Airport Services",
      dueDate: new Date("2026-05-25T00:00:00.000Z"),
      status: "Jatuh Tempo", approvalStatus: "Disetujui",
    },
    {
      id: "seed-bgt-005",
      trainingName: "Dangerous Goods Regulations (DGR)",
      budgetYear: 2026, budgetMonth: 7,
      trainingType: "Mandatori",
      plannedAmount: 12000000, actualAmount: 0,
      invoiceDate: null,
      organizer: "IATA Training",
      dueDate: new Date("2026-07-31T00:00:00.000Z"),
      status: "Belum Dibayar", approvalStatus: "Disetujui",
    },
    {
      id: "seed-bgt-006",
      trainingName: "Leadership & People Management",
      budgetYear: 2026, budgetMonth: 5,
      trainingType: "Non-Mandatori",
      plannedAmount: 8000000, actualAmount: 8000000,
      invoiceDate: new Date("2026-05-22T00:00:00.000Z"),
      organizer: "PT Integrasi Aviasi Solusi – Internal",
      dueDate: new Date("2026-05-30T00:00:00.000Z"),
      status: "Lunas", approvalStatus: "Disetujui",
    },
    {
      id: "seed-bgt-007",
      trainingName: "Aviation Security Awareness",
      budgetYear: 2026, budgetMonth: 8,
      trainingType: "Mandatori",
      plannedAmount: 6500000, actualAmount: 0,
      invoiceDate: null,
      organizer: "Direktorat Jenderal Perhubungan Udara",
      dueDate: new Date("2026-08-15T00:00:00.000Z"),
      status: "Belum Dibayar", approvalStatus: "Menunggu Persetujuan",
    },
    {
      id: "seed-bgt-008",
      trainingName: "Cargo Handling & Documentation",
      budgetYear: 2026, budgetMonth: 3,
      trainingType: "Mandatori",
      plannedAmount: 9000000, actualAmount: 9000000,
      invoiceDate: new Date("2026-03-10T00:00:00.000Z"),
      organizer: "JAS Airport Services",
      dueDate: new Date("2026-03-25T00:00:00.000Z"),
      status: "Lunas", approvalStatus: "Disetujui",
    },
  ];

  for (const data of budgetSeeds) {
    await prisma.budget.upsert({
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
  console.log(`  Employees: ${employeeSeeds.length} records seeded`);
  console.log(`  Licenses: ${licenseSeeds.length} records seeded`);
  console.log(`  Budgets: ${budgetSeeds.length} records seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
