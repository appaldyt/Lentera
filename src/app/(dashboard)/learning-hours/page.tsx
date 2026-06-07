"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Filter, FileSpreadsheet, GraduationCap, ArrowUpRight,
  TrendingUp, X, BookOpen, Plus, Edit, Trash2, MoreHorizontal,
  Upload, Download, ChevronRight, CheckCircle2, AlertCircle, FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

// ─── Types ─────────────────────────────────────────────────────────────────

interface LearningHoursEntry {
  id: string;
  nik: string;
  name: string;
  department: string;
  year: string;
  totalHours: number;
}

interface SelfLearningEntry {
  id: string;
  nik: string;
  name: string;
  department: string;
  year: string;
  platform: string;
  hours: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const EMPTY_SELF_FORM: Omit<SelfLearningEntry, "id"> = {
  nik: "", name: "", department: "", year: "", platform: "", hours: 0,
};

const SELF_IMPORT_HEADERS = [
  "NIK", "Nama Karyawan", "Divisi", "Tahun", "Platform", "Total Jam Belajar",
];

interface SelfLearningImportRow {
  nik: string;
  name: string;
  department: string;
  year: string;
  platform: string;
  hours: number;
  _errors: string[];
}

function parseSelfLearningXLSX(buffer: ArrayBuffer): SelfLearningImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
  return rows.map((row) => {
    const nik = String(row["NIK"] ?? "").trim();
    const name = String(row["Nama Karyawan"] ?? "").trim();
    const department = String(row["Divisi"] ?? "").trim();
    const year = String(row["Tahun"] ?? "").trim();
    const platform = String(row["Platform"] ?? "").trim();
    const hours = parseFloat(String(row["Total Jam Belajar"] ?? "")) || 0;
    const VALID_PLATFORMS = ["LMS", "LinkedIn Learning"];
    const errors: string[] = [];
    if (!nik) errors.push("NIK wajib diisi");
    if (!name) errors.push("Nama wajib diisi");
    if (!hours) errors.push("Total Jam Belajar wajib diisi");
    if (platform && !VALID_PLATFORMS.includes(platform)) errors.push(`Platform harus "LMS" atau "LinkedIn Learning"`);
    return { nik, name, department, year, platform, hours, _errors: errors };
  }).filter((row) => row.nik || row.name);
}

function downloadSelfLearningTemplate() {
  const sampleData = [
    { NIK: "IAS-2024-0001", "Nama Karyawan": "Andi Saputra", Divisi: "Operations", Tahun: "2026", Platform: "LMS", "Total Jam Belajar": 8 },
    { NIK: "IAS-2024-0002", "Nama Karyawan": "Budi Santoso", Divisi: "Finance", Tahun: "2026", Platform: "LinkedIn Learning", "Total Jam Belajar": 12 },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData, { header: SELF_IMPORT_HEADERS });
  ws["!cols"] = SELF_IMPORT_HEADERS.map((_, i) => ({ wch: i < 2 ? 24 : 16 }));
  XLSX.utils.book_append_sheet(wb, ws, "Template Self-Learning");
  XLSX.writeFile(wb, "Template_Import_Self_Learning.xlsx");
}

// ─── Self-Learning Modal ─────────────────────────────────────────────────────

