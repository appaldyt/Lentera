"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Download, FileSpreadsheet, MapPin, Calendar as CalendarIcon, Clock, Users, CornerDownRight, CheckSquare, Square, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

// Mock Data for the specific training
const trainingDetail = {
  id: "TR-001",
  name: "Aviation Safety Leadership",
  instructor: "Capt. Budi Santoso",
  room: "Auditorium A",
  startDate: "2026-06-10",
  duration: "16 Jam",
  cost: "Rp 15.000.000",
  status: "PLANNING",
  description: "Pelatihan kepemimpinan dengan fokus pada budaya keselamatan penerbangan dan mitigasi risiko operasional.",
  preparations: [
    { id: "P-101", activityName: "Sosialisasi LMS ke Kantor Pusat", category: "Sosialisasi", dueDate: "2026-05-20", priority: "Urgent", pic: "Alin", team: "PM", isCompleted: true, progress: "100%", linkOutput: "doc/sosialisasi.pdf" },
    { id: "P-102", activityName: "Pembuatan Draft Surat Edaran", category: "Administrasi", dueDate: "2026-05-22", priority: "Important", pic: "Budi", team: "Legal", isCompleted: true, progress: "100%", linkOutput: "doc/draft_se.pdf" },
    { id: "P-103", activityName: "Pengesahan Surat Edaran", category: "Administrasi", dueDate: "2026-05-25", priority: "Important", pic: "Sinta", team: "PM", isCompleted: true, progress: "100%", linkOutput: "doc/se_final.pdf" },
    { id: "P-104", activityName: "Monitoring penggunaan LMS", category: "Operasional", dueDate: "2026-06-05", priority: "Important", pic: "Andi", team: "IT", isCompleted: false, progress: "25%", linkOutput: "-" },
  ],
  participants: [
    { id: "PAR-1", nik: "20260101", name: "Budi Santoso", department: "Operations", trainingDate: "2026-06-10", attendedHours: 0 },
    { id: "PAR-2", nik: "20260104", name: "Andi Pratama", department: "Ground Handling", trainingDate: "2026-06-10", attendedHours: 0 },
  ]
};

// Mock Employee Data for Lookup
const mockEmployees = [
  { nik: "20260101", name: "Budi Santoso", department: "Operations" },
  { nik: "20260102", name: "Siti Rahma", department: "Human Resources" },
  { nik: "20260103", name: "Andi Pratama", department: "Ground Handling" },
  { nik: "20260104", name: "Dewi Lestari", department: "Safety & Quality" },
  { nik: "20260105", name: "Rina Wijaya", department: "Finance" },
  { nik: "20260106", name: "Hendra Gunawan", department: "IT" },
];

export default function TrainingDetailPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch data based on params.id
  const [participants, setParticipants] = useState(trainingDetail.participants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [searchNik, setSearchNik] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{nik: string, name: string, department: string} | null>(null);
  const [trainingDateInput, setTrainingDateInput] = useState(trainingDetail.startDate);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearchNik = (nik: string) => {
    setSearchNik(nik);
    setErrorMsg("");
    if (nik.length >= 8) {
      const emp = mockEmployees.find(e => e.nik === nik);
      if (emp) {
        setFoundEmployee(emp);
      } else {
        setFoundEmployee(null);
        setErrorMsg("Karyawan tidak ditemukan.");
      }
    } else {
      setFoundEmployee(null);
    }
  };

  const handleAddParticipant = () => {
    if (foundEmployee) {
      setParticipants([
        ...participants,
        {
          id: `PAR-${Date.now()}`,
          nik: foundEmployee.nik,
          name: foundEmployee.name,
          department: foundEmployee.department,
          trainingDate: trainingDateInput,
          attendedHours: 0
        }
      ]);
      setIsModalOpen(false);
      setSearchNik("");
      setFoundEmployee(null);
    }
  };
  
  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link href="/training">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-navy">{trainingDetail.name}</h2>
            <Badge variant="warning">{trainingDetail.status}</Badge>
          </div>
          <p className="text-sm text-text-secondary">ID: {trainingDetail.id} • {trainingDetail.description}</p>
        </div>
      </div>

      {/* Top Section: Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-sky-light/20 rounded-lg text-sky">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Instruktur</p>
              <p className="font-semibold text-navy">{trainingDetail.instructor}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-sky-light/20 rounded-lg text-sky">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Tanggal Mulai</p>
              <p className="font-semibold text-navy">{trainingDetail.startDate}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-sky-light/20 rounded-lg text-sky">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Durasi</p>
              <p className="font-semibold text-navy">{trainingDetail.duration}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-sky-light/20 rounded-lg text-sky">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Ruangan</p>
              <p className="font-semibold text-navy">{trainingDetail.room}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Activities Checklist */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg text-navy">Aktivitas Persiapan</CardTitle>
            <CardDescription>Checklist *task* yang harus diselesaikan sebelum training dimulai.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Sub-task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
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
                {trainingDetail.preparations.map((prep, index) => (
                  <TableRow key={prep.id} className="hover:bg-muted/30">
                    <TableCell className="text-center text-text-secondary">
                      {index + 1}
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
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Participants */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg text-navy">Daftar Peserta (Karyawan)</CardTitle>
            <CardDescription>Kelola data karyawan yang terdaftar untuk mengikuti training ini.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success">
              <FileSpreadsheet className="h-4 w-4" />
              Import Excel
            </Button>
            <Button className="gap-2 bg-navy hover:bg-navy/90 text-surface" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Tambah Peserta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-navy">NIK</TableHead>
                <TableHead className="font-semibold text-navy">Nama Karyawan</TableHead>
                <TableHead className="font-semibold text-navy">Divisi</TableHead>
                <TableHead className="font-semibold text-navy">Tanggal Training</TableHead>
                <TableHead className="font-semibold text-navy">Jam Kehadiran</TableHead>
                <TableHead className="text-right font-semibold text-navy">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((par) => (
                <TableRow key={par.id}>
                  <TableCell className="font-medium text-navy">{par.nik}</TableCell>
                  <TableCell>{par.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-background">
                      {par.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{par.trainingDate}</TableCell>
                  <TableCell>{par.attendedHours} Jam</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-danger hover:bg-danger/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {participants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada peserta yang terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modal Tambah Peserta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-navy mb-4">Tambah Peserta Training</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK Karyawan</Label>
                <Input 
                  id="nik" 
                  placeholder="Masukkan NIK... (contoh: 20260105)" 
                  value={searchNik} 
                  onChange={(e) => handleSearchNik(e.target.value)} 
                />
                {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Nama Karyawan</Label>
                <Input value={foundEmployee ? foundEmployee.name : ""} disabled className="bg-muted/50 text-text-secondary" />
              </div>
              
              <div className="space-y-2">
                <Label>Divisi</Label>
                <Input value={foundEmployee ? foundEmployee.department : ""} disabled className="bg-muted/50 text-text-secondary" />
              </div>

              <div className="space-y-2">
                <Label>Tanggal Training</Label>
                <Input type="date" value={trainingDateInput} onChange={(e) => setTrainingDateInput(e.target.value)} />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleAddParticipant} disabled={!foundEmployee} className="bg-navy text-surface hover:bg-navy-light">
                Tambahkan
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
