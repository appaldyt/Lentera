# PRD — Project Requirements Document

## 1. Overview

**LENTERA** (Learning, Evaluation, Needs, Training & Employee Reporting Application) adalah aplikasi web internal perusahaan yang dirancang untuk memonitor dan mengelola seluruh kegiatan training karyawan serta lisensi/sertifikasi yang dimiliki perusahaan secara terpusat.

**Masalah yang diselesaikan:**
- Pencatatan training karyawan masih tersebar (Excel, email, dokumen manual) sehingga sulit dimonitor.
- Tidak ada sistem peringatan dini untuk lisensi/sertifikasi yang akan habis masa berlakunya.
- Anggaran dan pembayaran training sulit dilacak realisasinya.
- Penggunaan ruangan training sering bentrok karena tidak ada sistem booking terpusat.
- Migrasi data historis dari Excel ke aplikasi baru memakan waktu jika harus input manual satu per satu.

**Tujuan utama:**
- Menyediakan satu dashboard terpusat untuk admin memonitor semua training (persiapan, berlangsung, selesai).
- Memastikan tidak ada lisensi perusahaan/karyawan yang expired tanpa terdeteksi.
- Mempermudah perencanaan anggaran dan pelacakan pembayaran training.
- Mengoptimalkan utilisasi ruangan training.
- Mendukung **import data massal** via Excel/CSV agar migrasi & input rutin lebih cepat.

---

## 2. Requirements

- Aplikasi berbasis web yang dapat diakses internal perusahaan.
- Sistem autentikasi dengan role-based access (Admin, HR, Manajer).
- Mendukung input data karyawan berdasarkan **NIK** sebagai identitas unik.
- Sistem notifikasi otomatis untuk lisensi yang mendekati masa kadaluarsa.
- Calendar view untuk melihat jadwal training secara visual.
- Dashboard yang menampilkan ringkasan training, anggaran, lisensi, dan ruangan.
- **Fitur Import Data (Excel/CSV)** tersedia di setiap menu utama dengan template yang dapat diunduh.
- Pelaporan/export data ke format umum (PDF/Excel) untuk dokumentasi.
- Database relasional yang terstruktur dan scalable menggunakan Prisma ORM.
- UI yang clean, modern, dan professional mengadopsi gaya **corporate aviation** (referensi: ias.id).

---

## 3. Core Features

- **Dashboard Admin** — ringkasan eksekutif seluruh modul, dipisahkan dalam 3 tab interaktif:
  - **Overview Training**: Statistik training berjalan, kelulusan, distribusi Line of Business, dan grafik visual *Peserta Training per Bulan*.
  - **Overview Lisensi & Sertifikasi**: Metrik lisensi yang hampir kadaluwarsa, peta distribusi demografi LOB & Lokasi, serta proporsi jenis lisensi.
  - **Overview Anggaran & Biaya**: Metrik kinerja keuangan meliputi Total Anggaran (YTD), Total Realisasi (YTD), Efisiensi Anggaran, Tagihan Jatuh Tempo, didukung visualisasi *Bar Chart* (Anggaran vs Realisasi) dan *Pie Chart* (Distribusi Jenis Anggaran).
  - Secara global dilengkapi dengan filter interaktif berdasarkan **Bulan** dan **Tahun**.
