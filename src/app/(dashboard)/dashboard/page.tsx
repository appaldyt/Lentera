"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, AlertTriangle, CreditCard, ShieldAlert, ShieldCheck, BadgeInfo, FileX, Clock, Wallet, TrendingUp, BookOpen, Bookmark } from "lucide-react";
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

const budgetData = [
  { name: "Jan", planned: 4000, actual: 2400 },
  { name: "Feb", planned: 3000, actual: 1398 },
  { name: "Mar", planned: 2000, actual: 9800 },
  { name: "Apr", planned: 2780, actual: 3908 },
  { name: "May", planned: 1890, actual: 4800 },
  { name: "Jun", planned: 2390, actual: 3800 },
  { name: "Jul", planned: 3490, actual: 4300 },
];

const participantData = [
  { name: "Jan", count: 120 },
  { name: "Feb", count: 150 },
  { name: "Mar", count: 180 },
  { name: "Apr", count: 140 },
  { name: "May", count: 210 },
  { name: "Jun", count: 250 },
];

const trainingData = [
  { name: "Commercial", value: 40 },
  { name: "Operations", value: 30 },
  { name: "Safety & Quality", value: 20 },
  { name: "Ground Handling", value: 27 },
  { name: "HR", value: 18 },
];

const licenseExpirationData = [
  { month: "Jun 26", expiring: 5 },
  { month: "Jul 26", expiring: 12 },
  { month: "Aug 26", expiring: 3 },
  { month: "Sep 26", expiring: 8 },
  { month: "Oct 26", expiring: 25 },
  { month: "Nov 26", expiring: 10 },
];

const licenseTypeData = [
  { name: "Akademik", value: 450 },
  { name: "Operasional", value: 1002 },
];

const licenseNameData = [
  { name: "AVSEC", count: 450 },
  { name: "AME", count: 320 },
  { name: "Basic Safety", count: 210 },
  { name: "FOO", count: 180 },
  { name: "Lainnya", count: 292 },
];

const locationData = [
  { name: "CGK", count: 650 },
  { name: "SUB", count: 280 },
  { name: "KNO", count: 190 },
  { name: "DPS", count: 145 },
  { name: "UPG", count: 187 },
  { name: "BPN", count: 120 },
  { name: "YIA", count: 110 },
  { name: "SRG", count: 95 },
  { name: "BTH", count: 85 },
  { name: "PLM", count: 70 },
  { name: "PNK", count: 65 },
  { name: "PDG", count: 60 },
  { name: "PKU", count: 55 },
  { name: "BDJ", count: 50 },
  { name: "AMQ", count: 45 },
];

const lobData = [
  { name: "Ground Handling", value: 520 },
  { name: "Cargo & Logistik", value: 350 },
  { name: "Aviation Security", value: 372 },
  { name: "Food", value: 210 },
];

const masaBerlakuData = [
  { label: "Berakhir < 1 Bulan", count: 12, color: "bg-red-500 text-white" },
  { label: "Berakhir < 3 Bulan", count: 48, color: "bg-orange-500 text-white" },
  { label: "Berakhir < 5 Bulan", count: 85, color: "bg-yellow-500 text-white" },
];

