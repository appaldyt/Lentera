"use client";

import React, { useState, useEffect } from "react";
import { Lock, Search, Users, Clock, AlertCircle, Activity, BookOpen, GraduationCap, Calendar, Building2, Layers, Briefcase, Filter, RotateCcw, BarChart2, BarChartHorizontal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from "recharts";

function CustomRotatedTick(props: any) {
  const { x, y, payload } = props;
  const text = String(payload?.value || "");
  const displayText = text.length > 18 ? `${text.substring(0, 16)}...` : text;

  return (
    <g transform={`translate(${x},${y + 4})`}>
      <text
        x={0}
        y={0}
        dx={-4}
        dy={4}
        textAnchor="end"
        fill="#334155"
        fontSize={10}
        fontWeight={500}
        transform="rotate(-40)"
        className="select-none"
      >
        <title>{text}</title>
        {displayText}
      </text>
    </g>
  );
}

function CustomOrgTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-border text-xs space-y-1">
        <p className="font-bold text-navy text-sm">{label || data.name}</p>
        <p className="text-sky font-semibold">
          Rata-rata: <span className="text-navy">{data["Total Jam"]} jam/karyawan</span>
        </p>
        <p className="text-text-secondary">
          Total Akumulasi: <span className="font-medium text-navy">{data.sumHours} jam</span>
        </p>
        <p className="text-text-secondary">
          Jumlah Karyawan: <span className="font-medium text-navy">{data.totalCount} orang</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function PublicDashboard() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [currentPage, setCurrentPage] = useState(1);
  const [divisionChartDirectorate, setDivisionChartDirectorate] = useState("ALL");
  const [divisionChartSelected, setDivisionChartSelected] = useState("ALL");
  const [divisionChartLimit, setDivisionChartLimit] = useState<number | "ALL">(15);
  const [employeeTopLimit, setEmployeeTopLimit] = useState<number>(5);

  // Filter & Top-N Limit States (Opsi 1)
  const [directorateChartLimit, setDirectorateChartLimit] = useState<number | "ALL">(10);
  const [directorateChartType, setDirectorateChartType] = useState<"horizontal" | "vertical">("horizontal");
  const [groupChartLimit, setGroupChartLimit] = useState<number | "ALL">(10);
  const [groupChartDirectorate, setGroupChartDirectorate] = useState("ALL");
  const [tableFilterDirectorate, setTableFilterDirectorate] = useState("ALL");
  const [tableFilterGroup, setTableFilterGroup] = useState("ALL");

  useEffect(() => {
    const auth = sessionStorage.getItem("public_dashboard_auth");
    if (auth === "true") setIsAuth(true);
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    
    setLoading(true);
    // Mengambil data Training Hours, Self-Learning Hours, dan Master Karyawan Aktif dari Manajemen Karyawan
    Promise.all([
      fetch(`/api/learning-hours?year=${selectedYear}`).then(r => r.json()),
      fetch(`/api/self-learning?year=${selectedYear}`).then(r => r.json()),
      fetch("/api/employees").then(r => r.json())
    ])
      .then(([trainingRes, selfRes, empRes]) => {
        const trainingData = trainingRes.data || [];
        const selfData = (selfRes.entries || []).filter((e: any) => !e.year || e.year === selectedYear);
        const employeeList = empRes.employees || [];
        const activeEmployees = employeeList.filter((e: any) => e.isActive !== false);

        const mergedMap: Record<string, any> = {};

        // 1. Inisialisasi dari seluruh karyawan aktif (Master Manajemen Karyawan)
        activeEmployees.forEach((emp: any) => {
          mergedMap[emp.nik] = {
            id: emp.nik,
            nik: emp.nik,
            name: emp.name,
            directorate: emp.directorate || "",
            group: emp.group || "",
            department: emp.division || "-",
            bodLevel: emp.bodLevel || "-",
            year: selectedYear,
            trainingHours: 0,
            selfLearningHours: 0,
            totalHours: 0
          };
        });

        // 2. Proses Data Training (Akumulasi per NIK)
        trainingData.forEach((t: any) => {
          if (t.year === selectedYear) {
            if (mergedMap[t.nik]) {
              mergedMap[t.nik].trainingHours = Number((mergedMap[t.nik].trainingHours + (t.totalHours || 0)).toFixed(1));
              mergedMap[t.nik].totalHours = Number((mergedMap[t.nik].totalHours + (t.totalHours || 0)).toFixed(1));
              if (mergedMap[t.nik].bodLevel === "-" && t.bodLevel) {
                mergedMap[t.nik].bodLevel = t.bodLevel;
              }
            } else if (activeEmployees.length === 0) {
              // Fallback jika master data karyawan kosong
              mergedMap[t.nik] = {
                id: t.nik,
                nik: t.nik,
                name: t.name,
                department: t.department || "-",
                bodLevel: t.bodLevel || "-",
                year: selectedYear,
                trainingHours: Number((t.totalHours || 0).toFixed(1)),
                selfLearningHours: 0,
                totalHours: Number((t.totalHours || 0).toFixed(1))
              };
            }
          }
        });

        // 3. Proses Data Self-Learning (Gabungkan berdasarkan NIK)
        selfData.forEach((s: any) => {
          if (mergedMap[s.nik]) {
            mergedMap[s.nik].selfLearningHours = Number((mergedMap[s.nik].selfLearningHours + (s.hours || 0)).toFixed(1));
            mergedMap[s.nik].totalHours = Number((mergedMap[s.nik].trainingHours + mergedMap[s.nik].selfLearningHours).toFixed(1));
            if (mergedMap[s.nik].bodLevel === "-" && s.bodLevel) {
              mergedMap[s.nik].bodLevel = s.bodLevel;
            }
          } else if (activeEmployees.length === 0) {
            // Fallback jika master data karyawan kosong
            mergedMap[s.nik] = {
              id: s.nik,
              nik: s.nik,
              name: s.name,
              department: s.department || "-",
              bodLevel: s.bodLevel || "-",
              year: selectedYear,
              trainingHours: 0,
              selfLearningHours: Number((s.hours || 0).toFixed(1)),
              totalHours: Number((s.hours || 0).toFixed(1))
            };
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
  const totalHours = Number((sumTraining + sumSelfLearning).toFixed(1));
  const avgHours = totalEmployees > 0 ? (totalHours / totalEmployees).toFixed(1) : "0.0";
  
  // Kalkulasi BOD
  const calcAvg = (employees: any[]) => {
    if (employees.length === 0) return "0.0";
    const total = employees.reduce((acc, curr) => acc + curr.totalHours, 0);
    return (total / employees.length).toFixed(1);
  };
  const calcSum = (employees: any[]) => Number(employees.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1));

  const bod1Emps = allData.filter(e => e.bodLevel === "BOD-1");
  const bod2Emps = allData.filter(e => e.bodLevel === "BOD-2");
  const bod3Emps = allData.filter(e => e.bodLevel === "BOD-3");
  const bod4Emps = allData.filter(e => e.bodLevel === "BOD-4");

  const bod1to3Emps = [...bod1Emps, ...bod2Emps, ...bod3Emps];
  const bod1to4Emps = [...bod1to3Emps, ...bod4Emps];
  const allBodEmps = allData.filter(e => typeof e.bodLevel === "string" && e.bodLevel.startsWith("BOD"));
  
  const chartDataBod = [
    { 
      name: "BOD-1", 
      "Total Jam": Number(calcAvg(bod1Emps)), 
      sumHours: calcSum(bod1Emps), 
      totalCount: bod1Emps.length 
    },
    { 
      name: "BOD-2", 
      "Total Jam": Number(calcAvg(bod2Emps)), 
      sumHours: calcSum(bod2Emps), 
      totalCount: bod2Emps.length 
    },
    { 
      name: "BOD-3", 
      "Total Jam": Number(calcAvg(bod3Emps)), 
      sumHours: calcSum(bod3Emps), 
      totalCount: bod3Emps.length 
    },
    { 
      name: "BOD-4", 
      "Total Jam": Number(calcAvg(bod4Emps)), 
      sumHours: calcSum(bod4Emps), 
      totalCount: bod4Emps.length 
    },
  ];
  
  // 1. Ekstrak daftar unik Direktorat, Group, dan Divisi dinamis dari database (Master Karyawan Aktif)
  const dirSet = new Set<string>();
  const grpSet = new Set<string>();
  const tableGrpSet = new Set<string>();
  const divSet = new Set<string>();
  const availableDivSet = new Set<string>();

  allData.forEach((emp) => {
    if (emp.directorate && emp.directorate.trim() !== "") {
      dirSet.add(emp.directorate.trim());
    }
    if (emp.group && emp.group.trim() !== "") {
      grpSet.add(emp.group.trim());
    }
    if (emp.department && emp.department.trim() !== "" && emp.department.trim() !== "-") {
      divSet.add(emp.department.trim());
      if (divisionChartDirectorate === "ALL" || emp.directorate === divisionChartDirectorate) {
        availableDivSet.add(emp.department.trim());
      }
    }
    if (tableFilterDirectorate === "ALL" || emp.directorate === tableFilterDirectorate) {
      if (emp.group && emp.group.trim() !== "") {
        tableGrpSet.add(emp.group.trim());
      }
    }
  });

  const uniqueDirectorates = Array.from(dirSet).sort();
  const uniqueGroups = Array.from(grpSet).sort();
  const availableTableGroups = Array.from(tableGrpSet).sort();
  const uniqueDivisions = Array.from(divSet).sort();
  const availableDivisions = Array.from(availableDivSet).sort();

  // Grouping by department untuk Chart Divisi (dengan filter Direktorat & Divisi dari database)
  const divisionFilteredEmployees = allData.filter(emp => {
    const matchesDir = divisionChartDirectorate === "ALL" || emp.directorate === divisionChartDirectorate;
    const matchesDiv = divisionChartSelected === "ALL" || emp.department === divisionChartSelected;
    return matchesDir && matchesDiv;
  });

  const deptMap: Record<string, { training: number, self: number, total: number, count: number }> = {};
  divisionFilteredEmployees.forEach(emp => {
    const dept = emp.department || "Lainnya";
    if (!deptMap[dept]) deptMap[dept] = { training: 0, self: 0, total: 0, count: 0 };
    deptMap[dept].training += emp.trainingHours;
    deptMap[dept].self += emp.selfLearningHours;
    deptMap[dept].total += emp.totalHours;
    deptMap[dept].count += 1;
  });

  const rawChartData = Object.keys(deptMap).map(key => ({
    name: key,
    "Total Jam": Number((deptMap[key].total / deptMap[key].count).toFixed(1)),
    avgTotal: Number((deptMap[key].total / deptMap[key].count).toFixed(1)),
    totalCount: deptMap[key].count,
    sumHours: Number(deptMap[key].total.toFixed(1)),
  })).sort((a,b) => b.avgTotal - a.avgTotal);

  const chartData = divisionChartLimit === "ALL"
    ? rawChartData
    : rawChartData.slice(0, divisionChartLimit);

  const divisionChartHeight = Math.max(380, chartData.length * 34 + 50);

  // Grouping by Directorate
  const directorateMap: Record<string, { training: number; self: number; total: number; count: number }> = {};
  allData.forEach(emp => {
    const dir = emp.directorate && emp.directorate.trim() !== "" ? emp.directorate.trim() : "Lainnya";
    if (!directorateMap[dir]) directorateMap[dir] = { training: 0, self: 0, total: 0, count: 0 };
    directorateMap[dir].training += emp.trainingHours;
    directorateMap[dir].self += emp.selfLearningHours;
    directorateMap[dir].total += emp.totalHours;
    directorateMap[dir].count += 1;
  });

  const rawChartDataDirectorate = Object.keys(directorateMap).map(key => ({
    name: key,
    "Total Jam": Number((directorateMap[key].total / directorateMap[key].count).toFixed(1)),
    totalCount: directorateMap[key].count,
    sumHours: Number(directorateMap[key].total.toFixed(1)),
  })).sort((a, b) => b["Total Jam"] - a["Total Jam"]);

  // Opsi 1: Pembatas Top-N untuk Grafik Direktorat
  const chartDataDirectorate = directorateChartLimit === "ALL"
    ? rawChartDataDirectorate
    : rawChartDataDirectorate.slice(0, directorateChartLimit);

  // Grouping by Group (dengan opsi filter Direktorat dinamis dari database)
  const groupFilteredEmployees = groupChartDirectorate === "ALL"
    ? allData
    : allData.filter(emp => emp.directorate === groupChartDirectorate);

  const groupMap: Record<string, { training: number; self: number; total: number; count: number }> = {};
  groupFilteredEmployees.forEach(emp => {
    const grp = emp.group && emp.group.trim() !== "" ? emp.group.trim() : "Lainnya";
    if (!groupMap[grp]) groupMap[grp] = { training: 0, self: 0, total: 0, count: 0 };
    groupMap[grp].training += emp.trainingHours;
    groupMap[grp].self += emp.selfLearningHours;
    groupMap[grp].total += emp.totalHours;
    groupMap[grp].count += 1;
  });

  const rawChartDataGroup = Object.keys(groupMap).map(key => ({
    name: key,
    "Total Jam": Number((groupMap[key].total / groupMap[key].count).toFixed(1)),
    totalCount: groupMap[key].count,
    sumHours: Number(groupMap[key].total.toFixed(1)),
  })).sort((a, b) => b["Total Jam"] - a["Total Jam"]);

  // Opsi 1: Pembatas Top-N untuk Grafik Group
  const chartDataGroup = groupChartLimit === "ALL"
    ? rawChartDataGroup
    : rawChartDataGroup.slice(0, groupChartLimit);

  // Tinggi dinamis grafik agar tetap proporsional dan tidak saling berhimpitan
  const groupChartHeight = Math.max(320, chartDataGroup.length * 36 + 40);
  const directorateChartHeight = directorateChartType === "horizontal"
    ? Math.max(320, chartDataDirectorate.length * 36 + 40)
    : 420;

  // Filter data tabel karyawan (pencarian teks + filter Direktorat & Group dari database)
  const filteredData = allData.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.directorate && e.directorate.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.group && e.group.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDirectorate = tableFilterDirectorate === "ALL" || e.directorate === tableFilterDirectorate;
    const matchesGroup = tableFilterGroup === "ALL" || e.group === tableFilterGroup;

    return matchesSearch && matchesDirectorate && matchesGroup;
  });

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
              <div className="text-4xl font-bold text-navy">{totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xl text-text-secondary font-medium">jam</span></div>
              <div className="text-sm font-medium text-text-secondary mt-1 uppercase tracking-wider">Total Akumulasi Jam</div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <AlertCircle className="w-7 h-7 text-orange-500 mb-4 opacity-80"/>
              <div className="text-4xl font-bold text-navy">
                {allData.filter(d => d.totalHours === 0).length} 
                <span className="text-xl font-medium text-text-secondary ml-2">
                  ({totalEmployees > 0 ? ((allData.filter(d => d.totalHours === 0).length / totalEmployees)*100).toFixed(1) : "0.0"}%)
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
                  <div className="text-[11px] text-slate-500 mt-2 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    Total: {calcSum(bod1to3Emps)} jam • {bod1to3Emps.length} orang
                  </div>
                </div>
                {/* BOD-1 s/d BOD-4 */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-sky/80 text-white rounded-full px-4 py-1 text-xs font-bold mb-3 uppercase">BOD-1 s/d BOD-4</div>
                  <div className="text-3xl font-black text-navy">{calcAvg(bod1to4Emps)}</div>
                  <div className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider font-medium">Jam/Karyawan</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    Total: {calcSum(bod1to4Emps)} jam • {bod1to4Emps.length} orang
                  </div>
                </div>
                {/* Seluruh BOD */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-navy text-white rounded-full px-4 py-1 text-xs font-bold mb-3 uppercase">Seluruh BOD</div>
                  <div className="text-3xl font-black text-navy">{calcAvg(allBodEmps)}</div>
                  <div className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider font-medium">Jam/Karyawan</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    Total: {calcSum(allBodEmps)} jam • {allBodEmps.length} orang
                  </div>
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
                  <BarChart data={chartDataBod} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.15), 10)]} />
                    <Tooltip content={<CustomOrgTooltip />} />
                    <Bar dataKey="Total Jam" fill="#1e40af" radius={[4, 4, 0, 0]} maxBarSize={70}>
                      <LabelList 
                        dataKey="Total Jam" 
                        position="top" 
                        fill="#0f172a" 
                        fontSize={12} 
                        fontWeight={700} 
                        offset={8}
                        formatter={(val: any) => typeof val === "number" ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(val ?? "")}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section: Ringkasan per Direktorat & Group */}
        <div className="mb-4 mt-8">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky" />
            <h2 className="text-xl font-extrabold text-navy">Ringkasan per Direktorat & Group</h2>
          </div>
          <p className="text-sm text-text-secondary mt-1">Distribusi rata-rata jam belajar berdasarkan unit Direktorat dan Group kerja.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Direktorat */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky" />
                    Rata-rata Jam Belajar per Direktorat
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-0.5">Rata-rata jam belajar per karyawan per Direktorat</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle Orientasi Grafik: Horizontal vs Vertikal */}
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-border/60">
                    <button
                      type="button"
                      onClick={() => setDirectorateChartType("horizontal")}
                      className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                        directorateChartType === "horizontal"
                          ? "bg-white text-navy font-bold shadow-sm"
                          : "text-text-secondary hover:text-navy"
                      }`}
                      title="Tampilan Mendatar (Horizontal - Keterangan Sisi Kiri Jelas)"
                    >
                      <BarChartHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectorateChartType("vertical")}
                      className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                        directorateChartType === "vertical"
                          ? "bg-white text-navy font-bold shadow-sm"
                          : "text-text-secondary hover:text-navy"
                      }`}
                      title="Tampilan Tegak (Vertikal - Keterangan Miring Rapi)"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Limit Top-N */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                    <Filter className="w-3.5 h-3.5 text-text-secondary" />
                    <select 
                      value={directorateChartLimit}
                      onChange={(e) => setDirectorateChartLimit(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                      className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer"
                    >
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value="ALL">Semua ({rawChartDataDirectorate.length})</option>
                    </select>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal text-text-secondary bg-slate-50">
                    {chartDataDirectorate.length} Dir
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div style={{ height: `${directorateChartHeight}px` }} className="w-full min-h-[320px] transition-all duration-300">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary">Memuat grafik...</div>
                ) : chartDataDirectorate.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary">Tidak ada data direktorat</div>
                ) : directorateChartType === "horizontal" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataDirectorate} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomOrgTooltip />} />
                      <Bar dataKey="Total Jam" fill="#0B2A4A" radius={[0, 6, 6, 0]} maxBarSize={22}>
                        <LabelList 
                          dataKey="Total Jam" 
                          position="right" 
                          fill="#0f172a" 
                          fontSize={11} 
                          fontWeight={600} 
                          offset={6}
                          formatter={(val: any) => typeof val === "number" ? `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} jam` : String(val ?? "")}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataDirectorate} margin={{ top: 25, right: 15, left: -10, bottom: 95 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={<CustomRotatedTick />} 
                        axisLine={false} 
                        tickLine={false}
                        interval={0}
                        height={95}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 11 }} 
                        axisLine={false} 
                        tickLine={false} 
                        domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.15), 10)]} 
                      />
                      <Tooltip content={<CustomOrgTooltip />} />
                      <Bar dataKey="Total Jam" fill="#0B2A4A" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        <LabelList 
                          dataKey="Total Jam" 
                          position="top" 
                          fill="#0f172a" 
                          fontSize={chartDataDirectorate.length > 8 ? 10 : 11} 
                          fontWeight={700} 
                          offset={6}
                          formatter={(val: any) => typeof val === "number" ? `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}${chartDataDirectorate.length > 8 ? '' : ' jam'}` : String(val ?? "")}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card Group */}
          <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky" />
                    Rata-rata Jam Belajar per Group
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-0.5">Rata-rata jam belajar per karyawan per Group kerja</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Direktorat Dinamis dari Database */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                    <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                    <select
                      value={groupChartDirectorate}
                      onChange={(e) => setGroupChartDirectorate(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer max-w-[130px] truncate"
                      title="Filter berdasarkan Direktorat"
                    >
                      <option value="ALL">Semua Direktorat</option>
                      {uniqueDirectorates.map((dir) => (
                        <option key={dir} value={dir}>{dir}</option>
                      ))}
                    </select>
                  </div>

                  {/* Opsi 1: Filter Limit Top-N */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                    <Filter className="w-3.5 h-3.5 text-text-secondary" />
                    <select 
                      value={groupChartLimit}
                      onChange={(e) => setGroupChartLimit(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                      className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer"
                    >
                      <option value={5}>Top 5</option>
                      <option value={10}>Top 10</option>
                      <option value={15}>Top 15</option>
                      <option value="ALL">Semua ({rawChartDataGroup.length})</option>
                    </select>
                  </div>

                  <Badge variant="outline" className="text-xs font-normal text-text-secondary bg-slate-50">
                    {chartDataGroup.length} Group
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div style={{ height: `${groupChartHeight}px` }} className="w-full min-h-[320px] transition-all duration-300">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary">Memuat grafik...</div>
                ) : chartDataGroup.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-text-secondary">Tidak ada data group</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartDataGroup} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomOrgTooltip />} />
                      <Bar dataKey="Total Jam" fill="#1E88E5" radius={[0, 6, 6, 0]} maxBarSize={22}>
                        <LabelList 
                          dataKey="Total Jam" 
                          position="right" 
                          fill="#0f172a" 
                          fontSize={11} 
                          fontWeight={600} 
                          offset={6}
                          formatter={(val: any) => typeof val === "number" ? `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} jam` : String(val ?? "")}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
           {/* Chart */}
           <Card className="border border-border/50 shadow-sm lg:col-span-2">
             <CardHeader className="pb-4 border-b border-border/40">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <div>
                   <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                     <Briefcase className="w-5 h-5 text-amber-500" />
                     Rata-rata Total Learning Hours per Divisi
                   </CardTitle>
                   <p className="text-xs text-text-secondary mt-0.5">Distribusi rata-rata jam belajar berdasarkan divisi unit kerja</p>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                   {/* Filter Direktorat Dinamis dari Database */}
                   <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                     <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                     <select
                       value={divisionChartDirectorate}
                       onChange={(e) => {
                         setDivisionChartDirectorate(e.target.value);
                         setDivisionChartSelected("ALL");
                       }}
                       className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer max-w-[130px] truncate"
                       title="Filter berdasarkan Direktorat"
                     >
                       <option value="ALL">Semua Direktorat</option>
                       {uniqueDirectorates.map((dir) => (
                         <option key={dir} value={dir}>{dir}</option>
                       ))}
                     </select>
                   </div>

                   {/* Filter Divisi Dinamis dari Database */}
                   <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                     <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
                     <select 
                       value={divisionChartSelected}
                       onChange={(e) => setDivisionChartSelected(e.target.value)}
                       className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer max-w-[140px] truncate"
                       title="Filter Divisi Spesifik"
                     >
                       <option value="ALL">Semua Divisi</option>
                       {availableDivisions.map((dept) => (
                         <option key={dept} value={dept}>{dept}</option>
                       ))}
                     </select>
                   </div>

                   {/* Opsi 1: Filter Limit Top-N */}
                   <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                     <Filter className="w-3.5 h-3.5 text-text-secondary" />
                     <select 
                       value={divisionChartLimit}
                       onChange={(e) => setDivisionChartLimit(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                       className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer"
                     >
                       <option value={5}>Top 5</option>
                       <option value={10}>Top 10</option>
                       <option value={15}>Top 15</option>
                       <option value={20}>Top 20</option>
                       <option value="ALL">Semua ({rawChartData.length})</option>
                     </select>
                   </div>

                   <Badge variant="outline" className="text-xs font-normal text-text-secondary bg-slate-50">
                     {chartData.length} Div
                   </Badge>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="pt-6">
                <div style={{ height: `${divisionChartHeight}px` }} className="w-full min-h-[380px] transition-all duration-300">
                  {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-text-secondary">Memuat grafik...</div>
                  ) : chartData.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-text-secondary">Tidak ada data divisi</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={220} tick={{fill: '#334155', fontSize: 11}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomOrgTooltip />} />
                        <Bar dataKey="Total Jam" fill="#dfa543" radius={[0, 8, 8, 0]} maxBarSize={22}>
                          <LabelList 
                            dataKey="Total Jam" 
                            position="right" 
                            fill="#0f172a" 
                            fontSize={11} 
                            fontWeight={600} 
                            offset={6}
                            formatter={(val: any) => typeof val === "number" ? `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} jam` : String(val ?? "")}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </CardContent>
           </Card>

           {/* Top Employees */}
           <Card className="border border-border/50 shadow-sm flex flex-col">
             <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-amber-500" />
                   Top {employeeTopLimit} Karyawan
                 </CardTitle>
                 <p className="text-xs text-text-secondary mt-0.5">Tahun {selectedYear}</p>
               </div>
               <div className="flex items-center gap-1.5 bg-slate-50 border border-border/80 rounded-lg px-2.5 py-1">
                 <Filter className="w-3.5 h-3.5 text-text-secondary" />
                 <select 
                   value={employeeTopLimit}
                   onChange={(e) => setEmployeeTopLimit(Number(e.target.value))}
                   className="bg-transparent text-xs font-semibold text-navy focus:outline-none cursor-pointer"
                 >
                   <option value={5}>Top 5</option>
                   <option value={10}>Top 10</option>
                   <option value={15}>Top 15</option>
                   <option value={20}>Top 20</option>
                 </select>
               </div>
             </CardHeader>
             <CardContent className="pt-5 pb-5 flex-1">
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="text-center text-sm text-text-secondary py-8">Memuat data...</div>
                  ) : allData.length === 0 ? (
                    <div className="text-center text-sm text-text-secondary py-8">Tidak ada data untuk tahun {selectedYear}</div>
                  ) : allData.sort((a,b) => b.totalHours - a.totalHours).slice(0, employeeTopLimit).map((emp, i) => (
                    <div key={emp.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-sm shrink-0
                            ${i === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' : 
                              i === 1 ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' : 
                              i === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 
                              'bg-sky/10 text-sky ring-1 ring-sky/20'}`}>
                            {i+1}
                         </div>
                         <div className="min-w-0">
                           <div className="text-sm font-bold text-navy group-hover:text-sky transition-colors truncate">{emp.name}</div>
                           <div className="text-xs text-text-secondary truncate">{emp.department || "-"}</div>
                         </div>
                      </div>
                      <div className="text-sm font-extrabold text-navy shrink-0 ml-2">
                        {Number(emp.totalHours).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-text-secondary">jam</span>
                      </div>
                    </div>
                  ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Detail Karyawan Table */}
        <Card className="border border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/20 border-b border-border/40 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-navy">Kalkulasi Lengkap Karyawan (Tahun {selectedYear})</CardTitle>
              <p className="text-sm text-text-secondary mt-1">Total Jam = (Training Hours) + (Self-Learning Hours).</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Filter Direktorat Dinamis dari Database */}
              <div className="relative">
                <select
                  value={tableFilterDirectorate}
                  onChange={(e) => {
                    setTableFilterDirectorate(e.target.value);
                    setTableFilterGroup("ALL");
                    setCurrentPage(1);
                  }}
                  className="appearance-none border border-border/80 rounded-lg pl-3 pr-8 h-9 text-xs bg-white text-navy font-medium focus:outline-none focus:ring-2 focus:ring-sky/40 shadow-sm cursor-pointer min-w-[150px]"
                >
                  <option value="ALL">Semua Direktorat</option>
                  {uniqueDirectorates.map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
                <Building2 className="w-3.5 h-3.5 text-text-secondary pointer-events-none absolute right-2.5 top-3" />
              </div>

              {/* Filter Group Dinamis dari Database */}
              <div className="relative">
                <select
                  value={tableFilterGroup}
                  onChange={(e) => {
                    setTableFilterGroup(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none border border-border/80 rounded-lg pl-3 pr-8 h-9 text-xs bg-white text-navy font-medium focus:outline-none focus:ring-2 focus:ring-sky/40 shadow-sm cursor-pointer min-w-[140px]"
                >
                  <option value="ALL">Semua Group</option>
                  {availableTableGroups.map((grp) => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
                <Layers className="w-3.5 h-3.5 text-text-secondary pointer-events-none absolute right-2.5 top-3" />
              </div>

              {/* Reset Filter Button */}
              {(tableFilterDirectorate !== "ALL" || tableFilterGroup !== "ALL" || searchQuery !== "") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTableFilterDirectorate("ALL");
                    setTableFilterGroup("ALL");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="h-9 px-2 text-xs text-text-secondary hover:text-navy hover:bg-slate-100"
                  title="Reset Filter & Pencarian"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}

              {/* Input Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
                <Input 
                  placeholder="Cari nama, NIK, divisi..." 
                  className="pl-9 h-9 border-border/60 focus:border-sky/50 bg-white text-xs"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b-border/40">
                    <TableHead className="font-bold text-navy px-6 py-4">NIK</TableHead>
                    <TableHead className="font-bold text-navy">Nama Karyawan</TableHead>
                    <TableHead className="font-bold text-navy">Direktorat / Group</TableHead>
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
                     <TableRow><TableCell colSpan={7} className="text-center h-32 text-text-secondary">Memuat data...</TableCell></TableRow>
                  ) : filteredData.length === 0 ? (
                     <TableRow><TableCell colSpan={7} className="text-center h-32 text-text-secondary">Tidak ada data karyawan ditemukan</TableCell></TableRow>
                  ) : paginatedData.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-slate-50 border-b-border/40 transition-colors">
                      <TableCell className="font-medium text-navy px-6">{emp.nik}</TableCell>
                      <TableCell className="font-semibold text-navy">{emp.name}</TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-navy">{emp.directorate || "-"}</div>
                        {emp.group && <div className="text-[11px] text-text-secondary">{emp.group}</div>}
                      </TableCell>
                      <TableCell className="text-text-secondary text-sm">{emp.department}</TableCell>
                      <TableCell className="text-center text-sm font-medium text-slate-700 bg-slate-50/50 border-l border-r border-border/30">
                        {emp.trainingHours > 0 ? Number(emp.trainingHours).toLocaleString(undefined, { maximumFractionDigits: 1 }) : <span className="text-slate-400">0</span>}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-sky border-r border-border/30">
                        {emp.selfLearningHours > 0 ? Number(emp.selfLearningHours).toLocaleString(undefined, { maximumFractionDigits: 1 }) : <span className="text-slate-400">0</span>}
                      </TableCell>
                      <TableCell className="text-right font-black text-navy px-6 text-lg bg-slate-50/50">
                        {Number(emp.totalHours).toLocaleString(undefined, { maximumFractionDigits: 1 })}
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
