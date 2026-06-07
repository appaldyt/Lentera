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

  // ── Budget Processes ────────────────────────────────────────────────────────

  const DEFAULT_STEPS = ["Invoice Sent", "Input Invoice", "Verifikasi Finance 1", "Verifikasi Finance 2", "Payment Status"];

  const budgetProcessSeeds: {
    id: string; budgetId: string; stepNo: number; tahap: string;
    status: string; tanggal: string | null; keterangan: string; linkBukti: string;
  }[] = [];

  const buildSteps = (
    budgetId: string,
    prefix: string,
    variant: "lunas" | "belum" | "jatuh_tempo"
  ) => {
    const configs: { status: string; tanggal: string | null; keterangan: string }[] =
      variant === "lunas"
        ? [
            { status: "Selesai", tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
            { status: "Selesai", tanggal: "2026-05-02", keterangan: "Diinput ke sistem keuangan" },
            { status: "Selesai", tanggal: "2026-05-03", keterangan: "Terverifikasi oleh staf" },
            { status: "Selesai", tanggal: "2026-05-04", keterangan: "Terverifikasi oleh manajer" },
            { status: "Selesai", tanggal: "2026-05-05", keterangan: "Pembayaran diterima" },
          ]
        : variant === "belum"
        ? [
            { status: "Selesai",  tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
            { status: "Selesai",  tanggal: "2026-05-02", keterangan: "Diinput ke sistem keuangan" },
            { status: "Selesai",  tanggal: "2026-05-03", keterangan: "Terverifikasi oleh staf" },
            { status: "Menunggu", tanggal: null,         keterangan: "" },
            { status: "Belum",    tanggal: null,         keterangan: "" },
          ]
        : [
            { status: "Selesai",  tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
            { status: "Diproses", tanggal: null,         keterangan: "Sedang diinput" },
            { status: "Belum",    tanggal: null,         keterangan: "" },
            { status: "Belum",    tanggal: null,         keterangan: "" },
            { status: "Belum",    tanggal: null,         keterangan: "" },
          ];

    DEFAULT_STEPS.forEach((tahap, i) => {
      budgetProcessSeeds.push({
        id: `${prefix}-step-${i + 1}`,
        budgetId,
        stepNo: i + 1,
        tahap,
        ...configs[i],
        linkBukti: "",
      });
    });
  };

  buildSteps("seed-bgt-001", "proc-001", "lunas");
  buildSteps("seed-bgt-002", "proc-002", "belum");
  buildSteps("seed-bgt-003", "proc-003", "lunas");
  buildSteps("seed-bgt-004", "proc-004", "jatuh_tempo");
  buildSteps("seed-bgt-005", "proc-005", "belum");
  buildSteps("seed-bgt-006", "proc-006", "lunas");
  buildSteps("seed-bgt-007", "proc-007", "belum");
  buildSteps("seed-bgt-008", "proc-008", "lunas");

  for (const data of budgetProcessSeeds) {
    const { tanggal, ...rest } = data;
    await prisma.budgetProcess.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...rest,
        tanggal: tanggal ? new Date(tanggal + "T00:00:00.000Z") : null,
      },
    });
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────

  const roomSeeds = [
    {
      id: "seed-room-001",
      name: "Auditorium A",
      capacity: 100,
      ownership: "INTERNAL",
      ownerEntity: "PT Integrasi Aviasi Solusi",
      location: "Gedung Pusat (Lantai 2)",
      photoLink: "",
      facilities: [
        { id: "seed-fac-001", name: "Proyektor 4K", type: "Elektronik", quantity: 2, photoLink: "", notes: "Resolusi 4K, merk Epson" },
        { id: "seed-fac-002", name: "Soundsystem", type: "Audio", quantity: 1, photoLink: "", notes: "Set lengkap speaker & mixer" },
        { id: "seed-fac-003", name: "AC Sentral", type: "Pendingin", quantity: 4, photoLink: "", notes: "" },
        { id: "seed-fac-004", name: "Podium", type: "Mebel", quantity: 1, photoLink: "", notes: "" },
      ],
    },
    {
      id: "seed-room-002",
      name: "Hangar 3 Practice Area",
      capacity: 50,
      ownership: "INTERNAL",
      ownerEntity: "PT Integrasi Aviasi Solusi",
      location: "Fasilitas Hangar",
      photoLink: "",
      facilities: [
        { id: "seed-fac-005", name: "Alat Peraga Ground Handling", type: "Peraga", quantity: 5, photoLink: "", notes: "Termasuk mock-up baggage" },
        { id: "seed-fac-006", name: "APAR", type: "Safety", quantity: 3, photoLink: "", notes: "Powder 6kg, cek berkala 6 bulan" },
        { id: "seed-fac-007", name: "Safety Kit", type: "Safety", quantity: 50, photoLink: "", notes: "" },
      ],
    },
    {
      id: "seed-room-003",
      name: "Meeting Room Mawar",
      capacity: 25,
      ownership: "RENTED",
      ownerEntity: "Hotel Aero Bandara",
      location: "Hotel Bandara Internasional",
      photoLink: "",
      facilities: [
        { id: "seed-fac-008", name: "Smart TV 65 Inch", type: "Elektronik", quantity: 1, photoLink: "", notes: "Samsung, termasuk remote & bracket" },
        { id: "seed-fac-009", name: "Papan Tulis Kaca", type: "Alat Tulis", quantity: 1, photoLink: "", notes: "" },
        { id: "seed-fac-010", name: "AC Split 2 PK", type: "Pendingin", quantity: 2, photoLink: "", notes: "" },
      ],
    },
    {
      id: "seed-room-004",
      name: "Laboratorium Komputer 1",
      capacity: 30,
      ownership: "INTERNAL",
      ownerEntity: "PT Integrasi Aviasi Solusi",
      location: "Gedung Diklat (Lantai 1)",
      photoLink: "",
      facilities: [
        { id: "seed-fac-011", name: "PC All-in-One Core i7", type: "Komputer", quantity: 30, photoLink: "", notes: "RAM 16GB, SSD 512GB" },
        { id: "seed-fac-012", name: "Switch Hub 48 Port", type: "Jaringan", quantity: 1, photoLink: "", notes: "Cisco Catalyst 2960" },
        { id: "seed-fac-013", name: "Proyektor EPSON", type: "Elektronik", quantity: 1, photoLink: "", notes: "" },
      ],
    },
    {
      id: "seed-room-005",
      name: "Ballroom B",
      capacity: 200,
      ownership: "RENTED",
      ownerEntity: "Gedung Convention Center IAS",
      location: "Gedung Convention Center",
      photoLink: "",
      facilities: [
        { id: "seed-fac-014", name: "Panggung Modular", type: "Mebel", quantity: 1, photoLink: "", notes: "Ukuran 6x4m, bisa dibongkar" },
        { id: "seed-fac-015", name: "LED Videotron 4x3m", type: "Elektronik", quantity: 1, photoLink: "", notes: "" },
        { id: "seed-fac-016", name: "Soundsystem Premium (Line Array)", type: "Audio", quantity: 1, photoLink: "", notes: "Set 8 unit speaker line array" },
      ],
    },
    {
      id: "seed-room-006",
      name: "Ruang Kelas Training A",
      capacity: 40,
      ownership: "INTERNAL",
      ownerEntity: "PT Integrasi Aviasi Solusi",
      location: "Gedung Diklat (Lantai 2)",
      photoLink: "",
      facilities: [
        { id: "seed-fac-017", name: "Meja & Kursi Peserta", type: "Mebel", quantity: 40, photoLink: "", notes: "" },
        { id: "seed-fac-018", name: "Whiteboard", type: "Alat Tulis", quantity: 2, photoLink: "", notes: "" },
        { id: "seed-fac-019", name: "LCD Proyektor", type: "Elektronik", quantity: 1, photoLink: "", notes: "Resolusi Full HD" },
        { id: "seed-fac-020", name: "AC Split 2 PK", type: "Pendingin", quantity: 2, photoLink: "", notes: "" },
      ],
    },
  ];

  for (const data of roomSeeds) {
    const { facilities, ...roomData } = data;
    await prisma.room.upsert({
      where: { id: roomData.id },
      update: {},
      create: {
        ...roomData,
        facilities: {
          createMany: {
            data: facilities.map(({ id: facId, ...fac }) => ({ id: facId, ...fac })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  // ── Vendors ────────────────────────────────────────────────────────────────

  const vendorSeeds = [
    {
      id: "seed-vendor-001",
      name: "PT Mitra Pelatihan Indonesia",
      location: "Jakarta",
      phone: "0812-3456-7890",
      email: "info@mitrapelatihan.com",
      topics: ["Leadership", "Komunikasi", "Team Building"],
      method: "Hybrid",
      status: "AKTIF",
      priceMin: 3000000,
      priceMax: 5000000,
      rating: 4.5,
      usedBefore: true,
      notes: "Trainer sangat profesional dan berpengalaman. Cocok untuk level manajerial. Perlu konfirmasi H-7 sebelum pelaksanaan.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-002",
      name: "Budi Santoso, M.Psi",
      location: "Bandung",
      phone: "0821-9876-5432",
      email: "budi.santoso@gmail.com",
      topics: ["Service Excellence", "Team Building"],
      method: "Offline",
      status: "AKTIF",
      priceMin: 2500000,
      priceMax: 4000000,
      rating: 4.2,
      usedBefore: true,
      notes: "Konsultan psikologi industri berpengalaman 10 tahun. Spesialis soft skill dan team dynamics.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-003",
      name: "Experia Training Center",
      location: "Surabaya",
      phone: "0856-1122-3344",
      email: "hello@experia.id",
      topics: ["Selling Skills", "Komunikasi", "Negosiasi"],
      method: "Online",
      status: "AKTIF",
      priceMin: 1500000,
      priceMax: 2500000,
      rating: 4.0,
      usedBefore: true,
      notes: "Platform LMS lengkap dengan fitur assessment. Cocok untuk training massal secara daring.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-004",
      name: "PT Aviasi Training & Consulting",
      location: "Jakarta",
      phone: "0811-2233-4455",
      email: "training@aviaticonsult.co.id",
      topics: ["Aviation Safety", "SMS", "Crew Resource Management"],
      method: "Hybrid",
      status: "AKTIF",
      priceMin: 5000000,
      priceMax: 10000000,
      rating: 4.8,
      usedBefore: true,
      notes: "Spesialis pelatihan keselamatan penerbangan. Trainer bersertifikat IATA dan ICAO. Wajib booking minimal 1 bulan sebelumnya.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-005",
      name: "Drs. Hendra Wijaya, MBA",
      location: "Yogyakarta",
      phone: "0878-5566-7788",
      email: "hendra.wijaya.trainer@gmail.com",
      topics: ["Finance for Non-Finance", "Budgeting", "Manajemen Risiko"],
      method: "Offline",
      status: "AKTIF",
      priceMin: 3500000,
      priceMax: 6000000,
      rating: 4.3,
      usedBefore: false,
      notes: "Dosen aktif FEB UGM. Pengalaman sebagai CFO di perusahaan multinasional selama 15 tahun.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-006",
      name: "BrightSkills Academy",
      location: "Jakarta",
      phone: "021-5500-1234",
      email: "contact@brightskills.id",
      topics: ["Digital Literacy", "Data Analytics", "Microsoft Office"],
      method: "Online",
      status: "AKTIF",
      priceMin: 800000,
      priceMax: 1500000,
      rating: 3.9,
      usedBefore: false,
      notes: "Platform e-learning dengan konten siap pakai. Cocok untuk upskilling karyawan level staf.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-007",
      name: "PT Talenta Maju Bersama",
      location: "Tangerang",
      phone: "0815-8899-0011",
      email: "info@talentamaju.com",
      topics: ["HR Management", "Rekrutmen", "Performance Management"],
      method: "Hybrid",
      status: "AKTIF",
      priceMin: 4000000,
      priceMax: 7000000,
      rating: 4.1,
      usedBefore: false,
      notes: "Konsultan HR dengan pengalaman proyek di lebih dari 50 perusahaan nasional dan multinasional.",
      legalDocUrl: "",
    },
    {
      id: "seed-vendor-008",
      name: "Indira Prasetyo, S.Hum",
      location: "Semarang",
      phone: "0856-3344-5566",
      email: "indira.trainer@outlook.com",
      topics: ["Komunikasi Efektif", "Public Speaking", "Customer Service"],
      method: "Offline",
      status: "TIDAK_AKTIF",
      priceMin: 2000000,
      priceMax: 3500000,
      rating: 3.7,
      usedBefore: false,
      notes: "Sedang dalam periode istirahat s.d. Desember 2026. Dapat dihubungi untuk booking awal 2027.",
      legalDocUrl: "",
    },
  ];

  for (const data of vendorSeeds) {
    await prisma.vendor.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }

  // ── Self-Learning Hours ────────────────────────────────────────────────────

  const selfLearningSeeds = [
    { id: "seed-sl-001", nik: "IAS-2021-0045", name: "Budi Santoso",       department: "Operations",      year: "2026", platform: "Udemy",             hours: 12 },
    { id: "seed-sl-002", nik: "IAS-2021-0045", name: "Budi Santoso",       department: "Operations",      year: "2025", platform: "YouTube",            hours: 8  },
    { id: "seed-sl-003", nik: "IAS-2020-0112", name: "Dewi Rahayu",        department: "Safety",          year: "2026", platform: "Coursera",           hours: 20 },
    { id: "seed-sl-004", nik: "IAS-2020-0112", name: "Dewi Rahayu",        department: "Safety",          year: "2025", platform: "LinkedIn Learning",   hours: 15 },
    { id: "seed-sl-005", nik: "IAS-2022-0078", name: "Hendra Wijaya",      department: "Engineering",     year: "2026", platform: "Udemy",             hours: 10 },
    { id: "seed-sl-006", nik: "IAS-2019-0033", name: "Rina Kusumawati",    department: "Finance",         year: "2026", platform: "Coursera",           hours: 18 },
    { id: "seed-sl-007", nik: "IAS-2019-0033", name: "Rina Kusumawati",    department: "Finance",         year: "2025", platform: "Udemy",             hours: 22 },
    { id: "seed-sl-008", nik: "IAS-2018-0007", name: "Doni Firmansyah",    department: "Operations",      year: "2026", platform: "LinkedIn Learning",   hours: 14 },
    { id: "seed-sl-009", nik: "IAS-2018-0007", name: "Doni Firmansyah",    department: "Operations",      year: "2025", platform: "Skillshare",         hours: 9  },
    { id: "seed-sl-010", nik: "IAS-2020-0055", name: "Maya Sari",          department: "Human Resources", year: "2026", platform: "Coursera",           hours: 25 },
    { id: "seed-sl-011", nik: "IAS-2020-0055", name: "Maya Sari",          department: "Human Resources", year: "2025", platform: "edX",                hours: 30 },
    { id: "seed-sl-012", nik: "IAS-2021-0089", name: "Fajar Nugroho",      department: "IT",              year: "2026", platform: "Udemy",             hours: 35 },
    { id: "seed-sl-013", nik: "IAS-2021-0089", name: "Fajar Nugroho",      department: "IT",              year: "2025", platform: "Pluralsight",        hours: 40 },
    { id: "seed-sl-014", nik: "IAS-2019-0078", name: "Siti Rahma",         department: "Safety",          year: "2026", platform: "YouTube",            hours: 6  },
    { id: "seed-sl-015", nik: "IAS-2022-0103", name: "Andi Pratama",       department: "Ground Handling", year: "2026", platform: "Ruangguru",          hours: 8  },
    { id: "seed-sl-016", nik: "IAS-2020-0212", name: "Budi Setiawan",      department: "Ground Handling", year: "2026", platform: "LinkedIn Learning",   hours: 12 },
    { id: "seed-sl-017", nik: "IAS-2021-0519", name: "Dewi Lestari",       department: "Operations",      year: "2026", platform: "Coursera",           hours: 16 },
    { id: "seed-sl-018", nik: "IAS-2021-0519", name: "Dewi Lestari",       department: "Operations",      year: "2025", platform: "Udemy",             hours: 11 },
    { id: "seed-sl-019", nik: "IAS-2021-0721", name: "Ahmad Fauzi",        department: "Security",        year: "2026", platform: "YouTube",            hours: 7  },
    { id: "seed-sl-020", nik: "IAS-2018-0888", name: "Reza Firmansyah",    department: "Cargo",           year: "2025", platform: "Skillshare",         hours: 5  },
    { id: "seed-sl-021", nik: "IAS-2023-0301", name: "Putri Ayu",          department: "Human Resources", year: "2026", platform: "edX",                hours: 20 },
    { id: "seed-sl-022", nik: "IAS-2022-0415", name: "Rendi Pratama",      department: "General Affairs", year: "2026", platform: "Udemy",             hours: 9  },
    { id: "seed-sl-023", nik: "IAS-2022-0415", name: "Rendi Pratama",      department: "General Affairs", year: "2025", platform: "LinkedIn Learning",   hours: 13 },
  ];

  for (const data of selfLearningSeeds) {
    await prisma.selfLearning.upsert({
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
  console.log(`  Rooms: ${roomSeeds.length} records seeded`);
  console.log(`  Vendors: ${vendorSeeds.length} records seeded`);
  console.log(`  Self-Learning: ${selfLearningSeeds.length} records seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
