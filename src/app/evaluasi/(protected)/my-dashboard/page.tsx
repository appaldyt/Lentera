import { getSession } from "@/actions/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, TrendingUp, MonitorPlay } from "lucide-react";
import { redirect } from "next/navigation";

export default async function MyDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/evaluasi/login");

  // Get user details to get NIK
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user?.nik) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-navy">Dashboard Karyawan</h2>
          <p className="text-text-secondary mt-2">Ringkasan aktivitas pembelajaran Anda.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-text-secondary">
            <p>Akun ini tidak memiliki NIK yang terdaftar, sehingga tidak dapat menampilkan Learning Hours.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get Training Hours (sum of attendedHours)
  const trainingParticipants = await prisma.trainingParticipant.findMany({
    where: { nik: user.nik },
    include: { training: true }
  });
  
  const trainingHours = trainingParticipants.reduce((acc, p) => acc + (p.attendedHours || 0), 0);

  // Get Self Learning Hours
  const selfLearnings = await prisma.selfLearning.findMany({
    where: { nik: user.nik }
  });
  
  const selfLearningHours = selfLearnings.reduce((acc, s) => acc + (s.hours || 0), 0);
  
  const totalLearningHours = trainingHours + selfLearningHours;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-navy">Dashboard Karyawan</h2>
        <p className="text-text-secondary mt-2">Selamat datang, {user.name}! Berikut adalah ringkasan aktivitas pembelajaran Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-navy shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Learning Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-navy">{totalLearningHours} <span className="text-lg font-normal text-text-secondary">Jam</span></div>
            <p className="text-xs text-text-secondary mt-2">Total jam belajar Anda secara keseluruhan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Training Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sky">{trainingHours} <span className="text-lg font-normal text-text-secondary">Jam</span></div>
            <p className="text-xs text-text-secondary mt-2">Total jam kehadiran training kelas/offline</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <MonitorPlay className="h-4 w-4" /> Self-Learning Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">{selfLearningHours} <span className="text-lg font-normal text-text-secondary">Jam</span></div>
            <p className="text-xs text-text-secondary mt-2">Total jam belajar mandiri (LMS / LinkedIn)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy">Riwayat Training (Kelas)</CardTitle>
            <CardDescription>Daftar training yang telah Anda ikuti.</CardDescription>
          </CardHeader>
          <CardContent>
            {trainingParticipants.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-secondary">Belum ada riwayat training.</div>
            ) : (
              <div className="space-y-4">
                {trainingParticipants.map(t => (
                  <div key={t.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-navy text-sm">{t.training?.name || "Unknown Training"}</p>
                      <p className="text-xs text-text-secondary">{new Date(t.trainingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-sm font-semibold bg-sky/10 text-sky px-2 py-1 rounded">
                      {t.attendedHours} Jam
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-navy">Riwayat Self-Learning</CardTitle>
            <CardDescription>Daftar pembelajaran mandiri Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {selfLearnings.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-secondary">Belum ada riwayat self-learning.</div>
            ) : (
              <div className="space-y-4">
                {selfLearnings.map(s => (
                  <div key={s.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-navy text-sm">{s.platform}</p>
                      <p className="text-xs text-text-secondary">Tahun {s.year}</p>
                    </div>
                    <div className="text-sm font-semibold bg-success/10 text-success px-2 py-1 rounded">
                      {s.hours} Jam
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