- **Manajemen Training** — input data training (nama, deskripsi, penyelenggara, job families, durasi, biaya, ruangan, rentang jadwal mulai dan selesai) beserta rincian aktivitas persiapan (berupa checklist sub-task yang interaktif dengan *Menu Aksi Dropdown* (3-titik) untuk Edit dan Hapus). Tabel utama dilengkapi dengan menu aksi seragam untuk fitur Edit, Detail, dan Hapus (beserta dialog konfirmasi penghapusan), **Export** tabel data, serta filter interaktif berdasarkan **Bulan** dan **Tahun**.
- **Calendar of Training (Interaktif & Timeline)** — visualisasi jadwal training dalam tampilan kalender grid bulanan/mingguan, serta tampilan *Timeline Program (Gantt Chart)* tahunan yang dikelompokkan berdasarkan *Jenis Training* (Mandatori & Non-Mandatori). Rentang durasi jadwal secara otomatis membaca rentang waktu dari *Tanggal Mulai* hingga *Tanggal Selesai*. Tampilan Timeline dilengkapi dengan **Filter Tahun** yang otomatis disembunyikan saat pengguna beralih ke mode Grid. Event pada kalender dapat diklik untuk langsung mengedit detail training.
- **Learning Hours** — dasbor pelaporan rekapitulasi yang secara otomatis mengagregasi total jam belajar (*attendedHours*) per karyawan, dilengkapi visualisasi *progress bar* terhadap target jam tahunan. Terintegrasi dengan fitur **Filter Tahun** yang secara real-time menyaring data yang ditampilkan.
- **Registrasi Peserta** — input peserta training berdasarkan NIK karyawan (dengan integrasi *auto-fill* nama dan divisi dari *database* karyawan), penetapan tanggal training, dan alokasi jam training per peserta. Fitur CRUD pada tabel daftar peserta menggunakan menu aksi dropdown (3-titik) seragam untuk mengedit (termasuk *Jam Kehadiran*) dan menghapus data secara aman dengan dialog konfirmasi.
- **Monitoring Lisensi & Sertifikasi** — modul pencatatan lisensi karyawan yang komprehensif, dilengkapi dengan:
  - **Dashboard Analitik Terpusat**: Visualisasi data lisensi melalui *Bar Chart* (Proyeksi Kadaluwarsa 6 bulan ke depan), *Pie Chart* (Distribusi Kategori Akademik vs Operasional & Distribusi Line of Business), *Horizontal Bar Chart* (Top 5 Nama Lisensi Terpopuler), *Scrollable Vertical Bar Chart* (Distribusi 44+ Stasiun/Lokasi Kerja), dan indikator *Pill Badges* (Rincian peringatan kadaluwarsa <1, <3, <5 bulan).
  - **Tabel Data Interaktif**: Menampilkan data detail dengan kolom lengkap (termasuk **No Lisensi**), *filter tab* (Semua Lisensi, Akademik, Operasional), *search bar*, serta **Menu Filter Pop-up** interaktif yang elegan untuk menyaring spesifik berdasarkan Nama, Lokasi Kerja, Nama Lisensi, dan Status.
  - **Fitur CRUD & Auto-Fill**: Manajemen penambahan, pengeditan, dan penghapusan lisensi menggunakan *Custom Modal Dialog* dan Menu Aksi Dropdown (3-titik) yang aman (memiliki konfirmasi hapus). Formulir input terintegrasi dengan sistem *Auto-Fill* (memasukkan NIK otomatis ditarik Nama, Jabatan, Lokasi, Status Karyawan PKWT/PKWTT/OS, dan LOB dari *master data* Karyawan).
- **Manajemen Karyawan** — master data direktori tenaga kerja yang memuat profil karyawan. Dilengkapi dengan tabel interaktif, **Menu Filter Pop-up** (Divisi, Jabatan, Lokasi Kerja, Status: PKWT, PKWTT, OS), serta fitur **CRUD via Custom Modal Dialog** dan Menu Aksi Dropdown (3-titik) untuk menambah, mengedit, dan menghapus data karyawan (dilengkapi dialog konfirmasi).
- **Monitoring Anggaran & Biaya** — fitur manajemen keuangan yang dipisahkan menjadi dua tab interaktif:
  - **Tab Perencanaan Anggaran**: Untuk mencatat rencana budget (mencakup data Tahun Anggaran, Bulan, Jenis Training, Rencana Anggaran, dan Status Persetujuan). Dilengkapi dengan ringkasan *Total Anggaran (Planned)*, *Anggaran Disetujui*, dan *Menunggu Persetujuan*. Memiliki *Modal Form* terdedikasi serta **Menu Aksi Dropdown (3-titik)** untuk menambah, **mengedit**, dan **menghapus** data perencanaan secara aman dengan *dialog konfirmasi peringatan*.
  - **Tab Tagihan & Realisasi (Biaya)**: Untuk memantau pengeluaran aktual (Realisasi Biaya), Tanggal Invoice, Nama Penyelenggara, Tanggal Jatuh Tempo, dan Status Pembayaran (Lunas/Belum Dibayar/Jatuh Tempo). Dilengkapi dengan ringkasan *Total Realisasi (Actual)*, *Tagihan Lunas*, dan *Tagihan Jatuh Tempo*. Memiliki *Modal Form* terdedikasi serta **Menu Aksi Dropdown (3-titik)** untuk menambah, **mengedit**, dan **menghapus** data tagihan secara aman dengan *dialog konfirmasi peringatan*.
