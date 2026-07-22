"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ChevronDown, ChevronRight, X, Pencil, Trash2, MoreHorizontal, Eye, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn, calculateOverallProgress } from "@/lib/utils";
import TrainingPreparationsTable, { type Subtask } from "@/components/training/TrainingPreparationsTable";
import * as XLSX from "xlsx";

interface Training {
  id: string;
  name: string;
  description: string | null;
  jobFamilies: string[];
  classification: string;
  trainingType: string;
  organizer: string;
  room: string;
  startDate: string;
  endDate: string | null;
  duration: string;
  cost: string;
  status: string;
  preparations: Subtask[];
  participants: {
    id: string;
    nik: string;
    name: string;
    department: string;
    trainingDate: string;
    attendedHours: number;
  }[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED": return <Badge variant="success">Completed</Badge>;
    case "PLANNING":  return <Badge variant="warning">Planning</Badge>;
    case "ONGOING":   return <Badge variant="default" className="bg-sky text-surface">Ongoing</Badge>;
    case "CANCELLED": return <Badge variant="danger">Cancelled</Badge>;
    default:          return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  if (type === "MANDATORY")
    return <Badge variant="default" className="bg-navy text-surface">Mandatory</Badge>;
  return <Badge variant="outline" className="text-text-secondary border-text-secondary">Non-Mandatory</Badge>;
}

const emptyForm = {
  name: "", description: "", jobFamilies: "", classification: "", trainingType: "MANDATORY",
  organizer: "", room: "", startDate: "", endDate: "", duration: "", cost: "", status: "PLANNING",
};

export default function TrainingManagementPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const currentYear = new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortField, setSortField] = useState("tanggal");
  const [sortDir, setSortDir] = useState("desc");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/trainings")
      .then((r) => r.json())
      .then((data) => setTrainings(data.trainings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const updateTrainingPreparations = async (trainingId: string, newPreps: Subtask[]) => {
    setTrainings((prev) =>
      prev.map((t) => t.id === trainingId ? { ...t, preparations: newPreps } : t)
    );
    const res = await fetch(`/api/trainings/${trainingId}/preparations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preparations: newPreps }),
    });
    if (res.ok) {
      const { preparations } = await res.json();
      setTrainings((prev) =>
        prev.map((t) => t.id === trainingId ? { ...t, preparations } : t)
      );
    }
  };

  const handleOpenModal = (mode: "add" | "edit" | "delete", training: Training | null = null) => {
    setModalMode(mode);
    if (training) {
      setEditingId(training.id);
      setFormData({
        name: training.name,
        description: training.description ?? "",
        jobFamilies: training.jobFamilies.join(", "),
        classification: training.classification ?? "",
        trainingType: training.trainingType,
        organizer: training.organizer,
        room: training.room,
        startDate: training.startDate ?? "",
        endDate: training.endDate ?? "",
        duration: training.duration,
        cost: training.cost,
        status: training.status,
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    await fetch(`/api/trainings/${editingId}`, { method: "DELETE" });
    setTrainings((prev) => prev.filter((t) => t.id !== editingId));
    setIsModalOpen(false);
    setEditingId(null);
    setSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      jobFamilies: formData.jobFamilies.split(",").map((s) => s.trim()).filter(Boolean),
    };

    if (modalMode === "add") {
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) setTrainings((prev) => [data.training, ...prev]);
    } else if (modalMode === "edit" && editingId) {
      const res = await fetch(`/api/trainings/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setTrainings((prev) => prev.map((t) => t.id === editingId ? data.training : t));
      } else {
        alert("Gagal menyimpan data. Silakan coba lagi.");
      }
    }

    setSaving(false);
    setIsModalOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, filterMonth, filterYear, filterJenis, filterStatus, sortField, sortDir]);

  const filteredTrainings = trainings.filter((t) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!t.name.toLowerCase().includes(term) && !t.organizer.toLowerCase().includes(term)) {
        return false;
      }
    }
    const [year, month] = (t.startDate ?? "").split("-");
    const monthMatch = filterMonth === "all" || month === filterMonth;
    const yearMatch = filterYear === "all" || year === filterYear;
    const jenisMatch = filterJenis === "ALL" || t.trainingType === filterJenis;
    const statusMatch = filterStatus === "ALL" || t.status === filterStatus;
    
    return monthMatch && yearMatch && jenisMatch && statusMatch;
  });

  const STATUS_ORDER: Record<string, number> = { PLANNING: 0, ONGOING: 1, COMPLETED: 2, CANCELLED: 3 };

  const sortedTrainings = [...filteredTrainings].sort((a, b) => {
    let cmp = 0;
    if (sortField === "nama") {
      cmp = a.name.localeCompare(b.name, "id");
    } else if (sortField === "tanggal") {
      cmp = (a.startDate ?? "").localeCompare(b.startDate ?? "");
    } else if (sortField === "status") {
      cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
    } else if (sortField === "klasifikasi") {
      cmp = (a.classification ?? "").localeCompare(b.classification ?? "", "id");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const isSortActive = sortField !== "tanggal" || sortDir !== "desc";

  const totalPages = Math.ceil(sortedTrainings.length / ITEMS_PER_PAGE);
  const paginatedTrainings = sortedTrainings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    if (sortedTrainings.length === 0) {
      alert("Tidak ada data untuk dieksport");
      return;
    }

    // 1. Data Training
    const trainingData = sortedTrainings.map((t, idx) => ({
      "No": idx + 1,
      "ID Training": t.id,
      "Nama Training": t.name,
      "Jenis": t.trainingType === "MANDATORY" ? "Mandatory" : "Non-Mandatory",
      "Penyelenggara": t.organizer,
      "Ruangan": t.room,
      "Tanggal Mulai": t.startDate,
      "Tanggal Selesai": t.endDate || "-",
      "Durasi": t.duration,
      "Biaya": t.cost,
      "Status": t.status,
      "Klasifikasi": t.classification,
      "Job Family": t.jobFamilies.join(", "),
      "Keterangan": t.description || "-"
    }));

    // 2. Data Sub-task
    const subtaskData: any[] = [];
    sortedTrainings.forEach((t) => {
      t.preparations.forEach((p, idx) => {
        subtaskData.push({
          "ID Training": t.id,
          "Nama Training": t.name,
          "No": idx + 1,
          "Sub-task": p.activityName,
          "Kategori": p.category,
          "Tenggat Waktu": p.dueDate,
          "Prioritas": p.priority,
          "PIC": p.pic,
          "Tim": p.team,
          "Progress": p.progress,
          "Link Output": p.linkOutput,
          "Catatan": p.note
        });
      });
    });

    // 3. Data Peserta
    const participantData: any[] = [];
    sortedTrainings.forEach((t) => {
      t.participants?.forEach((p, idx) => {
        participantData.push({
          "ID Training": t.id,
          "Nama Training": t.name,
          "No": idx + 1,
          "NIK": p.nik,
          "Nama Peserta": p.name,
          "Departemen": p.department,
          "Tanggal Training": p.trainingDate,
          "Jam Kehadiran": p.attendedHours
        });
      });
    });

    const wb = XLSX.utils.book_new();

    const wsTraining = XLSX.utils.json_to_sheet(trainingData);
    XLSX.utils.book_append_sheet(wb, wsTraining, "Data Training");

    if (subtaskData.length > 0) {
      const wsSubtask = XLSX.utils.json_to_sheet(subtaskData);
      XLSX.utils.book_append_sheet(wb, wsSubtask, "Sub-task Training");
    }

    if (participantData.length > 0) {
      const wsParticipant = XLSX.utils.json_to_sheet(participantData);
      XLSX.utils.book_append_sheet(wb, wsParticipant, "Peserta Training");
    }

    XLSX.writeFile(wb, "Data_Manajemen_Training.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Training</h2>
          <p className="text-text-secondary">Kelola semua aktivitas dan jadwal training karyawan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            Export
          </Button>
          <Button className="gap-2" onClick={() => handleOpenModal("add")}>
            <Plus className="h-4 w-4" /> Tambah Training
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Cari nama training atau penyelenggara..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative">
          <select
            className="flex h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
            value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
              .map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
              ))}
          </select>
          <select
            className="flex h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">Semua Tahun</option>
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
          <div className="relative">
            <Button
              variant="outline"
              className={cn("gap-2", isSortActive && "border-sky text-sky")}
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
            >
              <ArrowUpDown className="h-4 w-4" /> Urutkan
              {isSortActive && <span className="h-1.5 w-1.5 rounded-full bg-sky" />}
            </Button>

            {isSortOpen && (
              <Card className="absolute right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" /> Urutkan Data
                  </h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsSortOpen(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Urutkan Berdasarkan</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                    >
                      <option value="tanggal">Tanggal Mulai</option>
                      <option value="nama">Nama Training</option>
                      <option value="status">Status</option>
                      <option value="klasifikasi">Klasifikasi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Urutan</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value)}
                    >
                      {sortField === "tanggal" && <>
                        <option value="desc">Terbaru ke Terlama</option>
                        <option value="asc">Terlama ke Terbaru</option>
                      </>}
                      {sortField === "status" && <>
                        <option value="asc">Planning → Cancelled</option>
                        <option value="desc">Cancelled → Planning</option>
                      </>}
                      {(sortField === "nama" || sortField === "klasifikasi") && <>
                        <option value="asc">A → Z</option>
                        <option value="desc">Z → A</option>
                      </>}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setSortField("tanggal"); setSortDir("desc"); }}
                  >
                    Reset
                  </Button>
                  <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsSortOpen(false)}>
                    Terapkan
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="relative">
            <Button variant="outline" className="gap-2" onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}>
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
                    <label className="text-xs font-medium text-text-secondary">Jenis Training</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={filterJenis}
                      onChange={(e) => setFilterJenis(e.target.value)}
                    >
                      <option value="ALL">Semua Jenis</option>
                      <option value="MANDATORY">Mandatory</option>
                      <option value="NON_MANDATORY">Non-Mandatory</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Status Training</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="PLANNING">Planning</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setFilterJenis("ALL"); setFilterStatus("ALL"); }}
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
      </div>

      {/* Data Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-navy" />
              <TableHead className="font-semibold text-navy">Nama Training</TableHead>
              <TableHead className="font-semibold text-navy">Jenis</TableHead>
              <TableHead className="font-semibold text-navy">Klasifikasi</TableHead>
              <TableHead className="font-semibold text-navy">Penyelenggara</TableHead>
              <TableHead className="font-semibold text-navy">Tanggal</TableHead>
              <TableHead className="font-semibold text-navy">Status</TableHead>
              <TableHead className="font-semibold text-navy w-32">Task Progress</TableHead>
              <TableHead className="text-right font-semibold text-navy">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-text-secondary">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : sortedTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-text-secondary">
                  {trainings.length === 0 ? "Belum ada data training." : "Tidak ada data yang sesuai dengan filter."}
                </TableCell>
              </TableRow>
            ) : paginatedTrainings.map((training) => {
              const isExpanded = expandedRows[training.id];
              return (
                <React.Fragment key={training.id}>
                  <TableRow className={cn(isExpanded && "bg-sky-light/5 border-b-0")}>
                    <TableCell className="p-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(training.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sky-light/20 text-navy cursor-pointer transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      <div className="flex flex-col gap-1">
                        <span>{training.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {training.jobFamilies.map((jf, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0 bg-muted/30 text-text-secondary border-border/50">
                              {jf}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(training.trainingType)}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{training.classification || "-"}</TableCell>
                    <TableCell className="text-sm">{training.organizer || "-"}</TableCell>
                    <TableCell className="text-sm">{training.startDate}</TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                          <div 
                            className="h-full bg-success transition-all duration-500 ease-out" 
                            style={{ width: `${calculateOverallProgress(training.preparations)}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-text-secondary w-8 text-right">
                          {calculateOverallProgress(training.preparations)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem asChild>
                            <Link href={`/training/${training.id}`} className="w-full flex items-center gap-2 text-navy cursor-pointer">
                              <Eye className="h-4 w-4" /> Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="w-full flex items-center gap-2 text-navy cursor-pointer"
                            onClick={() => handleOpenModal("edit", training)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                            onClick={() => handleOpenModal("delete", training)}
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-sky-light/5 hover:bg-sky-light/5 border-b">
                      <TableCell colSpan={9} className="p-0 border-b">
                        <div className="bg-background">
                          <TrainingPreparationsTable
                            trainingId={training.id}
                            preparations={training.preparations}
                            onChange={(newPrep) => updateTrainingPreparations(training.id, newPrep)}
                            isNestedView={true}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && sortedTrainings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <p className="text-sm text-text-secondary">
            Menampilkan{" "}
            <span className="font-medium text-navy">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedTrainings.length)}
            </span>{" "}
            dari <span className="font-medium text-navy">{sortedTrainings.length}</span> training
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary text-sm">…</span>
                ) : (
                  <Button
                    key={item}
                    variant={currentPage === item ? "default" : "outline"}
                    size="sm"
                    className={cn("h-8 w-8 p-0", currentPage === item && "bg-navy text-surface")}
                    onClick={() => setCurrentPage(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              »
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy">
                {modalMode === "add" ? "Tambah Training Baru" : modalMode === "edit" ? "Edit Data Training" : "Hapus Training"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {modalMode === "delete" ? (
              <div className="space-y-6">
                <p className="text-text-secondary">
                  Apakah Anda yakin ingin menghapus data training <strong>{formData.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={confirmDelete} disabled={saving} className="bg-danger hover:bg-danger/90 text-white">
                    {saving ? "Menghapus..." : "Hapus Data"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Nama Training</label>
                    <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Aviation Safety Leadership" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Keterangan / Deskripsi</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tuliskan keterangan singkat mengenai training ini..."
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Klasifikasi</label>
                    <Input value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: e.target.value })} placeholder="Contoh: INJ Group, IAS Group, Flagship Program, KPI Corporate" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Job Family (pisahkan dengan koma)</label>
                    <Input value={formData.jobFamilies} onChange={(e) => setFormData({ ...formData, jobFamilies: e.target.value })} placeholder="Contoh: People Management, Aviation Security" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Jenis Training</label>
                    <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.trainingType} onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}>
                      <option value="MANDATORY">Mandatory</option>
                      <option value="NON_MANDATORY">Non-Mandatory</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Penyelenggara</label>
                    <Input required value={formData.organizer} onChange={(e) => setFormData({ ...formData, organizer: e.target.value })} placeholder="Nama Penyelenggara" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Ruangan / Lokasi</label>
                    <Input required value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="Nama Ruangan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tanggal Mulai</label>
                    <Input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tanggal Selesai</label>
                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Durasi</label>
                    <Input required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Contoh: 16 Jam" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Biaya</label>
                    <Input required value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="Contoh: Rp 15.000.000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Status Training</label>
                    <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="PLANNING">Planning</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-sky hover:bg-sky/90 text-surface">
                    {saving ? "Menyimpan..." : modalMode === "add" ? "Simpan Data" : "Update Data"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
