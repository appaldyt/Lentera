# LENTERA 

**Learning, Evaluation, Needs, Training & Employee Reporting Application**

LENTERA adalah aplikasi web internal perusahaan yang dirancang untuk memonitor dan mengelola seluruh kegiatan training karyawan serta lisensi/sertifikasi yang dimiliki perusahaan secara terpusat.

## ⚠️ Perumusan Masalah

Aplikasi ini dibangun untuk menyelesaikan berbagai permasalahan operasional dan administratif terkait pengelolaan SDM, di antaranya:
- Pencatatan training karyawan masih tersebar (Excel, email, dokumen manual) sehingga sulit dimonitor.
- Tidak ada sistem peringatan dini untuk lisensi/sertifikasi yang akan habis masa berlakunya.
- Anggaran dan pembayaran training sulit dilacak realisasinya.
- Penggunaan ruangan training sering bentrok karena tidak ada sistem booking terpusat.
- Migrasi data historis dari Excel ke aplikasi baru memakan waktu jika harus input manual satu per satu.
- Tidak ada kontrol akses berbasis peran yang memisahkan tanggung jawab pengelolaan sistem.

## 🎯 Tujuan Utama

- Menyediakan satu dashboard terpusat untuk admin memonitor semua training (persiapan, berlangsung, selesai).
- Memastikan tidak ada lisensi perusahaan/karyawan yang expired tanpa terdeteksi.
- Mempermudah perencanaan anggaran dan pelacakan pembayaran training.
- Mengoptimalkan utilisasi ruangan training.
- Mendukung **import data massal** via Excel/CSV agar migrasi & input rutin lebih cepat.
- Menerapkan **Role-Based Access Control (RBAC)** yang ketat dengan tiga tingkatan akses (Super Admin, Admin, dan User).

## ✨ Fitur Utama

- **Dashboard Terpusat:** Ringkasan statistik training, lisensi, anggaran, dan ruangan.
- **Manajemen Training & Kalender:** Perencanaan training lengkap dengan jadwal interaktif (Grid & Gantt Chart).
- **Monitoring Lisensi & Sertifikasi:** Pencatatan komprehensif dengan sistem notifikasi untuk lisensi yang mendekati masa kadaluarsa.
- **Manajemen Karyawan & Learning Hours:** Pelacakan jam belajar karyawan per tahun.
- **Manajemen Anggaran & Biaya:** Perencanaan budget dan pemantauan realisasi (tagihan).
- **Manajemen Ruangan:** Inventaris ruangan dan fasilitas pendukungnya.
- **Role-Based Access Control (RBAC):** Hak akses yang disesuaikan (Super Admin, Admin, User).
- **Import/Export Data:** Integrasi mudah dengan file Excel/CSV.

## 🛠️ Tech Stack

Aplikasi ini dikembangkan menggunakan teknologi web modern:
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 & shadcn/ui
- **ORM:** Prisma 7
- **Database:** PostgreSQL
- **Lainnya:** FullCalendar, Recharts, Zod, SheetJS, dll.

## 🚀 Cara Menjalankan Proyek (Development)

1. Clone repositori ini.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Siapkan file `.env` dan atur variabel environment yang dibutuhkan (Database URL, dll).
4. Jalankan migrasi database:
   ```bash
   npx prisma db push
   ```
5. Jalankan server development:
   ```bash
   npm run dev
   ```
6. Buka aplikasi di [http://localhost:3000](http://localhost:3000).

---
*Dokumentasi PRD lebih lengkap dapat dilihat pada file [PRD-LENTERA.md](./PRD-LENTERA.md).*