- **Manajemen Ruangan** — daftar ruangan dengan kapasitas, fasilitas, kepemilikan, dan ketersediaan jadwal.
- **Import Data Massal** — fitur import Excel/CSV di beberapa menu utama:
  - Import data **Karyawan** (NIK, nama, departemen, posisi, email).
  - Khusus menu **Manajemen Training** dan **Learning Hours**, fitur utamanya adalah **Export Excel** untuk mengunduh rekap.
  - Import data **Peserta Training** (training, NIK karyawan, jam training).
  - Import data **Lisensi** (nama, jenis, kategori, tanggal terbit, tanggal expired, pemilik).
  - Import data **Anggaran & Biaya** (training, tahun anggaran, bulan, jenis, planned amount, actual amount, status persetujuan, status pembayaran).
  - Import data **Ruangan** (nama, kapasitas, fasilitas, kepemilikan, lokasi).
  - Setiap menu menyediakan **template Excel** yang dapat diunduh.
  - **Validasi otomatis** (cek duplikasi NIK, format tanggal, FK valid) sebelum data masuk.
  - **Error report** menampilkan baris yang gagal beserta alasannya, dan baris valid tetap diproses.
- **Laporan & Export** — ringkasan training periode tertentu yang dapat diunduh.

---

## 4. User Flow

1. Admin/HR login ke aplikasi LENTERA.
2. Admin masuk ke **Dashboard** untuk melihat ringkasan semua aktivitas.
3. **(Opsional) Import data awal** — pada setiap menu, admin dapat:
   - Mengunduh template Excel.
   - Mengisi template sesuai format.
   - Mengunggah file untuk diproses sistem.
   - Melihat preview & error report sebelum konfirmasi.
4. Admin membuat **Training baru**:
   - Mengisi data dasar (nama, tanggal, durasi, biaya).
   - Memilih **ruangan** dari daftar yang tersedia.
   - Membuat checklist **aktivitas persiapan** (identifikasi kebutuhan, instruktur, dll).
   - Menentukan **anggaran** training.
5. Admin melakukan **registrasi peserta** dengan input NIK karyawan dan jam training (manual atau import Excel).
6. Selama training berjalan, admin mencatat **pembayaran** yang dilakukan.
7. Admin secara berkala mengecek **Monitoring Lisensi** dan menerima notifikasi lisensi yang akan expired.
8. Admin melihat **Calendar of Training** untuk memastikan tidak ada jadwal yang bentrok, dan dapat mengklik event kalender untuk melakukan pengeditan secara cepat.
9. HR/Manajemen memonitor KPI dan produktivitas melalui fitur **Learning Hours** (yang dapat difilter per tahun).
10. Setelah training selesai, admin menandai status training sebagai *completed* dan mengunduh laporan.

---

## 5. Design System & Branding

Style visual aplikasi LENTERA mengadopsi tampilan **corporate professional** seperti website **ias.id** (PT Integrasi Aviasi Solusi) — bersih, modern, dan memberi kesan terpercaya khas korporat aviasi.

### 🎨 Palet Warna Utama

| Token | Hex | Penggunaan |
|---|---|---|
| **Primary / Navy** | `#0B2A4A` | Background sidebar, header, tombol utama, judul section |
| **Primary Dark** | `#061A2E` | Hover state navy, footer |
| **Accent / Sky Blue** | `#1E88E5` | Tombol aksi sekunder, link, highlight, ikon aktif |
| **Accent Light** | `#64B5F6` | Hover state biru, badge informasi |
| **Background** | `#F5F7FA` | Background utama halaman |
| **Surface / Card** | `#FFFFFF` | Kartu, modal, form container |
| **Border / Divider** | `#E0E6ED` | Garis pemisah, border input |
| **Text Primary** | `#1A2332` | Teks utama, heading |
| **Text Secondary** | `#5A6B7C` | Teks pendukung, label, placeholder |
| **Success** | `#2E7D32` | Status lunas, training selesai, lisensi aktif |
| **Warning** | `#F9A825` | Lisensi mendekati expired, pembayaran pending |
| **Danger** | `#C62828` | Lisensi expired, pembayaran overdue, error |

