"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, AlertTriangle, CreditCard, ShieldAlert, ShieldCheck, BadgeInfo, FileX, Clock, Wallet, TrendingUp, BookOpen, Bookmark, Filter, CheckCircle2, Percent } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


const COLORS = ['#0B2A4A', '#1E88E5', '#38BDF8', '#7DD3FC', '#E0E6ED'];

interface TrainingItem {
  id: string;
  name: string;
  trainingType: string;
  status: string;
  startDate: string | null;
  jobFamilies: string[];
}

interface LearningHourItem {
  nik: string;
  name: string;
  year: string;
  totalHours: number;
}

interface BudgetItem {
  id: string;
  trainingName: string;
  budgetYear: number;
  budgetMonth: number;
  trainingType: string;
  plannedAmount: number;
  actualAmount: number;
  dueDate: string | null;
  status: string;
  approvalStatus: string;
}

interface AnnualBudget {
  id: string;
  year: number;
  amount: number;
}

interface SelfLearningItem {
  nik: string;
  year: string;
  hours: number;
  platform?: string;
}

interface LicenseItem {
  id: string;
  licenseName: string;
  category: string;
  expiryDate: string | null;
  status: string;
  employee: { nik: string; workLocation: string; lob: string };
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function MetricCard({ title, value, icon: Icon, colorClass, bgClass, borderClass, description, loading }: any) {
  return (
    <Card className={`hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden relative group bg-white`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-text-secondary">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-xl transition-colors ${bgClass} group-hover:bg-opacity-80`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-navy">{loading ? "—" : value}</div>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      </CardContent>
      <Icon className={`absolute -bottom-4 -right-4 h-24 w-24 opacity-[0.03] ${colorClass} group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500 z-0 pointer-events-none`} />
    </Card>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("training");
  const currentYear = new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(currentYear.toString());

  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [learningHours, setLearningHours] = useState<LearningHourItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [selfLearning, setSelfLearning] = useState<SelfLearningItem[]>([]);
  const [annualBudgets, setAnnualBudgets] = useState<AnnualBudget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trainings").then((r) => r.json()),
      fetch("/api/learning-hours").then((r) => r.json()),
      fetch("/api/finance").then((r) => r.json()),
      fetch("/api/licenses").then((r) => r.json()),
      fetch("/api/self-learning").then((r) => r.json()),
      fetch("/api/finance/annual").then((r) => r.json()).catch(() => ({ annualBudgets: [] })),
    ])
      .then(([tJson, lhJson, fJson, licJson, slJson, annualJson]) => {
        setTrainings(tJson.trainings ?? []);
        setLearningHours(lhJson.data ?? []);
        setBudgets(fJson.budgets ?? []);
        setLicenses(licJson.licenses ?? []);
        setSelfLearning(slJson.entries ?? []);
        setAnnualBudgets(annualJson.annualBudgets ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredTrainings = trainings.filter((t) => {
    const yr = t.startDate?.slice(0, 4);
    const mo = t.startDate?.slice(5, 7);
    return (filterYear === "all" || yr === filterYear) && (filterMonth === "all" || mo === filterMonth);
  });

  const filteredLH = learningHours.filter((lh) => filterYear === "all" || lh.year === filterYear);

  const filteredBudgets = budgets.filter(
    (b) =>
      (filterYear === "all" || b.budgetYear.toString() === filterYear) &&
      (filterMonth === "all" || b.budgetMonth.toString().padStart(2, "0") === filterMonth)
  );

  const trainingComplete = filteredTrainings.filter((t) => t.status === "COMPLETED").length;
  const trainingBerjalan = filteredTrainings.filter((t) => t.status === "ONGOING").length;
  const totalMandatory = filteredTrainings.filter((t) => t.trainingType === "MANDATORY").length;
  const nonMandatory = filteredTrainings.filter((t) => t.trainingType === "NON_MANDATORY").length;
  const totalAnggaran = (filteredBudgets.reduce((s, b) => s + b.plannedAmount, 0) / 1_000_000).toFixed(1);
  const anggaranTerpakai = (filteredBudgets.reduce((s, b) => s + b.actualAmount, 0) / 1_000_000).toFixed(1);
  const pesertaTerdaftar = filteredLH.length;
  const totalLearningHours = filteredLH.reduce((s, lh) => s + lh.totalHours, 0);
  const rataRataJamBelajar = pesertaTerdaftar > 0 ? (totalLearningHours / pesertaTerdaftar).toFixed(1) : "0.0";

  const filteredSelfLearning = selfLearning.filter((sl) => filterYear === "all" || sl.year === filterYear);
  const selfLearningNiks = new Set(filteredSelfLearning.map((sl) => sl.nik));
  const pesertaSelfLearning = selfLearningNiks.size;
  const totalSelfLearningHours = filteredSelfLearning.reduce((s, sl) => s + sl.hours, 0);
  const rataRataSelfLearning = pesertaSelfLearning > 0 ? (totalSelfLearningHours / pesertaSelfLearning).toFixed(1) : "0.0";

  // Chart: total training per bulan (year-filtered, all months shown)
  const yearTrainings = filterYear === "all" ? trainings : trainings.filter((t) => t.startDate?.slice(0, 4) === filterYear);
  const trainingPerBulan = MONTH_LABELS.map((name, i) => {
    const mo = String(i + 1).padStart(2, "0");
    return { name, count: yearTrainings.filter((t) => t.startDate?.slice(5, 7) === mo).length };
  });

  // Chart: Pengguna Self Learning per Platform
  const platformUserMap: Record<string, Set<string>> = {};
  filteredSelfLearning.forEach((sl) => {
    const plat = sl.platform || "Lainnya";
    if (!platformUserMap[plat]) platformUserMap[plat] = new Set();
    platformUserMap[plat].add(sl.nik);
  });
  const platformChartData = Object.entries(platformUserMap)
    .map(([name, set]) => ({ name, value: set.size }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Lisensi metrics (Operasional & Akademik) ──────────────────────────────
  const opLicenses = licenses.filter((l) => l.category === "Operasional");
  const totalOp = opLicenses.length;
  const opAktif = opLicenses.filter((l) => l.status !== "EXPIRED").length;
  const opSegeraBerakhir = opLicenses.filter((l) => l.status === "EXPIRING_1_MONTH" || l.status === "EXPIRING_3_MONTHS").length;
  const opExpired = opLicenses.filter((l) => l.status === "EXPIRED").length;
  const opUnique = new Set(opLicenses.filter((l) => l.status !== "EXPIRED").map((l) => l.employee.nik)).size;

  const acLicenses = licenses.filter((l) => l.category === "Akademik");
  const totalAc = acLicenses.length;
  const acAktif = acLicenses.filter((l) => l.status !== "EXPIRED").length;
  const acSegeraBerakhir = acLicenses.filter((l) => l.status === "EXPIRING_1_MONTH" || l.status === "EXPIRING_3_MONTHS").length;
  const acExpired = acLicenses.filter((l) => l.status === "EXPIRED").length;
  const acUnique = new Set(acLicenses.filter((l) => l.status !== "EXPIRED").map((l) => l.employee.nik)).size;

  // Chart: proyeksi kadaluarsa 6 bulan ke depan
  const licenseExpiryProjection = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const yr = String(d.getFullYear()).slice(2);
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const label = `${MONTH_LABELS[d.getMonth()]} ${yr}`;
      const expiring = licenses.filter((l) => l.expiryDate?.startsWith(`${d.getFullYear()}-${mo}`)).length;
      return { month: label, expiring };
    });
  })();

  // Chart: distribusi jenis lisensi (by category)
  const licTypeCounts: Record<string, number> = {};
  licenses.forEach((l) => { licTypeCounts[l.category] = (licTypeCounts[l.category] ?? 0) + 1; });
  const licenseTypeChartData = Object.entries(licTypeCounts).map(([name, value]) => ({ name, value }));

  // Chart: top 5 nama lisensi
  const licNameCounts: Record<string, number> = {};
  licenses.forEach((l) => { licNameCounts[l.licenseName] = (licNameCounts[l.licenseName] ?? 0) + 1; });
  const licenseNameChartData = Object.entries(licNameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Chart: distribusi lokasi kerja
  const locCounts: Record<string, number> = {};
  licenses.forEach((l) => {
    const loc = l.employee.workLocation || "Lainnya";
    locCounts[loc] = (locCounts[loc] ?? 0) + 1;
  });
  const locationChartData = Object.entries(locCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Chart: distribusi LOB
  const lobCounts: Record<string, number> = {};
  licenses.forEach((l) => {
    const lob = l.employee.lob || "Lainnya";
    lobCounts[lob] = (lobCounts[lob] ?? 0) + 1;
  });
  const lobChartData = Object.entries(lobCounts).map(([name, value]) => ({ name, value }));

  // Chart: status masa berlaku
  const masaBerlakuChartData = [
    { label: "Berakhir < 1 Bulan", count: licenses.filter((l) => l.status === "EXPIRING_1_MONTH").length, color: "bg-red-500 text-white" },
    { label: "Berakhir < 3 Bulan", count: licenses.filter((l) => l.status === "EXPIRING_3_MONTHS").length, color: "bg-orange-500 text-white" },
    { label: "Berakhir < 5 Bulan", count: licenses.filter((l) => l.status === "EXPIRING_5_MONTHS").length, color: "bg-yellow-500 text-white" },
  ];

  // ── Finance metrics ───────────────────────────────────────────────────────
  const finBudgetsYTD = budgets.filter((b) => filterYear === "all" || b.budgetYear.toString() === filterYear);
  const finAnnualYTD = annualBudgets.filter((a) => filterYear === "all" || a.year.toString() === filterYear);

  const anggaranIndukAmount = finAnnualYTD.reduce((s, a) => s + a.amount, 0);
  const prognosaAmount = finBudgetsYTD.reduce((s, b) => s + b.plannedAmount, 0);
  const realisasiAmount = finBudgetsYTD.reduce((s, b) => s + b.actualAmount, 0);

  const formatM = (val: number) => (val / 1_000_000).toFixed(1);

  const totalAnggaranInduk = formatM(anggaranIndukAmount);
  const totalPrognosa = formatM(prognosaAmount);
  const totalRealisasi = formatM(realisasiAmount);

  const efisiensiPct = anggaranIndukAmount > 0 
    ? (Math.abs((anggaranIndukAmount - realisasiAmount) / anggaranIndukAmount) * 100).toFixed(1)
    : "0.0";
  const efisiensiPositif = anggaranIndukAmount >= realisasiAmount;

  const sisaPrognosa = formatM(Math.max(0, anggaranIndukAmount - prognosaAmount));
  const sisaRealisasi = formatM(Math.max(0, anggaranIndukAmount - realisasiAmount));

  const tagihanLunas = finBudgetsYTD.filter((b) => b.status === "Lunas");
  const tagihanLunasAmt = formatM(tagihanLunas.reduce((s, b) => s + b.actualAmount, 0));

  const tagihanBelumDibayar = finBudgetsYTD.filter((b) => b.status === "Belum Dibayar");
  const tagihanBelumDibayarAmt = formatM(tagihanBelumDibayar.reduce((s, b) => s + b.actualAmount, 0));

  const tagihanJatuhTempo = finBudgetsYTD.filter((b) => b.status === "Jatuh Tempo");
  const tagihanJatuhTempoAmt = formatM(tagihanJatuhTempo.reduce((s, b) => s + b.actualAmount, 0));

  const budgetPerBulan = MONTH_LABELS.map((name, i) => {
    const mo = i + 1;
    const items = finBudgetsYTD.filter((b) => b.budgetMonth === mo);
    return {
      name,
      planned: parseFloat((items.reduce((s, b) => s + b.plannedAmount, 0) / 1_000_000).toFixed(2)),
      actual: parseFloat((items.reduce((s, b) => s + b.actualAmount, 0) / 1_000_000).toFixed(2)),
    };
  });

  const annualBudgetHistoryData = [...annualBudgets]
    .sort((a, b) => a.year - b.year)
    .map((b) => ({
      year: b.year.toString(),
      amount: parseFloat((b.amount / 1_000_000).toFixed(2)),
    }));

  const jenisCounts: Record<string, number> = {};
  finBudgetsYTD.forEach((b) => {
    const type = b.trainingType || "Lainnya";
    jenisCounts[type] = (jenisCounts[type] ?? 0) + 1;
  });
  const jenisAnggaranChartData = Object.entries(jenisCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Dashboard</h2>
          <p className="text-text-secondary">Ringkasan analitik dan metrik utama aplikasi LENTERA.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="flex h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
          <select 
            className="flex h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">Semua Tahun</option>
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
          <Button variant="outline" className="gap-2 bg-navy text-surface hover:bg-navy/90 hover:text-surface">
            <Filter className="h-4 w-4" />
            Terapkan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="training">Overview Training</TabsTrigger>
          <TabsTrigger value="licenses">Overview Lisensi & Sertifikasi</TabsTrigger>
          <TabsTrigger value="finance">Overview Anggaran & Biaya</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-6 mt-0">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            {/* Baris 1 */}
            <MetricCard
              title="Total Training Complete"
              value={trainingComplete}
              icon={CheckCircle2}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              borderClass="border-emerald-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Training Berjalan"
              value={trainingBerjalan}
              icon={GraduationCap}
              colorClass="text-sky-500"
              bgClass="bg-sky-50"
              borderClass="border-sky-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Total Mandatory"
              value={totalMandatory}
              icon={BookOpen}
              colorClass="text-blue-500"
              bgClass="bg-blue-50"
              borderClass="border-blue-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Non Mandatory"
              value={nonMandatory}
              icon={Bookmark}
              colorClass="text-indigo-500"
              bgClass="bg-indigo-50"
              borderClass="border-indigo-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-6">
            {/* Training Learning Metrics */}
            <MetricCard
              title="Peserta Terdaftar Training"
              value={pesertaTerdaftar}
              icon={Users}
              colorClass="text-sky-500"
              bgClass="bg-sky-50"
              borderClass="border-sky-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Rata-rata Jam Belajar Training"
              value={<>{rataRataJamBelajar} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
              icon={TrendingUp}
              colorClass="text-sky-500"
              bgClass="bg-sky-50"
              borderClass="border-sky-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Total Jam Belajar Training"
              value={<>{totalLearningHours} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
              icon={Clock}
              colorClass="text-sky-500"
              bgClass="bg-sky-50"
              borderClass="border-sky-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />

            {/* Self Learning Metrics */}
            <MetricCard
              title="Peserta Self Learning"
              value={pesertaSelfLearning}
              icon={Users}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              borderClass="border-emerald-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Rata-rata Jam Belajar Self Learning"
              value={<>{rataRataSelfLearning} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
              icon={TrendingUp}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              borderClass="border-emerald-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
            <MetricCard
              title="Total Jam Belajar Self Learning"
              value={<>{totalSelfLearningHours} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
              icon={Clock}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              borderClass="border-emerald-500"
              description="Berdasarkan filter saat ini"
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Total Training per Bulan</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trainingPerBulan}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis dataKey="name" stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "#F5F7FA" }}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                        />
                        <Bar dataKey="count" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Total Training" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pengguna Self Learning (LMS / LinkedIn)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : platformChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Tidak ada data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis dataKey="name" stroke="#5A6B7C" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "#F5F7FA" }}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                        />
                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} name="Total Pengguna" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6 mt-0">
          {/* Summary Cards for Licenses */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            {/* Baris 1: Operasional */}
            <MetricCard
              title="Total Lisensi Operasional"
              value={totalOp.toLocaleString("id-ID")}
              icon={ShieldAlert}
              colorClass="text-indigo-500"
              bgClass="bg-indigo-50"
              description="Semua lisensi tercatat"
              loading={loading}
            />
            <MetricCard
              title="Lisensi Aktif (Operasional)"
              value={opAktif.toLocaleString("id-ID")}
              icon={ShieldCheck}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              description={`Dipegang oleh ${loading ? "—" : opUnique} karyawan`}
              loading={loading}
            />
            <MetricCard
              title="Segera Berakhir (< 3 Bulan)"
              value={opSegeraBerakhir}
              icon={AlertTriangle}
              colorClass="text-amber-500"
              bgClass="bg-amber-50"
              description="Perlu segera diperpanjang"
              loading={loading}
            />
            <MetricCard
              title="Kadaluarsa (Operasional)"
              value={opExpired}
              icon={FileX}
              colorClass="text-rose-500"
              bgClass="bg-rose-50"
              description="Karyawan tidak dapat bertugas"
              loading={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Baris 2: Akademik */}
            <MetricCard
              title="Total Lisensi Akademik"
              value={totalAc.toLocaleString("id-ID")}
              icon={GraduationCap}
              colorClass="text-sky-500"
              bgClass="bg-sky-50"
              description="Sertifikasi pendidikan"
              loading={loading}
            />
            <MetricCard
              title="Lisensi Aktif (Akademik)"
              value={acAktif.toLocaleString("id-ID")}
              icon={ShieldCheck}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              description={`Dipegang oleh ${loading ? "—" : acUnique} karyawan`}
              loading={loading}
            />
            <MetricCard
              title="Segera Berakhir (< 3 Bulan)"
              value={acSegeraBerakhir}
              icon={AlertTriangle}
              colorClass="text-amber-500"
              bgClass="bg-amber-50"
              description="Perlu segera diperpanjang"
              loading={loading}
            />
            <MetricCard
              title="Kadaluarsa (Akademik)"
              value={acExpired}
              icon={FileX}
              colorClass="text-rose-500"
              bgClass="bg-rose-50"
              description="Sertifikasi kadaluarsa"
              loading={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Proyeksi Kadaluarsa Lisensi (6 Bulan Kedepan)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={licenseExpiryProjection}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis dataKey="month" stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip cursor={{ fill: "#F5F7FA" }} contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }} />
                        <Bar dataKey="expiring" fill="#EAB308" radius={[4, 4, 0, 0]} name="Lisensi Berakhir" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Jenis Lisensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={licenseTypeChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {licenseTypeChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED" }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Distribusi Berdasarkan Nama Lisensi (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={licenseNameChartData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E6ED" />
                        <XAxis type="number" stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "#F5F7FA" }} contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }} />
                        <Bar dataKey="count" fill="#1E88E5" radius={[0, 4, 4, 0]} name="Total Lisensi" barSize={32}>
                          {licenseNameChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Lokasi Kerja (Seluruh Cabang)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full overflow-y-auto pr-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <div className="w-full" style={{ height: `${Math.max(locationChartData.length * 36, 300)}px` }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationChartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E6ED" />
                          <XAxis type="number" stroke="#5A6B7C" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="name" stroke="#5A6B7C" fontSize={10} tickLine={false} axisLine={false} width={40} />
                          <Tooltip cursor={{ fill: "#F5F7FA" }} contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }} />
                          <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]} name="Total Lisensi" barSize={16}>
                            {locationChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Line of Business (LOB)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={lobChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {lobChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED" }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Status Masa Berlaku Lisensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-4 h-[300px]">
                  {masaBerlakuChartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border/50 bg-background/50 w-full h-full">
                      <div className={`px-4 py-2 rounded-full font-bold text-sm text-center shadow-sm ${item.color}`}>
                        {item.label}
                      </div>
                      <div className="text-3xl font-black text-navy">{loading ? "—" : item.count}</div>
                      <div className="text-xs text-text-secondary text-center">Lisensi</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard
              title="Anggaran Induk"
              value={`Rp ${totalAnggaranInduk}M`}
              icon={Wallet}
              colorClass="text-indigo-500"
              bgClass="bg-indigo-50"
              description={`Tahun ${filterYear === "all" ? "Semua" : filterYear}`}
              loading={loading}
            />
            <MetricCard
              title="Prognosa"
              value={`Rp ${totalPrognosa}M`}
              icon={TrendingUp}
              colorClass="text-amber-500"
              bgClass="bg-amber-50"
              description={`Sisa anggaran: Rp ${sisaPrognosa}M`}
              loading={loading}
            />
            <MetricCard
              title="Realisasi"
              value={`Rp ${totalRealisasi}M`}
              icon={CheckCircle2}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              description={`Sisa anggaran: Rp ${sisaRealisasi}M`}
              loading={loading}
            />
            <MetricCard
              title="Efisiensi Anggaran"
              value={`${efisiensiPositif ? "+" : "-"}${efisiensiPct}%`}
              icon={Percent}
              colorClass={efisiensiPositif ? "text-emerald-500" : "text-rose-500"}
              bgClass={efisiensiPositif ? "bg-emerald-50" : "bg-rose-50"}
              description={efisiensiPositif ? "Lebih hemat dari anggaran" : "Melebihi anggaran"}
              loading={loading}
            />
          </div>

          {/* Baris 2: Status Tagihan */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <MetricCard
              title="Tagihan Lunas"
              value={`Rp ${tagihanLunasAmt}M`}
              icon={CheckCircle2}
              colorClass="text-emerald-500"
              bgClass="bg-emerald-50"
              description={`${loading ? "—" : tagihanLunas.length} tagihan telah dibayar`}
              loading={loading}
            />
            <MetricCard
              title="Belum Dibayar"
              value={`Rp ${tagihanBelumDibayarAmt}M`}
              icon={Clock}
              colorClass="text-amber-500"
              bgClass="bg-amber-50"
              description={`${loading ? "—" : tagihanBelumDibayar.length} tagihan perlu diproses`}
              loading={loading}
            />
            <MetricCard
              title="Jatuh Tempo"
              value={`Rp ${tagihanJatuhTempoAmt}M`}
              icon={AlertTriangle}
              colorClass="text-rose-500"
              bgClass="bg-rose-50"
              description={`${loading ? "—" : tagihanJatuhTempo.length} tagihan butuh tindakan`}
              loading={loading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Anggaran vs Realisasi per Bulan</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetPerBulan}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis
                          dataKey="name"
                          stroke="#5A6B7C"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#5A6B7C"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}M`}
                        />
                        <Tooltip
                          cursor={{ fill: "#F5F7FA" }}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                          formatter={(value) => [`Rp ${value}M`, undefined]}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                        <Bar dataKey="planned" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Anggaran" />
                        <Bar dataKey="actual" fill="#0B2A4A" radius={[4, 4, 0, 0]} name="Realisasi" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Jenis Anggaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : jenisAnggaranChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Tidak ada data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={jenisAnggaranChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {jenisAnggaranChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Anggaran Induk (Tahunan) */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>History Anggaran Induk Perusahaan (Tahunan)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : annualBudgetHistoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Tidak ada data history anggaran.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={annualBudgetHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis dataKey="year" stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                          formatter={(value) => [`Rp ${value}M`, "Anggaran Induk"]}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#1E88E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Anggaran Induk" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
