"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, FileSpreadsheet, MapPin, Calendar as CalendarIcon, Clock, Users, Search, Filter, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TrainingPreparationsTable from "@/components/training/TrainingPreparationsTable";

const trainingDetail = {
  id: "TR-001",
  name: "Aviation Safety Leadership",
  jobFamilies: ["Safety & Quality", "Leadership"],
  organizer: "Capt. Budi Santoso",
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
  const [training, setTraining] = useState(trainingDetail);
  const [participants, setParticipants] = useState(training.participants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingParticipant, setEditingParticipant] = useState<typeof participants[0] | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // Form states
  const [searchNik, setSearchNik] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{nik: string, name: string, department: string} | null>(null);
  const [trainingDateInput, setTrainingDateInput] = useState(trainingDetail.startDate);
  const [editAttendedHours, setEditAttendedHours] = useState(0);
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

  const handleOpenParticipantModal = (mode: "add" | "edit" | "delete", participant: typeof participants[0] | null = null) => {
    setModalMode(mode);
    setEditingParticipant(participant);
    if (mode === "edit" && participant) {
      setTrainingDateInput(participant.trainingDate);
      setEditAttendedHours(participant.attendedHours);
    } else if (mode === "add") {
      setTrainingDateInput(trainingDetail.startDate);
      setSearchNik("");
      setFoundEmployee(null);
    }
    setIsModalOpen(true);
  };

  const handleEditParticipant = () => {
    if (editingParticipant) {
      setParticipants(participants.map(p => p.id === editingParticipant.id ? {
        ...p,
        trainingDate: trainingDateInput,
        attendedHours: editAttendedHours
      } : p));
      setIsModalOpen(false);
      setEditingParticipant(null);
    }
  };

  const confirmDeleteParticipant = () => {
    if (editingParticipant) {
      setParticipants(participants.filter(p => p.id !== editingParticipant.id));
      setIsModalOpen(false);
      setEditingParticipant(null);
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
            <h2 className="text-2xl font-bold tracking-tight text-navy">{training.name}</h2>
            <Badge variant="warning">{training.status}</Badge>
          </div>
          <p className="text-sm text-text-secondary">ID: {training.id} • {training.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {training.jobFamilies?.map((jf, idx) => (
              <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 bg-muted/30 text-text-secondary border-border/50">
                {jf}
              </Badge>
            ))}
          </div>
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
              <p className="text-xs text-text-secondary">Penyelenggara</p>
              <p className="font-semibold text-navy">{training.organizer}</p>
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
              <p className="font-semibold text-navy">{training.startDate}</p>
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
              <p className="font-semibold text-navy">{training.duration}</p>
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
              <p className="font-semibold text-navy">{training.room}</p>
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
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <TrainingPreparationsTable 
            trainingId={training.id} 
            preparations={training.preparations} 
            onChange={(newPrep) => setTraining({ ...training, preparations: newPrep })} 
            isNestedView={false} 
          />
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
            <Button className="gap-2 bg-navy hover:bg-navy/90 text-surface" onClick={() => handleOpenParticipantModal("add")}>
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
                    <div className="relative inline-block text-left">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-text-secondary"
                        onClick={() => setOpenActionId(openActionId === par.id ? null : par.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      
                      {openActionId === par.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)}></div>
                          <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                              onClick={() => {
                                handleOpenParticipantModal("edit", par);
                                setOpenActionId(null);
                              }}
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                              onClick={() => {
                                handleOpenParticipantModal("delete", par);
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
      
      {/* Modal Tambah/Edit/Delete Peserta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-navy">
                {modalMode === "add" ? "Tambah Peserta Training" : modalMode === "edit" ? "Edit Data Peserta" : "Konfirmasi Hapus"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {modalMode === "delete" && editingParticipant ? (
              <div className="space-y-6">
                <p className="text-text-secondary">
                  Apakah Anda yakin ingin menghapus <strong>{editingParticipant.name}</strong> dari daftar peserta training ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={confirmDeleteParticipant} className="bg-danger text-white hover:bg-danger/90">
                    Hapus Data
                  </Button>
                </div>
              </div>
            ) : modalMode === "edit" && editingParticipant ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Karyawan</Label>
                    <Input value={editingParticipant.name} disabled className="bg-muted/50 text-text-secondary" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Divisi</Label>
                    <Input value={editingParticipant.department} disabled className="bg-muted/50 text-text-secondary" />
                  </div>
  
                  <div className="space-y-2">
                    <Label>Tanggal Training</Label>
                    <Input type="date" value={trainingDateInput} onChange={(e) => setTrainingDateInput(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Jam Kehadiran (Jam)</Label>
                    <Input type="number" min="0" value={editAttendedHours} onChange={(e) => setEditAttendedHours(Number(e.target.value))} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleEditParticipant} className="bg-navy text-surface hover:bg-navy-light">
                    Update Data
                  </Button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
