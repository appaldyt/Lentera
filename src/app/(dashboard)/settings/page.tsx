import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Bell, User, Lock, Mail, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy">Pengaturan & Import Data</h2>
        <p className="text-text-secondary">Kelola preferensi akun Anda dan impor data master ke dalam sistem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil & Notifikasi */}
        <div className="md:col-span-1 space-y-6">
          {/* Card Profil */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <User className="h-5 w-5 text-sky" />
                Profil Pengguna
              </CardTitle>
              <CardDescription>Informasi akun admin yang sedang aktif.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nama Lengkap</label>
                <Input defaultValue="Admin HR LENTERA" readOnly className="bg-background text-text-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <Input defaultValue="admin@ias.id" readOnly className="bg-background text-text-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Jabatan / Role</label>
                <Input defaultValue="Super Administrator" readOnly className="bg-background text-text-primary" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-background/50 p-4">
              <Button variant="outline" className="w-full gap-2">
                <Lock className="h-4 w-4" />
                Ubah Password
              </Button>
            </CardFooter>
          </Card>

          {/* Card Notifikasi */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <Bell className="h-5 w-5 text-sky" />
                Preferensi Notifikasi
              </CardTitle>
              <CardDescription>Atur kapan sistem harus memberi peringatan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Peringatan Lisensi</p>
                  <p className="text-xs text-text-secondary">H-30 masa berlaku habis</p>
                </div>
                <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky outline-none ring-offset-2 focus:ring-2 focus:ring-sky">
                  <span className="translate-x-2 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform duration-200 ease-in-out"></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Laporan Mingguan</p>
                  <p className="text-xs text-text-secondary">Ringkasan via Email</p>
                </div>
                <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-border outline-none ring-offset-2 focus:ring-2 focus:ring-sky">
                  <span className="-translate-x-2 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform duration-200 ease-in-out"></span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-background/50 p-4 justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Kolom Kanan: Import Data */}
        <div className="md:col-span-2">
          <Card className="border-border shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-success" />
                Pusat Import Data Master
              </CardTitle>
              <CardDescription>
                Unggah file Excel (.xlsx) atau CSV (.csv) untuk memperbarui data ke dalam database. Pastikan format kolom sesuai dengan template standar sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Pilih Tabel Tujuan Import</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Pilih Jenis Data...</option>
                  <option value="employees">Data Karyawan</option>
                  <option value="trainings">Daftar Pelatihan (Training)</option>
                  <option value="licenses">Data Lisensi & Sertifikasi</option>
                  <option value="rooms">Inventaris Ruangan</option>
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Format tabel berbeda untuk masing-masing jenis data. <a href="#" className="text-sky hover:underline">Unduh Template</a>
                </p>
              </div>

              <div className="mt-4 border-2 border-dashed border-sky-light/50 bg-sky-light/5 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-sky-light/10 transition-colors cursor-pointer min-h-[250px]">
                <div className="rounded-full bg-sky-light/20 p-4 mb-4">
                  <UploadCloud className="h-8 w-8 text-sky" />
                </div>
                <h3 className="text-base font-medium text-text-primary mb-1">Drag & Drop file Anda di sini</h3>
                <p className="text-sm text-text-secondary mb-4">Mendukung format .xlsx, .xls, dan .csv hingga 10MB</p>
                <Button variant="secondary" className="bg-surface border border-border text-navy hover:bg-background">
                  Pilih File Manual
                </Button>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3 text-sm text-[#B87C00]">
                <Mail className="h-5 w-5 shrink-0" />
                <p>
                  <strong>Perhatian:</strong> Sistem Import Service kami (menggunakan SheetJS) akan memvalidasi baris demi baris secara ketat. Baris yang tidak valid (format tanggal salah atau duplikasi NIK) akan secara otomatis digagalkan dan sistem akan menghasilkan file <em>Error Report</em> Excel untuk Anda unduh.
                </p>
              </div>

            </CardContent>
            <CardFooter className="border-t border-border bg-background/50 p-4 justify-between">
              <Button variant="outline" className="text-text-secondary">
                Batalkan
              </Button>
              <Button className="bg-success hover:bg-success/90 text-surface font-semibold px-8">
                Mulai Proses Import
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
