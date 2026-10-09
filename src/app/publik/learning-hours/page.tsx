"use client";

import React, { useState, useEffect } from "react";
import { Lock, Search, Users, Clock, AlertCircle, Activity, BookOpen, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function PublicDashboard() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartTopLimit, setChartTopLimit] = useState(15);

  useEffect(() => {
    const auth = sessionStorage.getItem("public_dashboard_auth");
    if (auth === "true") setIsAuth(true);
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    
    setLoading(true);
    // Mengambil data Training Hours dan Self-Learning Hours sesuai tahun yang dipilih
    Promise.all([
      fetch(`/api/learning-hours?year=${selectedYear}`).then(r => r.json()),
      fetch("/api/self-learning").then(r => r.json())
    ])
      .then(([trainingRes, selfRes]) => {
        const trainingData = trainingRes.data || [];
        // Filter self learning hanya untuk tahun yang dipilih
        const selfData = (selfRes.entries || []).filter((e: any) => e.year === selectedYear);

        const mergedMap: Record<string, any> = {};

        // Proses Data Training
        trainingData.forEach((t: any) => {
          if (t.year === selectedYear) {
            mergedMap[t.nik] = {
              id: t.nik,
              nik: t.nik,
              name: t.name,
              department: t.department,
              bodLevel: t.bodLevel || "-",
              year: selectedYear,
              trainingHours: t.totalHours || 0,
              selfLearningHours: 0,
              totalHours: t.totalHours || 0
            };
          }
        });

        // Proses Data Self-Learning (Gabungkan berdasarkan NIK)
        selfData.forEach((s: any) => {
          if (!mergedMap[s.nik]) {
            mergedMap[s.nik] = {
              id: s.nik,
              nik: s.nik,
              name: s.name,
              department: s.department,
              bodLevel: s.bodLevel || "-",
              year: selectedYear,
              trainingHours: 0,
              selfLearningHours: s.hours || 0,
              totalHours: s.hours || 0
            };
          } else {
            mergedMap[s.nik].selfLearningHours += (s.hours || 0);
            mergedMap[s.nik].totalHours += (s.hours || 0);
            if (mergedMap[s.nik].bodLevel === "-" && s.bodLevel) {
               mergedMap[s.nik].bodLevel = s.bodLevel;
            }
          }
        });

        setAllData(Object.values(mergedMap));
        setLoading(false);
      })
      .catch(() => {
        setAllData([]);
        setLoading(false);
      });
  }, [isAuth, selectedYear]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === "IAS@2024") {
      sessionStorage.setItem("public_dashboard_auth", "true");
      setIsAuth(true);
      setError("");
    } else {
      setError("Sandi akses salah!");
    }
  }
  
  if (!isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-navy">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky via-navy to-navy"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-none z-10 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pt-8">
             <div className="mx-auto w-16 h-16 bg-sky/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-sky/20">
                <Lock className="w-8 h-8 text-sky" />
             </div>
             <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-navy">Public Dashboard</CardTitle>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                  Masukkan sandi akses perusahaan untuk memonitor <br/>Learning Hours Karyawan
                </p>
             </div>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-4 h-4"/> {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Input 
                  type="password" 
                  placeholder="Sandi Akses" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-center text-lg tracking-widest border-border/60 focus:border-sky/50 focus:ring-sky/20 transition-all"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-navy hover:bg-navy/90 text-white font-semibold shadow-lg shadow-navy/20 transition-all">
                Buka Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Kalkulasi Statistik
  const totalEmployees = allData.length;
  const sumTraining = allData.reduce((acc, curr) => acc + curr.trainingHours, 0);
  const sumSelfLearning = allData.reduce((acc, curr) => acc + curr.selfLearningHours, 0);
  const totalHours = sumTraining + sumSelfLearning;
  const avgHours = totalEmployees > 0 ? (totalHours / totalEmployees).toFixed(1) : "0";
  
  // Kalkulasi BOD
  const calcAvg = (employees: any[]) => {
    if (employees.length === 0) return "0.0";
    const total = employees.reduce((acc, curr) => acc + curr.totalHours, 0);
    return (total / employees.length).toFixed(1);
  };

  const bod1Emps = allData.filter(e => e.bodLevel === "BOD-1");
  const bod2Emps = allData.filter(e => e.bodLevel === "BOD-2");
  const bod3Emps = allData.filter(e => e.bodLevel === "BOD-3");
  const bod4Emps = allData.filter(e => e.bodLevel === "BOD-4");

  const bod1to3Emps = [...bod1Emps, ...bod2Emps, ...bod3Emps];
  const bod1to4Emps = [...bod1to3Emps, ...bod4Emps];
  const allBodEmps = allData.filter(e => typeof e.bodLevel === "string" && e.bodLevel.startsWith("BOD"));
  
  // Grouping by department untuk Chart (Top 10)
  const deptMap: Record<string, { training: number, self: number, total: number, count: number }> = {};
  allData.forEach(emp => {
    const dept = emp.department || "Lainnya";
    if (!deptMap[dept]) deptMap[dept] = { training: 0, self: 0, total: 0, count: 0 };
    deptMap[dept].training += emp.trainingHours;
    deptMap[dept].self += emp.selfLearningHours;
    deptMap[dept].total += emp.totalHours;
    deptMap[dept].count += 1;
  });

  const chartData = Object.keys(deptMap).map(key => ({
    name: key,
    "Total Jam": Number((deptMap[key].total / deptMap[key].count).toFixed(1)),
    avgTotal: Number((deptMap[key].total / deptMap[key].count).toFixed(1))
  })).sort((a,b) => b.avgTotal - a.avgTotal).slice(0, chartTopLimit);

  const chartDataBod = [
    { name: "BOD-1", "Total Jam": Number(calcAvg(bod1Emps)) },
    { name: "BOD-2", "Total Jam": Number(calcAvg(bod2Emps)) },
    { name: "BOD-3", "Total Jam": Number(calcAvg(bod3Emps)) },
    { name: "BOD-4", "Total Jam": Number(calcAvg(bod4Emps)) },
  ];

  const filteredData = allData.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.department && e.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const PAGE_SIZE = 10;
  const sortedData = [...filteredData].sort((a,b) => b.totalHours - a.totalHours);
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Deret tahun untuk filter (dari 2023 s.d. 2030)
  const availableYears = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-navy px-8 py-10 text-white mb-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
           <Activity className="w-96 h-96 -mt-10 -mr-10 text-white" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between relative z-10 gap-6">
          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-sky-light border-white/10 px-3 py-1 font-medium">Visual Publik</Badge>
              <Badge variant="outline" className="bg-sky/20 hover:bg-sky/30 text-white border-sky/30 px-3 py-1 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Tahun {selectedYear}
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Kalkulasi Jam Belajar</h1>
            <p className="text-sky-light/80 mt-2 text-base max-w-xl">
              Pemantauan penggabungan jam belajar reguler (Training) dan belajar mandiri (Self-Learning) untuk tahun yang dipilih.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium text-sm h-10 pl-4 pr-10 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-sky/50"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="text-navy font-normal">
                    Pilih Tahun: {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur w-fit h-10" onClick={() => {
              sessionStorage.removeItem("public_dashboard_auth");
              setIsAuth(false);
            }}>
               <Lock className="w-4 h-4 mr-2" />
               Kunci & Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Users className="w-7 h-7 text-sky mb-4 opacity-80"/>
              <div className="text-4xl font-bold text-navy">{totalEmployees.toLocaleString()}</div>
              <div className="text-sm font-medium text-text-secondary mt-1 uppercase tracking-wider">Total Karyawan Aktif</div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Activity className="w-7 h-7 text-emerald-500 mb-4 opacity-80"/>
              <div className="text-4xl font-bold text-navy">{totalHours.toLocaleString()} <span className="text-xl text-text-secondary font-medium">jam</span></div>
              <div className="text-sm font-medium text-text-secondary mt-1 uppercase tracking-wider">Total Akumulasi Jam</div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <AlertCircle className="w-7 h-7 text-orange-500 mb-4 opacity-80"/>
              <div className="text-4xl font-bold text-navy">
                {allData.filter(d => d.totalHours === 0).length} 
                <span className="text-xl font-medium text-text-secondary ml-2">
                  ({totalEmployees > 0 ? ((allData.filter(d => d.totalHours === 0).length / totalEmployees)*100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="text-sm font-medium text-text-secondary mt-1 uppercase tracking-wider">Nol Jam Belajar</div>
            </CardContent>
          </Card>
        </div>

        {/* BOD Cards */}
        <div className="space-y-6">
          {/* Card 1: Gabungan BOD */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-navy">Rata-rata Jam Belajar (Gabungan BOD)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* BOD-1 s/d BOD-3 */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-sky text-white rounded-full px-4 py-1 text-xs font-bold mb-3 uppercase">BOD-1 s/d BOD-3</div>
                  <div className="text-3xl font-black text-navy">{calcAvg(bod1to3Emps)}</div>
                  <div className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider font-medium">Jam/Karyawan</div>
                </div>
                {/* BOD-1 s/d BOD-4 */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-sky/80 text-white rounded-full px-4 py-1 text-xs font-bold mb-3 uppercase">BOD-1 s/d BOD-4</div>
                  <div className="text-3xl font-black text-navy">{calcAvg(bod1to4Emps)}</div>
                  <div className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider font-medium">Jam/Karyawan</div>
                </div>
                {/* Seluruh BOD */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-navy text-white rounded-full px-4 py-1 text-xs font-bold mb-3 uppercase">Seluruh BOD</div>
                  <div className="text-3xl font-black text-navy">{calcAvg(allBodEmps)}</div>
                  <div className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider font-medium">Jam/Karyawan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Rata-rata Jam Belajar per Level BOD */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-0 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-navy">Rata-rata Jam Belajar per Level BOD</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-6 px-6">
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataBod} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="Total Jam" fill="#1e40af" radius={[4, 4, 0, 0]} maxBarSize={70} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Title */}
        <div className="mb-4 mt-8">
          <h2 className="text-xl font-extrabold text-navy">Ringkasan per Divisi</h2>
          <p className="text-sm text-text-secondary mt-1">Distribusi jam belajar berdasarkan Divisi unit kerja.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Chart */}
           <Card className="border border-border/50 shadow-sm lg:col-span-2">
             <CardHeader className="pb-4 border-b border-border/40">
               <CardTitle className="text-lg font-bold text-navy mb-4">Rata-rata Total Learning Hours per Divisi</CardTitle>
               <div className="flex flex-row items-center gap-3">
                 <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Semua Divisi</option>
                 </select>
                 <select 
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={chartTopLimit}
                    onChange={(e) => setChartTopLimit(Number(e.target.value))}
                 >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={20}>Top 20</option>
                 </select>
               </div>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="h-[450px] w-full">
                  {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-text-secondary">Memuat grafik...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#e2e8f0" />
                        <XAxis type="number" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={220} tick={{fill: '#334155', fontSize: 11}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}} 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                        />
                        <Bar dataKey="Total Jam" fill="#dfa543" radius={[0, 10, 10, 0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </CardContent>
           </Card>

           {/* Top 10 Employees */}
           <Card className="border border-border/50 shadow-sm">
             <CardHeader className="pb-2 border-b border-border/40 flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">Top 5 Karyawan</CardTitle>
               <Badge variant="outline" className="font-normal text-text-secondary">Tahun {selectedYear}</Badge>
             </CardHeader>
             <CardContent className="pt-6">
                <div className="space-y-5">
                  {loading ? (
                    <div className="text-center text-sm text-text-secondary py-4">Memuat data...</div>
                  ) : allData.length === 0 ? (
                    <div className="text-center text-sm text-text-secondary py-4">Tidak ada data untuk tahun {selectedYear}</div>
                  ) : allData.sort((a,b) => b.totalHours - a.totalHours).slice(0,5).map((emp, i) => (
                    <div key={emp.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shadow-sm
                            ${i === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' : 
                              i === 1 ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' : 
                              i === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 
                              'bg-sky/10 text-sky ring-1 ring-sky/20'}`}>
                            {i+1}
                         </div>
                         <div>
                           <div className="text-sm font-bold text-navy group-hover:text-sky transition-colors">{emp.name}</div>
                           <div className="text-xs text-text-secondary truncate w-[140px] md:w-[180px] lg:w-[120px]">{emp.department}</div>
                         </div>
                      </div>
                      <div className="text-base font-extrabold text-navy">{emp.totalHours} <span className="text-xs font-normal text-text-secondary">jam</span></div>
                    </div>
                  ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Detail Karyawan Table */}
        <Card className="border border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-navy">Kalkulasi Lengkap Karyawan (Tahun {selectedYear})</CardTitle>
              <p className="text-sm text-text-secondary mt-1">Total Jam = (Training Hours) + (Self-Learning Hours).</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
              <Input 
                placeholder="Cari nama, NIK, atau divisi..." 
                className="pl-9 h-9 border-border/60 focus:border-sky/50 bg-white"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b-border/40">
                    <TableHead className="font-bold text-navy px-6 py-4">NIK</TableHead>
                    <TableHead className="font-bold text-navy">Nama Karyawan</TableHead>
                    <TableHead className="font-bold text-navy">Divisi</TableHead>
                    <TableHead className="font-bold text-navy text-center">
                       <div className="flex flex-col items-center">
                          <GraduationCap className="w-4 h-4 mb-1 text-slate-800" />
                          Training Hours
                       </div>
                    </TableHead>
                    <TableHead className="font-bold text-navy text-center">
                       <div className="flex flex-col items-center">
                          <BookOpen className="w-4 h-4 mb-1 text-sky" />
                          Self-Learning
                       </div>
                    </TableHead>
                    <TableHead className="font-bold text-navy text-right px-6 text-lg">Total Jam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow><TableCell colSpan={6} className="text-center h-32 text-text-secondary">Memuat data...</TableCell></TableRow>
                  ) : filteredData.length === 0 ? (
                     <TableRow><TableCell colSpan={6} className="text-center h-32 text-text-secondary">Tidak ada data karyawan ditemukan</TableCell></TableRow>
                  ) : paginatedData.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-slate-50 border-b-border/40 transition-colors">
                      <TableCell className="font-medium text-navy px-6">{emp.nik}</TableCell>
                      <TableCell className="font-semibold text-navy">{emp.name}</TableCell>
                      <TableCell className="text-text-secondary text-sm">{emp.department}</TableCell>
                      <TableCell className="text-center text-sm font-medium text-slate-700 bg-slate-50/50 border-l border-r border-border/30">
                        {emp.trainingHours > 0 ? emp.trainingHours : <span className="text-slate-400">0</span>}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-sky border-r border-border/30">
                        {emp.selfLearningHours > 0 ? emp.selfLearningHours : <span className="text-slate-400">0</span>}
                      </TableCell>
                      <TableCell className="text-right font-black text-navy px-6 text-lg bg-slate-50/50">
                        {emp.totalHours}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 text-xs font-medium text-text-secondary bg-slate-50 border-t border-border/40">
                <span>
                  Menampilkan {Math.min((safePage - 1) * PAGE_SIZE + 1, filteredData.length)}–{Math.min(safePage * PAGE_SIZE, filteredData.length)} dari {filteredData.length} data
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                    className="px-2 py-1 rounded border border-border/40 disabled:opacity-40 hover:bg-slate-200 transition-colors bg-white"
                  >«</button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-2 py-1 rounded border border-border/40 disabled:opacity-40 hover:bg-slate-200 transition-colors bg-white"
                  >‹</button>
                  <span className="px-3 py-1 rounded border border-sky bg-sky text-white font-medium shadow-sm">{safePage}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="px-2 py-1 rounded border border-border/40 disabled:opacity-40 hover:bg-slate-200 transition-colors bg-white"
                  >›</button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                    className="px-2 py-1 rounded border border-border/40 disabled:opacity-40 hover:bg-slate-200 transition-colors bg-white"
                  >»</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