### 🖋️ Typography
- **Font Family:** `Inter` atau `Plus Jakarta Sans` (Google Fonts) — modern sans-serif, mudah dibaca.
- **Heading:** Bold, warna Navy (`#0B2A4A`).
- **Body:** Regular 14–16px, warna Text Primary.
- **Hierarchy jelas:** H1 (28px) → H2 (22px) → H3 (18px) → Body (14–16px).

### 🧩 Komponen UI
- **Sidebar:** Background Navy (`#0B2A4A`), ikon & teks putih, active state Sky Blue.
- **Header / Topbar:** Background putih, border bawah tipis, logo LENTERA di kiri, profil user di kanan.
- **Card:** Background putih, border `#E0E6ED`, shadow halus (`shadow-sm`), border-radius 8–12px.
- **Tombol Primary:** Background Navy, teks putih, hover → Primary Dark.
- **Tombol Secondary:** Outline Sky Blue, teks Sky Blue, hover → background Sky Blue + teks putih.
- **Input/Form:** Border tipis `#E0E6ED`, focus ring Sky Blue.
- **Badge Status:** Pakai warna semantik (Success/Warning/Danger) dengan background pucat & teks gelap.
- **Tabel:** Header background `#F5F7FA`, baris hover `#F0F4F8`, garis pemisah halus.
- **Chart (Recharts):** Skema warna Navy + Sky Blue + Accent Light + Success/Warning untuk kontras.

### 🎯 Prinsip Desain
- **Clean & spacious** — banyak white space, hindari elemen padat.
- **Professional** — minim dekorasi, fokus pada keterbacaan data.
- **Consistent** — semua tombol, card, dan form mengikuti token warna yang sama.
- **Accessible** — kontras teks vs background memenuhi WCAG AA.

> Konfigurasi warna di-implementasikan via **Tailwind CSS theme extension** (`tailwind.config.ts`) dan **shadcn/ui CSS variables** agar konsisten di seluruh aplikasi serta mendukung dark mode di masa depan.

---

## 6. Architecture

Aplikasi menggunakan arsitektur **monolith full-stack** dengan Next.js (App Router) sebagai frontend sekaligus backend (API Routes/Server Actions), dan Prisma sebagai jembatan ke database.

```mermaid
flowchart TD
    A[User: Admin / HR / Manajer] -->|HTTPS| B[Next.js App Frontend]
    B --> C[Server Actions / API Routes]
    C --> D[Auth Layer - Better Auth]
    C --> E[Business Logic Layer]
    E --> F[Prisma ORM]
    F --> G[(SQLite / PostgreSQL)]
    E --> H[Notification Service]
    H -->|Cron Job| I[Cek Lisensi Expired]
    I --> J[Email / In-App Notif]
    E --> N[Import Service]
    N --> O[Parser Excel/CSV - SheetJS]
    O --> P[Validator + Error Report]
    P --> F
    B --> K[UI: Tailwind + shadcn/ui - Theme ias.id]
    B --> L[Calendar View Component]
    B --> M[Dashboard & Charts]
```

**Penjelasan singkat:**
- **Frontend & Backend** berada dalam satu codebase Next.js.
- **Prisma ORM** menangani semua interaksi database secara type-safe.
- **Notification Service** berjalan via cron job untuk memeriksa lisensi yang akan expired dan mengirim notifikasi.
- **Import Service** memproses file Excel/CSV via SheetJS, melakukan validasi per baris, lalu meneruskan data valid ke Prisma. Baris gagal dikembalikan sebagai error report.
- **Better Auth** menangani autentikasi dan otorisasi berbasis role.
- **UI Theme** mengikuti design system bergaya ias.id (navy + sky blue corporate).

---

## 7. Database Schema

