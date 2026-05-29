"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, CornerDownRight, CheckSquare, Square, Link as LinkIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

const mockTrainings = [
  {
    id: "TR-001",
    name: "Aviation Safety Leadership",
    trainingType: "MANDATORY",
    instructor: "Capt. Budi Santoso",
    room: "Auditorium A",
    startDate: "2026-06-10",
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
        linkOutput: "doc/sosialisasi.pdf" 
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
    trainingType: "NON_MANDATORY",
    instructor: "Rina Wijaya",
    room: "Meeting Room 2",
    startDate: "2026-05-28",
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
    trainingType: "MANDATORY",
    instructor: "Hendra Gunawan",
    room: "Training Center B",
    startDate: "2026-05-15",
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

export default function TrainingPage() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
          <Button variant="outline" className="gap-2">
            Import Excel
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Training
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari nama training atau instruktur..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Data Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-navy"></TableHead>
              <TableHead className="font-semibold text-navy">Nama Training</TableHead>
              <TableHead className="font-semibold text-navy">Jenis</TableHead>
              <TableHead className="font-semibold text-navy">Instruktur</TableHead>
              <TableHead className="font-semibold text-navy">Ruangan</TableHead>
              <TableHead className="font-semibold text-navy">Tanggal</TableHead>
              <TableHead className="font-semibold text-navy">Durasi</TableHead>
              <TableHead className="font-semibold text-navy">Biaya</TableHead>
              <TableHead className="font-semibold text-navy">Status</TableHead>
              <TableHead className="text-right font-semibold text-navy">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrainings.map((training) => {
              const isExpanded = expandedRows[training.id];
              return (
                <React.Fragment key={training.id}>
                  {/* Parent Row */}
                  <TableRow className={cn(isExpanded && "bg-sky-light/5 border-b-0")}>
                    <TableCell className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleRow(training.id)}
                        className="h-8 w-8 hover:bg-sky-light/20 text-navy"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      {training.name}
                    </TableCell>
                    <TableCell>{getTypeBadge(training.trainingType)}</TableCell>
                    <TableCell>{training.instructor}</TableCell>
                    <TableCell>{training.room}</TableCell>
                    <TableCell>{training.startDate}</TableCell>
                    <TableCell>{training.duration}</TableCell>
                    <TableCell>{training.cost}</TableCell>
                    <TableCell>{getStatusBadge(training.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/training/${training.id}`}>
                        <Button variant="ghost" size="sm" className="text-sky hover:bg-sky-light/10">
                          Lihat Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>

                  {/* Sub-Table for Activities */}
                  {isExpanded && (
                    <TableRow className="bg-sky-light/5 hover:bg-sky-light/5 border-b">
                      <TableCell colSpan={10} className="p-0 border-b">
                        <div className="bg-background p-4 pl-14">
                          <Table>
                            <TableHeader className="bg-navy text-surface">
                              <TableRow className="hover:bg-navy">
                                <TableHead className="w-12 text-surface text-center">No</TableHead>
                                <TableHead className="text-surface font-semibold">Task / Sub-task Name</TableHead>
                                <TableHead className="text-surface font-semibold">Category</TableHead>
                                <TableHead className="text-surface font-semibold">Due Date</TableHead>
                                <TableHead className="text-surface font-semibold">Priority</TableHead>
                                <TableHead className="text-surface font-semibold">PIC</TableHead>
                                <TableHead className="text-surface font-semibold">Team</TableHead>
                                <TableHead className="text-surface font-semibold text-center">✓</TableHead>
                                <TableHead className="text-surface font-semibold">Progress</TableHead>
                                <TableHead className="text-surface font-semibold">Link Output</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {training.preparations.map((prep, index) => (
                                <TableRow key={prep.id} className="hover:bg-muted/30">
                                  <TableCell className="text-center text-text-secondary">
                                    <CornerDownRight className="h-4 w-4 mx-auto" />
                                  </TableCell>
                                  <TableCell className={cn("font-medium", prep.isCompleted ? "text-text-secondary line-through" : "text-navy")}>
                                    {prep.activityName}
                                  </TableCell>
                                  <TableCell className="text-text-secondary text-sm">{prep.category}</TableCell>
                                  <TableCell className="text-text-secondary text-sm">{prep.dueDate}</TableCell>
                                  <TableCell>{getPriorityBadge(prep.priority)}</TableCell>
                                  <TableCell className="text-sm font-medium">{prep.pic}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px] py-0 bg-background">{prep.team}</Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {prep.isCompleted ? (
                                      <CheckSquare className="h-5 w-5 text-success mx-auto" />
                                    ) : (
                                      <Square className="h-5 w-5 text-text-secondary mx-auto" />
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">{prep.progress}</TableCell>
                                  <TableCell>
                                    {prep.linkOutput !== "-" ? (
                                      <a href="#" className="flex items-center gap-1 text-sky hover:underline text-xs">
                                        <LinkIcon className="h-3 w-3" /> Output
                                      </a>
                                    ) : (
                                      <span className="text-text-secondary">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {training.preparations.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={10} className="text-center py-4 text-text-secondary">
                                    Belum ada aktivitas persiapan.
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={10} className="p-2">
                                  <Button variant="ghost" size="sm" className="w-full text-sky hover:text-sky hover:bg-sky-light/10 justify-start border border-dashed border-sky-light/30">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Sub-task Baru
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            
            {mockTrainings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Tidak ada data training.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
