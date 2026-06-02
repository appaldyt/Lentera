"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, FileSpreadsheet, GraduationCap, ArrowUpRight, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface LearningHoursEntry {
  id: string;
  nik: string;
  name: string;
  department: string;
  year: string;
  totalHours: number;
}

export default function LearningHoursPage() {
  const [allData, setAllData] = useState<LearningHoursEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterColNama, setFilterColNama] = useState("");
  const [filterColDivisi, setFilterColDivisi] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/learning-hours")
      .then((res) => res.json())
      .then((json) => {
        setAllData(json.data ?? []);
      })
      .catch(() => setAllData([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = allData.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNama = emp.name.toLowerCase().includes(filterColNama.toLowerCase());
    const matchesDivisi = emp.department.toLowerCase().includes(filterColDivisi.toLowerCase());
    const matchesYear = filterYear === "all" || emp.year === filterYear;
    
    return matchesSearch && matchesNama && matchesDivisi && matchesYear;
  });

  const totalHours = filteredData.reduce((sum, emp) => sum + emp.totalHours, 0);
  const activeEmployees = filteredData.length;
  const averageHours = activeEmployees > 0 ? (totalHours / activeEmployees).toFixed(1) : "0.0";

  const availableYears = Array.from(new Set(allData.map((d) => d.year))).sort((a, b) => b.localeCompare(a));

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk dieksport");
      return;
    }

    const exportData = filteredData.map((emp, idx) => ({
      "No": idx + 1,
      "NIK": emp.nik,
      "Nama Karyawan": emp.name,
      "Divisi": emp.department,
      "Tahun": emp.year,
      "Total Jam Belajar": emp.totalHours
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Learning Hours");

    XLSX.writeFile(wb, "Rekap_Learning_Hours.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sky" />
            Rekap Learning Hours
          </h2>
          <p className="text-text-secondary">Akumulasi jam pelatihan karyawan berdasarkan rekap kehadiran.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success"
            onClick={handleExport}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Rata-rata Jam Belajar</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{averageHours} Jam</div>
            <p className="text-xs text-text-secondary mt-1">
              Per Karyawan {filterYear !== "all" ? `tahun ${filterYear}` : "keseluruhan"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Karyawan Aktif Training</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">
              {activeEmployees} <span className="text-sm font-normal text-text-secondary">orang</span>
            </div>
            <p className="text-xs text-success mt-1">
              {activeEmployees > 0 ? "100% mengikuti kelas" : "Belum ada data"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Jam Terselenggara</CardTitle>
            <GraduationCap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{totalHours} Jam</div>
            <p className="text-xs text-text-secondary mt-1">Seluruh partisipasi pelatihan</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Cari NIK, Nama, atau Divisi..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
          <Button
            variant="outline"
            className="gap-2 border-border/50 text-text-secondary"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" /> Filter
          </Button>

          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filter Data
                </h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Nama Karyawan</label>
                  <Input 
                    placeholder="Filter by Name..." 
                    className="h-8 text-sm" 
                    value={filterColNama} 
                    onChange={(e) => setFilterColNama(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Divisi</label>
                  <Input 
                    placeholder="Filter by Divisi..." 
                    className="h-8 text-sm" 
                    value={filterColDivisi} 
                    onChange={(e) => setFilterColDivisi(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Tahun</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setFilterColNama(""); setFilterColDivisi(""); setFilterYear("all"); }}
                >
                  Clear
                </Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>
                  Filter Results
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-md shadow-sm bg-surface">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-navy w-[120px]">NIK</TableHead>
              <TableHead className="font-semibold text-navy">Nama Karyawan</TableHead>
              <TableHead className="font-semibold text-navy">Divisi</TableHead>
              <TableHead className="font-semibold text-navy text-center">Tahun</TableHead>
              <TableHead className="font-semibold text-navy text-center">Total Jam Belajar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-text-secondary">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-text-secondary">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-sky-light/5">
                  <TableCell className="font-medium text-navy">{emp.nik}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-background">
                      {emp.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-text-secondary">{emp.year}</TableCell>
                  <TableCell className="text-center font-bold text-navy">
                    {emp.totalHours}{" "}
                    <span className="text-xs font-normal text-text-secondary">Jam</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
