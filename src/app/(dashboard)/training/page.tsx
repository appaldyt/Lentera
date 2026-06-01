"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ChevronDown, ChevronRight, X, Pencil, Trash2, MoreHorizontal, Eye } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TrainingPreparationsTable from "@/components/training/TrainingPreparationsTable";

const mockTrainings = [
  {
    id: "TR-001",
    name: "Aviation Safety Leadership",
    description: "Pelatihan kepemimpinan dengan fokus pada budaya keselamatan penerbangan dan mitigasi risiko operasional.",
    jobFamilies: ["Safety & Quality", "Leadership"],
    trainingType: "MANDATORY",
    organizer: "Capt. Budi Santoso",
    room: "Auditorium A",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    duration: "16 Jam",
    cost: "Rp 15.000.000",
    status: "PLANNING",
    preparations: [
      { 
        id: "P-101", 
        activityName: "Sosialisasi LMS ke Kantor Pusat", 
        category: "Sosialisasi", 
        dueDate: "2026-05-20", 
        priority: "Urgent", 
        pic: "Alin", 
        team: "PM", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "doc/sosialisasi.pdf",
        note: ""
      },
      { 
        id: "P-102", 
        activityName: "Pembuatan Draft Surat Edaran", 
        category: "Administrasi", 
        dueDate: "2026-05-22", 
        priority: "Important", 
        pic: "Budi", 
        team: "Legal", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "doc/draft_se.pdf" 
      },
      { 
        id: "P-103", 
        activityName: "Pengesahan Surat Edaran", 
        category: "Administrasi", 
        dueDate: "2026-05-25", 
        priority: "Important", 
        pic: "Sinta", 
        team: "PM", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "doc/se_final.pdf" 
      },
      { 
        id: "P-104", 
        activityName: "Monitoring penggunaan LMS", 
        category: "Operasional", 
        dueDate: "2026-06-05", 
        priority: "Important", 
        pic: "Andi", 
        team: "IT", 
        isCompleted: false, 
        progress: "25%", 
        linkOutput: "-" 
      },
    ],
  },
  {
    id: "TR-002",
    name: "Customer Service Excellence",
    description: "Pelatihan untuk meningkatkan kualitas pelayanan kepada pelanggan.",
    jobFamilies: ["Commercial", "Frontline"],
    trainingType: "NON_MANDATORY",
    organizer: "Rina Wijaya",
    room: "Meeting Room 2",
    startDate: "2026-05-28",
    endDate: "2026-05-28",
    duration: "8 Jam",
    cost: "Rp 5.000.000",
    status: "ONGOING",
    preparations: [
      { 
        id: "P-201", 
        activityName: "Pemilihan Instruktur Internal", 
        category: "HR", 
        dueDate: "2026-05-10", 
        priority: "Normal", 
        pic: "Rina", 
        team: "HR", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "doc/instruktur.pdf" 
      },
      { 
        id: "P-202", 
        activityName: "Pemesanan Konsumsi", 
        category: "Logistik", 
        dueDate: "2026-05-26", 
        priority: "Normal", 
        pic: "Deni", 
        team: "GA", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "-" 
      },
      { 
        id: "P-203", 
        activityName: "Cetak Modul Pelatihan", 
        category: "Materi", 
        dueDate: "2026-05-27", 
        priority: "Urgent", 
        pic: "Rina", 
        team: "HR", 
        isCompleted: false, 
        progress: "50%", 
        linkOutput: "-" 
      },
    ],
  },
  {
    id: "TR-003",
    name: "Basic Fire Fighting & Safety",
    description: "Pelatihan dasar pemadaman kebakaran dan keselamatan kerja.",
    jobFamilies: ["Aviation Security", "Operations"],
    trainingType: "MANDATORY",
    organizer: "Hendra Gunawan",
    room: "Training Center B",
    startDate: "2026-05-15",
    endDate: "2026-05-15",
    duration: "8 Jam",
    cost: "Rp 7.500.000",
    status: "COMPLETED",
    preparations: [
      { 
        id: "P-301", 
        activityName: "Koordinasi dengan Dinas Pemadam", 
        category: "Eksternal", 
        dueDate: "2026-05-01", 
        priority: "Important", 
        pic: "Hendra", 
        team: "Safety", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "doc/surat_dinas.pdf" 
      },
      { 
        id: "P-302", 
        activityName: "Penyiapan Alat Peraga (APAR)", 
        category: "Logistik", 
        dueDate: "2026-05-10", 
        priority: "Urgent", 
        pic: "Hendra", 
        team: "Safety", 
        isCompleted: true, 
        progress: "100%", 
        linkOutput: "-" 
      },
    ],
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "PLANNING":
      return <Badge variant="warning">Planning</Badge>;
    case "ONGOING":
      return <Badge variant="default" className="bg-sky text-surface">Ongoing</Badge>;
    case "CANCELLED":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  if (type === "MANDATORY") {
    return <Badge variant="default" className="bg-navy text-surface">Mandatori</Badge>;
  }
  return <Badge variant="outline" className="text-text-secondary border-text-secondary">Non-Mandatori</Badge>;
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Urgent":
      return <Badge variant="danger" className="text-[10px] py-0">{priority}</Badge>;
    case "Important":
      return <Badge variant="warning" className="text-[10px] py-0">{priority}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] py-0 text-text-secondary">{priority}</Badge>;
  }
}