const COLORS = ['#0B2A4A', '#1E88E5', '#38BDF8', '#7DD3FC', '#E0E6ED'];
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("training");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  // Aligned mock data from Manajemen Training & Learning Hours
  const mockTrainings = [
    { status: "PLANNING", trainingType: "MANDATORY", month: "06", year: "2026" },
    { status: "ONGOING", trainingType: "NON_MANDATORY", month: "05", year: "2026" },
    { status: "ONGOING", trainingType: "MANDATORY", month: "04", year: "2026" },
    { status: "ONGOING", trainingType: "MANDATORY", month: "05", year: "2026" },
  ];

  const mockBudgets = [
    { actualAmount: 15.0, plannedAmount: 15.0, month: "05", year: "2026" },
    { actualAmount: 0.0, plannedAmount: 5.0, month: "06", year: "2026" },
    { actualAmount: 7.5, plannedAmount: 7.5, month: "04", year: "2026" },
    { actualAmount: 10.0, plannedAmount: 25.0, month: "05", year: "2026" },
  ];

  const learningHoursData = [
    { totalHours: 42, month: "06", year: "2026" },
    { totalHours: 24, month: "05", year: "2026" },
    { totalHours: 48, month: "04", year: "2026" },
    { totalHours: 16, month: "10", year: "2025" },
    { totalHours: 35, month: "05", year: "2026" },
    { totalHours: 8, month: "12", year: "2025" },
  ];

  const filteredTrainings = mockTrainings.filter(t => {
    const mYear = filterYear === "all" || t.year === filterYear;
    const mMonth = filterMonth === "all" || t.month === filterMonth;
    return mYear && mMonth;
  });

  const filteredBudgets = mockBudgets.filter(b => {
    const mYear = filterYear === "all" || b.year === filterYear;
    const mMonth = filterMonth === "all" || b.month === filterMonth;
    return mYear && mMonth;
  });

  const filteredParticipants = learningHoursData.filter(p => {
    const mYear = filterYear === "all" || p.year === filterYear;
    const mMonth = filterMonth === "all" || p.month === filterMonth;
    return mYear && mMonth;
  });

  const trainingBerjalan = filteredTrainings.filter(t => t.status === "ONGOING").length;
  const totalMandatori = filteredTrainings.filter(t => t.trainingType === "MANDATORY").length;
  const nonMandatori = filteredTrainings.filter(t => t.trainingType === "NON_MANDATORY").length;
  const anggaranTerpakai = filteredBudgets.reduce((sum, b) => sum + b.actualAmount, 0).toFixed(1);
  const totalAnggaran = filteredBudgets.reduce((sum, b) => sum + b.plannedAmount, 0).toFixed(1);
  const pesertaTerdaftar = filteredParticipants.length;
  const totalLearningHours = filteredParticipants.reduce((sum, p) => sum + p.totalHours, 0);
  const rataRataJamBelajar = pesertaTerdaftar > 0 ? (totalLearningHours / pesertaTerdaftar).toFixed(1) : "0.0";

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
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
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
                <div className="text-2xl font-bold text-navy">{trainingBerjalan}</div>
                <p className="text-xs text-text-secondary">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Peserta Terdaftar
                </CardTitle>
                <Users className="h-4 w-4 text-sky-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{pesertaTerdaftar}</div>
                <p className="text-xs text-text-secondary">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Anggaran
                </CardTitle>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">Rp {totalAnggaran}M</div>
                <p className="text-xs text-text-secondary">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Anggaran Tercapai
                </CardTitle>
                <CreditCard className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">Rp {anggaranTerpakai}M</div>
                <p className="text-xs text-text-secondary">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            {/* Baris 2: Rata-rata Jam Belajar, Total Learning Hours, Total Mandatori, Non Mandatori */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Rata-rata Jam Belajar
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-sky" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{rataRataJamBelajar} <span className="text-sm font-normal text-text-secondary">Jam</span></div>
                <p className="text-xs text-text-secondary mt-1">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Learning Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{totalLearningHours} <span className="text-sm font-normal text-text-secondary">Jam</span></div>
                <p className="text-xs text-text-secondary mt-1">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Mandatori
                </CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{totalMandatori}</div>
                <p className="text-xs text-text-secondary mt-1">
                  Berdasarkan filter saat ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Non Mandatori
                </CardTitle>
                <Bookmark className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{nonMandatori}</div>
                <p className="text-xs text-text-secondary mt-1">
                  Berdasarkan filter saat ini
                </p>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={participantData}>
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
                      />
                      <Tooltip 
                        cursor={{ fill: '#F5F7FA' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                      />
                      <Bar dataKey="count" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Total Training" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Job Family</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trainingData}>
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
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#1E88E5" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#1E88E5', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#0B2A4A', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total Lisensi Aktif
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">1,452</div>
                <p className="text-xs text-text-secondary">
                  Dipegang oleh 850 karyawan
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Segera Berakhir (&lt; 3 Bulan)
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">48</div>
                <p className="text-xs text-text-secondary">
                  Proses perpanjangan sedang berjalan
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Kadaluwarsa
                </CardTitle>
                <FileX className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger">7</div>
                <p className="text-xs text-text-secondary">
                  Karyawan tidak dapat bertugas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Critical Licenses
                </CardTitle>
                <ShieldAlert className="h-4 w-4 text-navy-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">124</div>
                <p className="text-xs text-text-secondary">
                  Lisensi Mandatory Operasional
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Proyeksi Kadaluwarsa Lisensi (6 Bulan Kedepan)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={licenseExpirationData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                      <XAxis 
                        dataKey="month" 
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
                      />
                      <Tooltip 
                        cursor={{ fill: '#F5F7FA' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                      />
                      <Bar dataKey="expiring" fill="#EAB308" radius={[4, 4, 0, 0]} name="Lisensi Berakhir" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Jenis Lisensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={licenseTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {licenseTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Distribusi Berdasarkan Nama Lisensi (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={licenseNameData} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E6ED" />
                      <XAxis 
                        type="number"
                        stroke="#5A6B7C" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        stroke="#5A6B7C" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#F5F7FA' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                      />
                      <Bar dataKey="count" fill="#1E88E5" radius={[0, 4, 4, 0]} name="Total Lisensi" barSize={32}>
                        {licenseNameData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Lokasi Kerja (Seluruh Cabang)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full overflow-y-auto pr-2">
                  {/* Calculate height dynamically based on number of items so each bar has enough space */}
                  <div className="w-full" style={{ height: `${locationData.length * 36}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E6ED" />
                        <XAxis 
                          type="number"
                          stroke="#5A6B7C" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          type="category"
                          dataKey="name" 
                          stroke="#5A6B7C" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          width={40}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F5F7FA' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                        />
                        <Bar dataKey="count" fill="#38BDF8" radius={[0, 4, 4, 0]} name="Total Lisensi" barSize={16}>
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Line of Business (LOB)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={lobData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {lobData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Status Masa Berlaku Lisensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-4 h-[300px]">
                  {masaBerlakuData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border/50 bg-background/50 w-full h-full justify-center">
                      <div className={`px-4 py-2 rounded-full font-bold text-sm text-center shadow-sm ${item.color}`}>
                        {item.label}
                      </div>
                      <div className="text-3xl font-black text-navy">{item.count}</div>
                      <div className="text-xs text-text-secondary text-center">Karyawan</div>
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
                <div className="text-2xl font-bold text-navy">Rp 52.5M</div>
                <p className="text-xs text-text-secondary">
                  +12% dibanding tahun lalu
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
                <div className="text-2xl font-bold text-navy">Rp 32.5M</div>
                <p className="text-xs text-text-secondary">
                  61.9% dari total anggaran
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Tagihan Jatuh Tempo
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger">Rp 10.0M</div>
                <p className="text-xs text-text-secondary">
                  1 Tagihan perlu tindakan
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
                <div className="text-2xl font-bold text-success">+8.5%</div>
                <p className="text-xs text-text-secondary">
                  Lebih hemat dari estimasi
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Anggaran vs Realisasi (YTD)</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
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
                        tickFormatter={(value) => `Rp${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#F5F7FA' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                      />
                      <Bar dataKey="planned" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Planned" />
                      <Bar dataKey="actual" fill="#0B2A4A" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribusi Jenis Anggaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Mandatori", value: 35 },
                          { name: "Non-Mandatori", value: 25 },
                          { name: "Magang", value: 15 },
                          { name: "Honor Pelatih", value: 25 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: "Mandatori", value: 35 },
                          { name: "Non-Mandatori", value: 25 },
                          { name: "Magang", value: 15 },
                          { name: "Honor Pelatih", value: 25 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
