import { Button } from "@/components/ui/button";
import { Bell, User, Lock, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy">Pengaturan</h2>
        <p className="text-text-secondary">Kelola preferensi akun Anda.</p>
      </div>

      <div className="space-y-6">

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
                <p className="text-xs text-text-secondary">3 bulan sebelum masa berlaku habis</p>
              </div>
              <div className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky outline-none ring-offset-2 focus:ring-2 focus:ring-sky">
                <span className="translate-x-2 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform duration-200 ease-in-out"></span>
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
    </div>
  );
}