export default function TrainingManagementPage() {
  const [trainings, setTrainings] = useState(mockTrainings);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Filter State
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    jobFamilies: "",
    trainingType: "MANDATORY",
    organizer: "",
    room: "",
    startDate: "",
    endDate: "",
    duration: "",
    cost: "",
    status: "PLANNING"
  });

  const updateTrainingPreparations = (trainingId: string, newPreparations: typeof mockTrainings[0]["preparations"]) => {
    setTrainings(trainings.map(t => t.id === trainingId ? { ...t, preparations: newPreparations } : t));
  };

  const handleOpenModal = (mode: "add" | "edit" | "delete", training: typeof mockTrainings[0] | null = null) => {
    setModalMode(mode);
    if (training) {
      setEditingId(training.id);
      setFormData({
        name: training.name,
        description: training.description || "",
        jobFamilies: training.jobFamilies ? training.jobFamilies.join(", ") : "",
        trainingType: training.trainingType,
        organizer: training.organizer,
        room: training.room,
        startDate: training.startDate,
        endDate: training.endDate || "",
        duration: training.duration,
        cost: training.cost,
        status: training.status
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", jobFamilies: "", trainingType: "MANDATORY", organizer: "", room: "", startDate: "", endDate: "", duration: "", cost: "", status: "PLANNING" });
    }
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (editingId) {
      setTrainings(trainings.filter(t => t.id !== editingId));
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newTraining = {
        id: `TR-00${trainings.length + 1}`,
        name: formData.name,
        description: formData.description,
        jobFamilies: formData.jobFamilies.split(",").map(s => s.trim()).filter(s => s !== ""),
        trainingType: formData.trainingType,
        organizer: formData.organizer,
        room: formData.room,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        cost: formData.cost,
        status: formData.status,
        preparations: []
      };
      setTrainings([newTraining, ...trainings]);
    } else if (modalMode === "edit") {
      setTrainings(trainings.map(t => t.id === editingId ? {
        ...t,
        name: formData.name,
        description: formData.description,
        jobFamilies: formData.jobFamilies.split(",").map(s => s.trim()).filter(s => s !== ""),
        trainingType: formData.trainingType,
        organizer: formData.organizer,
        room: formData.room,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        cost: formData.cost,
        status: formData.status,
      } : t));
    }
    setIsModalOpen(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTrainings = trainings.filter(training => {
    if (filterMonth === "all" && filterYear === "all") return true;
    
    // startDate format: "2026-06-10"
    const dateParts = training.startDate.split("-");
    if (dateParts.length >= 2) {
      const year = dateParts[0];
      const month = dateParts[1];
      
      const monthMatch = filterMonth === "all" || month === filterMonth;
      const yearMatch = filterYear === "all" || year === filterYear;
      
      return monthMatch && yearMatch;
    }
    return true;
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
          <Button variant="outline" className="gap-2">
            Export
          </Button>
          <Button className="gap-2" onClick={() => handleOpenModal("add")}>
            <Plus className="h-4 w-4" />
            Tambah Training
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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-navy"></TableHead>
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
            {filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-text-secondary">
                  Tidak ada data training yang sesuai dengan filter.
                </TableCell>
              </TableRow>
            ) : filteredTrainings.map((training) => {
              const isExpanded = expandedRows[training.id];
              return (
                <React.Fragment key={training.id}>
                  {/* Parent Row */}
                  <TableRow className={cn(isExpanded && "bg-sky-light/5 border-b-0")}>
                    <TableCell className="p-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRow(training.id);
                        }}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-sky-light/20 text-navy cursor-pointer transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      <div className="flex flex-col gap-1">
                        <span>{training.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {training.jobFamilies?.map((jf, idx) => (
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
                      <div className="relative inline-block text-left">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-text-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === training.id ? null : training.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {openActionId === training.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(null);
                            }}></div>
                            <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                              <Link href={`/training/${training.id}`}>
                                <button className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2">
                                  <Eye className="h-4 w-4" /> Detail
                                </button>
                              </Link>
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal("edit", training);
                                  setOpenActionId(null);
                                }}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </button>
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal("delete", training);
                                  setOpenActionId(null);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Hapus
                              </button>
                            </Card>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Sub-Table for Activities */}
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
            
            {trainings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Tidak ada data training.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
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
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="button" onClick={confirmDelete} className="bg-danger hover:bg-danger/90 text-white">
                    Hapus Data
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Training</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Aviation Safety Leadership" />
                </div>

                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Keterangan / Deskripsi</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Tuliskan keterangan singkat mengenai training ini..."
                  />
                </div>
                
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Job Family (Bisa lebih dari satu, pisahkan dengan koma)</label>
                  <Input value={formData.jobFamilies} onChange={(e) => setFormData({...formData, jobFamilies: e.target.value})} placeholder="Contoh: People Management, Aviation Security" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Jenis Training</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={formData.trainingType} 
                    onChange={(e) => setFormData({...formData, trainingType: e.target.value})}
                  >
                    <option value="MANDATORY">Mandatori</option>
                    <option value="NON_MANDATORY">Non-Mandatori</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Penyelenggara</label>
                  <Input required value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} placeholder="Nama Penyelenggara" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Ruangan / Lokasi</label>
                  <Input required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="Nama Ruangan" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Tanggal Mulai</label>
                  <Input required type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Tanggal Selesai</label>
                  <Input required type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Durasi</label>
                  <Input required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="Contoh: 16 Jam" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Biaya</label>
                  <Input required value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} placeholder="Contoh: Rp 15.000.000" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Status Training</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-surface">
                  {modalMode === "add" ? "Simpan Data" : "Update Data"}
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