Berikut tabel utama yang dibutuhkan beserta kolomnya:

### `User` — pengguna aplikasi (admin/HR)
- `id` (String, PK)
- `email` (String, unik)
- `name` (String)
- `password` (String, hashed)
- `role` (Enum: ADMIN, HR, MANAGER)
- `createdAt` (DateTime)

### `Employee` — karyawan perusahaan
- `id` (String, PK)
- `nik` (String, unik) — identitas utama karyawan
- `name` (String)
- `department` (String)
- `position` (String)
- `workLocation` (String) — lokasi kerja (mis. CGK, SUB, KNO)
- `employeeStatus` (Enum/String: TETAP, KONTRAK, OUTSOURCE) — status karyawan
- `lob` (String) — Line of Business (mis. Cargo & Logistik, Ground Handling)
- `email` (String)

### `Training` — data training
- `id` (String, PK)
- `name` (String) — nama training
- `jobFamilies` (Array of Strings) — mis. ["People Management", "Aviation Security"]
- `description` (Text)
- `trainingType` (Enum: MANDATORY, NON_MANDATORY) — jenis training
- `organizer` (String) — penyelenggara training
- `startDate`, `endDate` (DateTime)
- `durationHours` (Int)
- `cost` (Decimal) — biaya training
- `status` (Enum: PLANNING, ONGOING, COMPLETED, CANCELLED)
- `roomId` (FK → Room)

### `TrainingPreparation` — checklist persiapan training
- `id` (String, PK)
- `trainingId` (FK → Training)
- `activityName` (String) — mis. "Pemilihan Instruktur"
- `category` (String) — mis. "Sosialisasi", "Administrasi"
- `dueDate` (DateTime)
- `priority` (Enum: URGENT, IMPORTANT, NORMAL)
- `pic` (String) — penanggung jawab
- `team` (String) — divisi terkait
- `isCompleted` (Boolean)
- `progress` (String/Int) — persentase progres
- `linkOutput` (String) — link dokumen output
- `notes` (Text)

### `TrainingParticipant` — peserta training
- `id` (String, PK)
- `trainingId` (FK → Training)
- `employeeId` (FK → Employee)
- `trainingDate` (DateTime) — tanggal pelaksanaan
- `attendedHours` (Int) — jam training yang diikuti

### `License` — lisensi/sertifikasi
- `id` (String, PK)
- `name` (String) — nama lisensi
- `licenseNumber` (String, nullable) — nomor lisensi
- `type` (Enum: COMPANY, INDIVIDUAL)
- `category` (String) — jenis lisensi (mis. K3, ISO, Sertifikasi Profesi)
- `issuedDate`, `expiryDate` (DateTime)
- `employeeId` (FK → Employee, nullable jika lisensi perusahaan)
- `status` (Enum: ACTIVE, EXPIRING_SOON, EXPIRED)

### `Budget` — anggaran training
- `id` (String, PK)
- `trainingId` (FK → Training)
- `budgetYear` (Int) — tahun anggaran (mis. 2026)
- `budgetMonth` (Int) — bulan (1-12)
- `trainingType` (String) — jenis anggaran (mis. Mandatori, Non-Mandatori, Magang, Honor Pelatih)
- `plannedAmount` (Decimal)
- `actualAmount` (Decimal)
- `approvalStatus` (Enum: DISETUJUI, MENUNGGU_PERSETUJUAN)
- `status` (Enum: LUNAS, BELUM_DIBAYAR, JATUH_TEMPO)
- `dueDate` (DateTime)

### `Payment` — tagihan & realisasi biaya (Invoice)
- `id` (String, PK)
- `trainingId` (FK → Training) — nama training
- `organizer` (String) — nama penyelenggara
- `invoiceDate` (DateTime) — tanggal invoice
- `amount` (Decimal) — realisasi biaya
- `dueDate` (DateTime) — tanggal jatuh tempo
- `paymentDate` (DateTime, nullable) — tanggal lunas
- `status` (Enum: PAID, UNPAID, OVERDUE)
- `description` (String)

### `Room` — data ruangan
- `id` (String, PK)
- `name` (String)
- `capacity` (Int)
- `facilities` (Text) — mis. proyektor, AC, whiteboard
- `ownership` (Enum: INTERNAL, RENTED)
- `location` (String)

