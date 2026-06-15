"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, AlertTriangle, CreditCard, ShieldAlert, ShieldCheck, BadgeInfo, FileX, Clock, Wallet, TrendingUp, BookOpen, Bookmark, Filter } from "lucide-react";
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

interface LicenseItem {
  id: string;
  licenseName: string;
  category: string;
  expiryDate: string | null;
  status: string;
  employee: { nik: string; workLocation: string; lob: string };
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("training");
  const currentYear = new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(currentYear.toString());

  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [learningHours, setLearningHours] = useState<LearningHourItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trainings").then((r) => r.json()),
      fetch("/api/learning-hours").then((r) => r.json()),
      fetch("/api/finance").then((r) => r.json()),
      fetch("/api/licenses").then((r) => r.json()),
    ])
      .then(([tJson, lhJson, fJson, licJson]) => {
        setTrainings(tJson.trainings ?? []);
        setLearningHours(lhJson.data ?? []);
        setBudgets(fJson.budgets ?? []);
        setLicenses(licJson.licenses ?? []);
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

  const trainingBerjalan = filteredTrainings.filter((t) => t.status === "ONGOING").length;
  const totalMandatory = filteredTrainings.filter((t) => t.trainingType === "MANDATORY").length;
  const nonMandatory = filteredTrainings.filter((t) => t.trainingType === "NON_MANDATORY").length;
  const totalAnggaran = (filteredBudgets.reduce((s, b) => s + b.plannedAmount, 0) / 1_000_000).toFixed(1);
  const anggaranTerpakai = (filteredBudgets.reduce((s, b) => s + b.actualAmount, 0) / 1_000_000).toFixed(1);
  const pesertaTerdaftar = filteredLH.length;
  const totalLearningHours = filteredLH.reduce((s, lh) => s + lh.totalHours, 0);
  const rataRataJamBelajar = pesertaTerdaftar > 0 ? (totalLearningHours / pesertaTerdaftar).toFixed(1) : "0.0";

  // Chart: total training per bulan (year-filtered, all months shown)
  const yearTrainings = filterYear === "all" ? trainings : trainings.filter((t) => t.startDate?.slice(0, 4) === filterYear);
  const trainingPerBulan = MONTH_LABELS.map((name, i) => {
    const mo = String(i + 1).padStart(2, "0");
    return { name, count: yearTrainings.filter((t) => t.startDate?.slice(5, 7) === mo).length };
  });

  // Chart: distribusi job family (from filtered trainings)
  const jobFamilyMap: Record<string, number> = {};
  filteredTrainings.forEach((t) => {
    (t.jobFamilies ?? []).forEach((jf) => {
      jobFamilyMap[jf] = (jobFamilyMap[jf] ?? 0) + 1;
    });
  });
  const jobFamilyChartData = Object.entries(jobFamilyMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Lisensi metrics ──────────────────────────────────────────────────────
  const totalLisensiAktif = licenses.filter((l) => l.status !== "EXPIRED").length;
  const uniqueEmployees = new Set(licenses.filter((l) => l.status !== "EXPIRED").map((l) => l.employee.nik)).size;
  const segeraBerakhir = licenses.filter((l) => l.status === "EXPIRING_1_MONTH" || l.status === "EXPIRING_3_MONTHS").length;
  const totalExpired = licenses.filter((l) => l.status === "EXPIRED").length;
  const criticalLicenses = licenses.filter((l) => l.category === "Operasional").length;

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
  const finPlanned = finBudgetsYTD.reduce((s, b) => s + b.plannedAmount, 0);
  const finActual = finBudgetsYTD.reduce((s, b) => s + b.actualAmount, 0);
  const totalAnggaranFin = (finPlanned / 1_000_000).toFixed(1);
  const totalRealisasiFin = (finActual / 1_000_000).toFixed(1);
  const pctRealisasi = finPlanned > 0 ? ((finActual / finPlanned) * 100).toFixed(1) : "0.0";
  const tagihanBelumLunas = finBudgetsYTD.filter((b) => b.status === "Belum Dibayar" || b.status === "Jatuh Tempo");
  const tagihanJatuhTempoAmt = (tagihanBelumLunas.reduce((s, b) => s + b.actualAmount, 0) / 1_000_000).toFixed(1);
  const efisiensiPct = finPlanned > 0 ? Math.abs(((finPlanned - finActual) / finPlanned) * 100).toFixed(1) : "0.0";
  const efisiensiPositif = finActual <= finPlanned;

  const budgetPerBulan = MONTH_LABELS.map((name, i) => {
    const mo = i + 1;
    const items = finBudgetsYTD.filter((b) => b.budgetMonth === mo);
    return {
      name,
      planned: parseFloat((items.reduce((s, b) => s + b.plannedAmount, 0) / 1_000_000).toFixed(2)),
      actual: parseFloat((items.reduce((s, b) => s + b.actualAmount, 0) / 1_000_000).toFixed(2)),
    };
  });

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Baris 1: Training Berjalan, Peserta Terdaftar, Total Anggaran, Anggaran Tercapai/Terpakai */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Training Berjalan
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-sky" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : trainingBerjalan}</div>
                <p className="text-xs text-text-secondary">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Peserta Terdaftar</CardTitle>
                <Users className="h-4 w-4 text-sky-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : pesertaTerdaftar}</div>
                <p className="text-xs text-text-secondary">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Anggaran</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : `Rp ${totalAnggaran}M`}</div>
                <p className="text-xs text-text-secondary">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Anggaran Tercapai</CardTitle>
                <CreditCard className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : `Rp ${anggaranTerpakai}M`}</div>
                <p className="text-xs text-text-secondary">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            {/* Baris 2 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Rata-rata Jam Belajar</CardTitle>
                <TrendingUp className="h-4 w-4 text-sky" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  {loading ? "—" : <>{rataRataJamBelajar} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
                </div>
                <p className="text-xs text-text-secondary mt-1">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Learning Hours</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">
                  {loading ? "—" : <>{totalLearningHours} <span className="text-sm font-normal text-text-secondary">Jam</span></>}
                </div>
                <p className="text-xs text-text-secondary mt-1">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Mandatory</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : totalMandatory}</div>
                <p className="text-xs text-text-secondary mt-1">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Non Mandatory</CardTitle>
                <Bookmark className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : nonMandatory}</div>
                <p className="text-xs text-text-secondary mt-1">Berdasarkan filter saat ini</p>
              </CardContent>
            </Card>
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
                <CardTitle>Distribusi Job Family</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Memuat data...</div>
                  ) : jobFamilyChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-text-secondary">Tidak ada data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={jobFamilyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                        <XAxis dataKey="name" stroke="#5A6B7C" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A6B7C" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E0E6ED" }} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#1E88E5"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#1E88E5", strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: "#0B2A4A", strokeWidth: 0 }}
                          name="Jumlah Training"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6 mt-0">
          {/* Summary Cards for Licenses */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Lisensi Aktif</CardTitle>
                <ShieldCheck className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : totalLisensiAktif.toLocaleString("id-ID")}</div>
                <p className="text-xs text-text-secondary">Dipegang oleh {loading ? "—" : uniqueEmployees} karyawan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Segera Berakhir (&lt; 3 Bulan)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{loading ? "—" : segeraBerakhir}</div>
                <p className="text-xs text-text-secondary">Perlu segera diperpanjang</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Kadaluarsa</CardTitle>
                <FileX className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger">{loading ? "—" : totalExpired}</div>
                <p className="text-xs text-text-secondary">Karyawan tidak dapat bertugas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">Critical Licenses</CardTitle>
                <ShieldAlert className="h-4 w-4 text-navy-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : criticalLicenses}</div>
                <p className="text-xs text-text-secondary">Lisensi kategori Operasional</p>
              </CardContent>
            </Card>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Anggaran (YTD)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-sky" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : `Rp ${totalAnggaranFin}M`}</div>
                <p className="text-xs text-text-secondary">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Realisasi (YTD)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{loading ? "—" : `Rp ${totalRealisasiFin}M`}</div>
                <p className="text-xs text-text-secondary">
                  {loading ? "—" : `${pctRealisasi}% dari total anggaran`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Tagihan Belum Lunas
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger">{loading ? "—" : `Rp ${tagihanJatuhTempoAmt}M`}</div>
                <p className="text-xs text-text-secondary">
                  {loading ? "—" : `${tagihanBelumLunas.length} tagihan perlu tindakan`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Efisiensi Anggaran
                </CardTitle>
                <BadgeInfo className="h-4 w-4 text-navy-light" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${efisiensiPositif ? "text-success" : "text-danger"}`}>
                  {loading ? "—" : `${efisiensiPositif ? "+" : "-"}${efisiensiPct}%`}
                </div>
                <p className="text-xs text-text-secondary">
                  {efisiensiPositif ? "Lebih hemat dari estimasi" : "Melebihi estimasi anggaran"}
                </p>
              </CardContent>
            </Card>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