function SelfLearningModal({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Omit<SelfLearningEntry, "id"> | null;
  onSave: (data: Omit<SelfLearningEntry, "id">) => Promise<void>;
}) {
  const [data, setData] = useState<Omit<SelfLearningEntry, "id">>(
    initial ?? EMPTY_SELF_FORM
  );

  useEffect(() => {
    setData(initial ?? EMPTY_SELF_FORM);
  }, [initial, open]);

  if (!open) return null;

  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-navy text-base">
            {initial ? "Edit" : "Tambah"} Self-Learning
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-navy transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">NIK</label>
              <Input value={data.nik} onChange={(e) => set({ nik: e.target.value })} placeholder="Contoh: 123456" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nama Karyawan</label>
              <Input value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nama lengkap" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Divisi</label>
              <Input value={data.department} onChange={(e) => set({ department: e.target.value })} placeholder="Contoh: HR & Learning" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tahun</label>
              <Input value={data.year} onChange={(e) => set({ year: e.target.value })} placeholder="Contoh: 2026" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Platform / Sumber</label>
            <select
              value={data.platform}
              onChange={(e) => set({ platform: e.target.value })}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Pilih platform...</option>
              <option value="LMS">LMS</option>
              <option value="LinkedIn Learning">LinkedIn Learning</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Total Jam Belajar (JPL)</label>
            <Input
              type="number"
              min={0}
              value={data.hours || ""}
              onChange={(e) => set({ hours: parseFloat(e.target.value) || 0 })}
              placeholder="Contoh: 8"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
          <Button
            className="flex-1 bg-sky hover:bg-sky/90 text-white"
            onClick={async () => { await onSave(data); onClose(); }}
            disabled={!data.nik || !data.name || !data.hours}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Training Hours Tab ──────────────────────────────────────────────────────

function TrainingHoursTab() {
  const [allData, setAllData] = useState<LearningHoursEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterColNama, setFilterColNama] = useState("");
  const [filterColDivisi, setFilterColDivisi] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch("/api/learning-hours")
      .then((res) => res.json())
      .then((json) => setAllData(json.data ?? []))
      .catch(() => setAllData([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = allData.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      (emp.name.toLowerCase().includes(q) ||
        emp.nik.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)) &&
      emp.name.toLowerCase().includes(filterColNama.toLowerCase()) &&
      emp.department.toLowerCase().includes(filterColDivisi.toLowerCase()) &&
      (filterYear === "all" || emp.year === filterYear)
    );
  });

  const totalHours = filteredData.reduce((s, e) => s + e.totalHours, 0);
  const activeEmployees = filteredData.length;
  const averageHours = activeEmployees > 0 ? (totalHours / activeEmployees).toFixed(1) : "0.0";
  const availableYears = Array.from(new Set(allData.map((d) => d.year))).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    if (filteredData.length === 0) { alert("Tidak ada data untuk dieksport"); return; }
    const exportData = filteredData.map((emp, idx) => ({
      "No": idx + 1, "NIK": emp.nik, "Nama Karyawan": emp.name,
      "Divisi": emp.department, "Tahun": emp.year, "Total Jam Belajar": emp.totalHours,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), "Training Hours");
    XLSX.writeFile(wb, "Rekap_Training_Hours.xlsx");
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Rata-rata Jam Belajar</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{averageHours} Jam</div>
            <p className="text-xs text-text-secondary mt-1">Per karyawan {filterYear !== "all" ? `tahun ${filterYear}` : "keseluruhan"}</p>
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
            <p className="text-xs text-success mt-1">{activeEmployees > 0 ? "100% mengikuti kelas" : "Belum ada data"}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari NIK, Nama, atau Divisi..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
          <Button variant="outline" className="gap-2 border-border/50 text-text-secondary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4" /> Export
          </Button>

          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Data</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Nama Karyawan</label>
                  <Input placeholder="Filter by Name..." className="h-8 text-sm" value={filterColNama} onChange={(e) => { setFilterColNama(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Divisi</label>
                  <Input placeholder="Filter by Divisi..." className="h-8 text-sm" value={filterColDivisi} onChange={(e) => { setFilterColDivisi(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Tahun</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterYear}
                    onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => { setFilterColNama(""); setFilterColDivisi(""); setFilterYear("all"); setCurrentPage(1); }}>Clear</Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>Terapkan</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md shadow-sm bg-surface overflow-hidden">
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
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-text-secondary">Memuat data...</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-text-secondary">Data tidak ditemukan.</TableCell></TableRow>
            ) : (
              paginatedData.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-sky-light/5">
                  <TableCell className="font-medium text-navy">{emp.nik}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-background">{emp.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-text-secondary">{emp.year}</TableCell>
                  <TableCell className="text-center font-bold text-navy">
                    {emp.totalHours} <span className="text-xs font-normal text-text-secondary">Jam</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm text-text-secondary">
            <span>
              Menampilkan {Math.min((safePage - 1) * PAGE_SIZE + 1, filteredData.length)}–{Math.min(safePage * PAGE_SIZE, filteredData.length)} dari {filteredData.length} entri
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >«</button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >‹</button>
              <span className="px-3 py-1 rounded border border-sky bg-sky text-white font-medium">{safePage}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >›</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Self-Learning Hours Tab ─────────────────────────────────────────────────

function SelfLearningTab() {
  const [entries, setEntries] = useState<SelfLearningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SelfLearningEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload");
  const [importRows, setImportRows] = useState<SelfLearningImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] = useState<{ added: number; failed: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch("/api/self-learning")
      .then((r) => r.json())
      .then((json) => setEntries(json.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const availableYears = Array.from(new Set(entries.map((e) => e.year).filter(Boolean))).sort((a, b) => b.localeCompare(a));

  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.name.toLowerCase().includes(q) ||
        e.nik.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)) &&
      (filterYear === "all" || e.year === filterYear)
    );
  });

  const totalHours = filteredEntries.reduce((s, e) => s + e.hours, 0);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEntries = filteredEntries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSave = async (data: Omit<SelfLearningEntry, "id">) => {
    if (editingEntry) {
      const res = await fetch(`/api/self-learning/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { alert(`Gagal menyimpan: ${json.error ?? "Terjadi kesalahan"}`); return; }
      setEntries((prev) => prev.map((e) => e.id === editingEntry.id ? json.entry : e));
    } else {
      const res = await fetch("/api/self-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { alert(`Gagal menyimpan: ${json.error ?? "Terjadi kesalahan"}`); return; }
      setEntries((prev) => [json.entry, ...prev]);
    }
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus entri ini?")) return;
    const res = await fetch(`/api/self-learning/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Gagal menghapus entri"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExport = () => {
    if (filteredEntries.length === 0) { alert("Tidak ada data untuk dieksport"); return; }
    const exportData = filteredEntries.map((e, idx) => ({
      "No": idx + 1, "NIK": e.nik, "Nama Karyawan": e.name,
      "Divisi": e.department, "Tahun": e.year,
      "Platform": e.platform, "Total Jam Belajar": e.hours,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), "Self-Learning Hours");
    XLSX.writeFile(wb, "Rekap_Self_Learning_Hours.xlsx");
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportStep("upload");
    setImportRows([]);
    setImportFileName("");
    setImportResult(null);
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Hanya file .xlsx yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rows = parseSelfLearningXLSX(buffer);
      setImportRows(rows);
      setImportStep("preview");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/self-learning/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: validRows }),
      });
      const json = await res.json();
      const failed = [
        ...importRows.filter((r) => r._errors.length > 0).map((r) => r.nik || r.name),
        ...(json.failed ?? []).map((f: { nik: string }) => f.nik),
      ];
      setImportResult({ added: (json.created ?? []).length, failed });
      // Reload from API to get server-assigned IDs
      const listRes = await fetch("/api/self-learning");
      const listJson = await listRes.json();
      setEntries(listJson.entries ?? []);
      setImportStep("result");
    } catch {
      alert("Terjadi kesalahan saat mengimport data");
    } finally {
      setImporting(false);
    }
  };

  const validImportCount = importRows.filter((r) => r._errors.length === 0).length;
  const invalidImportCount = importRows.filter((r) => r._errors.length > 0).length;

  return (
    <div className="space-y-5">
      <SelfLearningModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEntry(null); }}
        initial={editingEntry ?? null}
        onSave={handleSave}
      />

      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Self-Learning Hours
              </h3>
              <Button variant="ghost" size="icon" onClick={closeImportModal}><X className="h-5 w-5" /></Button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              {([["upload", "Upload File"], ["preview", "Preview Data"], ["result", "Hasil Import"]] as const).map(([step, label], i, arr) => (
                <React.Fragment key={step}>
                  <span className={`font-medium ${importStep === step ? "text-sky" : importStep === "result" || (importStep === "preview" && step === "upload") ? "text-text-secondary" : "text-text-secondary/40"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-text-secondary/40" />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Step 1: Upload ── */}
            {importStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }}
                />
                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors ${isDragging ? "border-sky bg-sky/5" : "border-border hover:border-sky/50 hover:bg-muted/30"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-sky" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-navy">Klik untuk upload atau drag & drop</p>
                    <p className="text-sm text-text-secondary mt-1">Hanya file <strong>.xlsx</strong> yang didukung</p>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-text-secondary space-y-2">
                  <p className="font-medium text-navy text-xs uppercase tracking-wide">Format kolom yang diperlukan:</p>
                  <div className="flex flex-wrap gap-2">
                    {SELF_IMPORT_HEADERS.map((h) => (
                      <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary">Kolom <strong>Platform</strong> hanya menerima nilai: <code className="bg-background border border-border rounded px-1">LMS</code> atau <code className="bg-background border border-border rounded px-1">LinkedIn Learning</code></p>
                </div>

                <Button variant="outline" className="gap-2 w-fit text-sky border-sky/30 hover:bg-sky/5" onClick={downloadSelfLearningTemplate}>
                  <Download className="h-4 w-4" /> Download Template Excel
                </Button>
              </div>
            )}

            {/* ── Step 2: Preview ── */}
            {importStep === "preview" && (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" />{validImportCount} valid</span>
                    {invalidImportCount > 0 && (
                      <span className="flex items-center gap-1 text-destructive font-medium"><AlertCircle className="h-4 w-4" />{invalidImportCount} error</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportStep("upload"); setImportRows([]); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="overflow-auto flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Tahun</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-center">Jam</TableHead>
                        <TableHead className="text-center">Validasi</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, i) => (
                        <TableRow key={i} className={row._errors.length > 0 ? "bg-destructive/5" : ""}>
                          <TableCell className="text-text-secondary text-xs">{i + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{row.nik || <span className="text-destructive italic">kosong</span>}</TableCell>
                          <TableCell className="text-sm">{row.name || <span className="text-destructive italic">kosong</span>}</TableCell>
                          <TableCell className="text-sm text-text-secondary">{row.department || "-"}</TableCell>
                          <TableCell className="text-sm text-center text-text-secondary">{row.year || "-"}</TableCell>
                          <TableCell className="text-sm text-text-secondary">{row.platform || "-"}</TableCell>
                          <TableCell className="text-center font-medium text-navy text-sm">
                            {row.hours > 0 ? row.hours : <span className="text-destructive italic">0</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {row._errors.length === 0
                              ? <Badge className="bg-success/10 text-success border-success/20 text-xs">Valid</Badge>
                              : <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Error</Badge>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-destructive">{row._errors.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {invalidImportCount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Baris dengan error akan dilewati. Hanya <strong>{validImportCount} baris valid</strong> yang akan diimport.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={closeImportModal}>Batal</Button>
                  <Button
                    className="bg-sky hover:bg-sky/90 text-white gap-2"
                    disabled={validImportCount === 0 || importing}
                    onClick={handleConfirmImport}
                  >
                    {importing ? "Mengimport..." : `Import ${validImportCount} Entri`}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Result ── */}
            {importStep === "result" && importResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-success/10">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    <strong className="text-success">{importResult.added} entri</strong> berhasil ditambahkan
                    {importResult.failed.length > 0 && (
                      <>, <strong className="text-destructive">{importResult.failed.length} dilewati</strong> karena error</>
                    )}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-lg px-3 py-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> {importResult.added} Ditambahkan
                  </div>
                  {importResult.failed.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-destructive/10 text-destructive rounded-lg px-3 py-2 font-medium">
                      <AlertCircle className="h-4 w-4" /> {importResult.failed.length} Dilewati
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={closeImportModal}>Tutup</Button>
                  <Button className="bg-sky hover:bg-sky/90 text-white" onClick={() => { closeImportModal(); }}>
                    Selesai
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Entri Self-Learning</CardTitle>
            <BookOpen className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">
              {filteredEntries.length} <span className="text-sm font-normal text-text-secondary">entri</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">Total entri terdaftar</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Jam Mandiri</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{totalHours} Jam</div>
            <p className="text-xs text-text-secondary mt-1">Akumulasi jam self-learning</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Rata-rata per Entri</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">
              {filteredEntries.length > 0 ? (totalHours / filteredEntries.length).toFixed(1) : "0.0"} Jam
            </div>
            <p className="text-xs text-text-secondary mt-1">Per aktivitas belajar mandiri</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari NIK, Nama, atau Judul..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
          <Button variant="outline" className="gap-2 border-border/50 text-text-secondary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success" onClick={handleExport}>
            <FileSpreadsheet className="h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="gap-2 text-sky border-sky/30 hover:bg-sky/5" onClick={() => setIsImportOpen(true)}>
            <FileUp className="h-4 w-4" /> Import
          </Button>
          <Button
            className="gap-2 bg-sky hover:bg-sky/90 text-white"
            onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Tambah
          </Button>

          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Data</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3" /></Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Tahun</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterYear}
                    onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => { setFilterYear("all"); setCurrentPage(1); }}>Clear</Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>Terapkan</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md shadow-sm bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-navy w-[110px]">NIK</TableHead>
              <TableHead className="font-semibold text-navy">Nama Karyawan</TableHead>
              <TableHead className="font-semibold text-navy">Divisi</TableHead>
              <TableHead className="font-semibold text-navy text-center">Tahun</TableHead>
              <TableHead className="font-semibold text-navy">Platform</TableHead>
              <TableHead className="font-semibold text-navy text-center">Total Jam Belajar</TableHead>
              <TableHead className="font-semibold text-navy text-center w-[60px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-text-secondary">Memuat data...</TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-secondary">
                    <BookOpen className="h-8 w-8 opacity-30" />
                    <p className="text-sm">Belum ada data self-learning.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 gap-1.5"
                      onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Entri
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-sky-light/5">
                  <TableCell className="font-medium text-navy font-mono text-sm">{entry.nik}</TableCell>
                  <TableCell className="font-medium text-navy text-sm">{entry.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-background">{entry.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-text-secondary text-sm">{entry.year || "-"}</TableCell>
                  <TableCell className="text-text-secondary text-sm">{entry.platform || "-"}</TableCell>
                  <TableCell className="text-center font-bold text-navy">
                    {entry.hours} <span className="text-xs font-normal text-text-secondary">Jam</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-text-secondary hover:text-navy">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2 text-sm"
                          onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }}
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-sm text-destructive"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-sm text-text-secondary">
            <span>
              Menampilkan {Math.min((safePage - 1) * PAGE_SIZE + 1, filteredEntries.length)}–{Math.min(safePage * PAGE_SIZE, filteredEntries.length)} dari {filteredEntries.length} entri
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >«</button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >‹</button>
              <span className="px-3 py-1 rounded border border-sky bg-sky text-white font-medium">{safePage}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >›</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-2 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LearningHoursPage() {
  const [activeTab, setActiveTab] = useState<"training" | "self">("training");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-sky" />
          Learning Hours
        </h2>
        <p className="text-text-secondary">Kelola jam pelatihan formal dan belajar mandiri karyawan.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 border border-border/50 w-fit">
        <button
          onClick={() => setActiveTab("training")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "training"
              ? "bg-white text-navy shadow-sm"
              : "text-text-secondary hover:text-navy"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          Training Hours
        </button>
        <button
          onClick={() => setActiveTab("self")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "self"
              ? "bg-white text-navy shadow-sm"
              : "text-text-secondary hover:text-navy"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Self-Learning Hours
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "training" ? <TrainingHoursTab /> : <SelfLearningTab />}
    </div>
  );
}