### `ImportLog` — riwayat import data
- `id` (String, PK)
- `userId` (FK → User) — yang melakukan import
- `module` (Enum: EMPLOYEE, TRAINING, PARTICIPANT, LICENSE, BUDGET, PAYMENT, ROOM)
- `fileName` (String)
- `totalRows` (Int)
- `successRows` (Int)
- `failedRows` (Int)
- `errorReport` (Text/JSON) — detail baris yang gagal
- `createdAt` (DateTime)

```mermaid
erDiagram
    USER ||--o{ TRAINING : manages
    USER ||--o{ IMPORT_LOG : performs
    EMPLOYEE ||--o{ TRAINING_PARTICIPANT : enrolls
    EMPLOYEE ||--o{ LICENSE : owns
    TRAINING ||--o{ TRAINING_PARTICIPANT : has
    TRAINING ||--o{ TRAINING_PREPARATION : has
    TRAINING ||--|| BUDGET : has
    TRAINING ||--o{ PAYMENT : has
    TRAINING }o--|| ROOM : uses

    USER {
        string id PK
        string email
        string name
        string role
    }
    EMPLOYEE {
        string id PK
        string nik UK
        string name
        string department
        string position
    }
    TRAINING {
        string id PK
        string name
        datetime startDate
        datetime endDate
        int durationHours
        decimal cost
        string status
        string roomId FK
    }
    TRAINING_PREPARATION {
        string id PK
        string trainingId FK
        string activityName
        string category
        datetime dueDate
        string priority
        string pic
        string team
        boolean isCompleted
        string progress
        string linkOutput
    }
    TRAINING_PARTICIPANT {
        string id PK
        string trainingId FK
        string employeeId FK
        datetime trainingDate
        int attendedHours
    }
    LICENSE {
        string id PK
        string name
        string type
        string category
        datetime expiryDate
        string employeeId FK
        string status
    }
    BUDGET {
        string id PK
        string trainingId FK
        int budgetYear
        int budgetMonth
        string trainingType
        decimal plannedAmount
        decimal actualAmount
        string approvalStatus
        string status
        datetime dueDate
    }
    PAYMENT {
        string id PK
        string trainingId FK
        string organizer
        datetime invoiceDate
        decimal amount
        datetime dueDate
        datetime paymentDate
        string status
    }
    ROOM {
        string id PK
        string name
        int capacity
        string facilities
        string ownership
    }
    IMPORT_LOG {
        string id PK
        string userId FK
        string module
        string fileName
        int totalRows
        int successRows
        int failedRows
        datetime createdAt
    }
```

---

## 8. Tech Stack

| Kategori | Teknologi | Alasan |
|---|---|---|
| **Framework** | Next.js (App Router) | Full-stack React framework, SSR, server actions |
| **Styling** | Tailwind CSS (custom theme ias.id) | Utility-first CSS dengan token warna corporate navy + sky blue |
| **UI Components** | shadcn/ui | Komponen modern, accessible, mudah dikustomisasi sesuai brand |
| **Font** | Inter / Plus Jakarta Sans | Modern sans-serif untuk tampilan profesional |
| **ORM** | **Prisma** | Type-safe ORM, migration mudah, sesuai permintaan |
| **Database** | PostgreSQL (production) / SQLite (development) | Relasional, scalable, didukung penuh Prisma |
| **Authentication** | Better Auth | Auth modern dengan dukungan role-based access |
| **Calendar UI** | FullCalendar / react-big-calendar | Komponen kalender siap pakai untuk jadwal training |
| **Charts** | Recharts | Visualisasi data anggaran & ringkasan dashboard (skema navy + sky blue) |
| **Notifikasi** | Resend / Nodemailer + Cron (node-cron) | Pengingat lisensi expired via email |
| **Import Excel/CSV** | **SheetJS (xlsx) + Zod** | Parsing file Excel/CSV + validasi skema per baris |
| **Deployment** | Vercel / Self-hosted (Docker) | Sesuaikan kebutuhan internal perusahaan |
| **Export** | jsPDF + xlsx | Generate laporan PDF dan Excel |