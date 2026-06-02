"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ChevronDown, ChevronRight, X, Pencil, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import TrainingPreparationsTable, { type Subtask } from "@/components/training/TrainingPreparationsTable";

interface Training {
  id: string;
  name: string;
  description: string | null;
  jobFamilies: string[];
  trainingType: string;
  organizer: string;
  room: string;
  startDate: string;
  endDate: string | null;
  duration: string;
  cost: string;
  status: string;
  preparations: Subtask[];
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
    return <Badge variant="default" className="bg-navy text-surface">Mandatori</Badge>;
  return <Badge variant="outline" className="text-text-secondary border-text-secondary">Non-Mandatori</Badge>;
}

const emptyForm = {
  name: "", description: "", jobFamilies: "", trainingType: "MANDATORY",
  organizer: "", room: "", startDate: "", endDate: "", duration: "", cost: "", status: "PLANNING",
};

export default function TrainingManagementPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);

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
      const data = await res.json();
      if (res.ok)
        setTrainings((prev) => prev.map((t) => t.id === editingId ? data.training : t));
    }

    setSaving(false);
    setIsModalOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTrainings = trainings.filter((t) => {
    if (filterMonth === "all" && filterYear === "all") return true;
    const [year, month] = (t.startDate ?? "").split("-");
    const monthMatch = filterMonth === "all" || month === filterMonth;
    const yearMatch = filterYear === "all" || year === filterYear;
    return monthMatch && yearMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Training</h2>
          <p className="text-text-secondary">Kelola semua aktivitas dan jadwal training karyawan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">Export</Button>
          <Button className="gap-2" onClick={() => handleOpenModal("add")}>
            <Plus className="h-4 w-4" /> Tambah Training
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari nama training atau penyelenggara..." className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
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
              <TableHead className="font-semibold text-navy">Penyelenggara</TableHead>
              <TableHead className="font-semibold text-navy">Ruangan</TableHead>
              <TableHead className="font-semibold text-navy">Tanggal</TableHead>
              <TableHead className="font-semibold text-navy">Durasi</TableHead>
              <TableHead className="font-semibold text-navy">Biaya</TableHead>
              <TableHead className="font-semibold text-navy">Status</TableHead>
              <TableHead className="text-right font-semibold text-navy">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-text-secondary">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-text-secondary">
                  {trainings.length === 0 ? "Belum ada data training." : "Tidak ada data yang sesuai dengan filter."}
                </TableCell>
              </TableRow>
            ) : filteredTrainings.map((training) => {
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
                    <TableCell>{training.organizer}</TableCell>
                    <TableCell>{training.room}</TableCell>
                    <TableCell>{training.startDate}</TableCell>
                    <TableCell>{training.duration}</TableCell>
                    <TableCell>{training.cost}</TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
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
                      <TableCell colSpan={10} className="p-0 border-b">
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
                    <label className="text-sm font-medium text-text-secondary">Job Family (pisahkan dengan koma)</label>
                    <Input value={formData.jobFamilies} onChange={(e) => setFormData({ ...formData, jobFamilies: e.target.value })} placeholder="Contoh: People Management, Aviation Security" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Jenis Training</label>
                    <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.trainingType} onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}>
                      <option value="MANDATORY">Mandatori</option>
                      <option value="NON_MANDATORY">Non-Mandatori</option>
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
