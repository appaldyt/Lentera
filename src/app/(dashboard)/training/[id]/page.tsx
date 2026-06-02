"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, FileSpreadsheet, MapPin, Calendar as CalendarIcon, Clock, Users, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import TrainingPreparationsTable, { type Subtask } from "@/components/training/TrainingPreparationsTable";

interface Participant {
  id: string;
  nik: string;
  name: string;
  department: string;
  trainingDate: string | null;
  attendedHours: number;
}

interface TrainingDetail {
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
  participants: Participant[];
}

// Mock employee lookup (replace with real Employee API when available)
const MOCK_EMPLOYEES = [
  { nik: "20260101", name: "Budi Santoso", department: "Operations" },
  { nik: "20260102", name: "Siti Rahma", department: "Human Resources" },
  { nik: "20260103", name: "Andi Pratama", department: "Ground Handling" },
  { nik: "20260104", name: "Dewi Lestari", department: "Safety & Quality" },
  { nik: "20260105", name: "Rina Wijaya", department: "Finance" },
  { nik: "20260106", name: "Hendra Gunawan", department: "IT" },
];

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [searchNik, setSearchNik] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{ nik: string; name: string; department: string } | null>(null);
  const [trainingDateInput, setTrainingDateInput] = useState("");
  const [editAttendedHours, setEditAttendedHours] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/trainings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.training) {
          setTraining(data.training);
          setParticipants(data.training.participants ?? []);
          setTrainingDateInput(data.training.startDate ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePreparationsChange = async (newPreps: Subtask[]) => {
    if (!training) return;
    setTraining({ ...training, preparations: newPreps });
    const res = await fetch(`/api/trainings/${id}/preparations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preparations: newPreps }),
    });
    if (res.ok) {
      const { preparations } = await res.json();
      setTraining((prev) => prev ? { ...prev, preparations } : prev);
    }
  };

  const handleSearchNik = (nik: string) => {
    setSearchNik(nik);
    setErrorMsg("");
    if (nik.length >= 8) {
      const emp = MOCK_EMPLOYEES.find((e) => e.nik === nik);
      setFoundEmployee(emp ?? null);
      if (!emp) setErrorMsg("Karyawan tidak ditemukan.");
    } else {
      setFoundEmployee(null);
    }
  };

  const handleAddParticipant = async () => {
    if (!foundEmployee) return;
    setSaving(true);
    const res = await fetch(`/api/trainings/${id}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik: foundEmployee.nik,
        name: foundEmployee.name,
        department: foundEmployee.department,
        trainingDate: trainingDateInput,
      }),
    });
    if (res.ok) {
      const { participant } = await res.json();
      setParticipants((prev) => [...prev, participant]);
    }
    setSaving(false);
    setIsModalOpen(false);
    setSearchNik("");
    setFoundEmployee(null);
  };

  const handleOpenParticipantModal = (mode: "add" | "edit" | "delete", participant: Participant | null = null) => {
    setModalMode(mode);
    setEditingParticipant(participant);
    if (mode === "edit" && participant) {
      setTrainingDateInput(participant.trainingDate ?? training?.startDate ?? "");
      setEditAttendedHours(participant.attendedHours);
    } else if (mode === "add") {
      setTrainingDateInput(training?.startDate ?? "");
      setSearchNik("");
      setFoundEmployee(null);
      setErrorMsg("");
    }
    setIsModalOpen(true);
  };

  const handleEditParticipant = async () => {
    if (!editingParticipant) return;
    setSaving(true);
    const res = await fetch(`/api/trainings/${id}/participants/${editingParticipant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainingDate: trainingDateInput, attendedHours: editAttendedHours }),
    });
    if (res.ok) {
      const { participant } = await res.json();
      setParticipants((prev) => prev.map((p) => p.id === editingParticipant.id ? participant : p));
    }
    setSaving(false);
    setIsModalOpen(false);
    setEditingParticipant(null);
  };

  const confirmDeleteParticipant = async () => {
    if (!editingParticipant) return;
    setSaving(true);
    await fetch(`/api/trainings/${id}/participants/${editingParticipant.id}`, { method: "DELETE" });
    setParticipants((prev) => prev.filter((p) => p.id !== editingParticipant.id));
    setSaving(false);
    setIsModalOpen(false);
    setEditingParticipant(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        Memuat data training...
      </div>
    );
  }

  if (!training) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-text-secondary">Data training tidak ditemukan.</p>
        <Link href="/training">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button>
        </Link>
      </div>
    );
  }

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
            {training.jobFamilies.map((jf, idx) => (
              <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 bg-muted/30 text-text-secondary border-border/50">
                {jf}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: <Users className="h-5 w-5" />, label: "Penyelenggara", value: training.organizer },
          { icon: <CalendarIcon className="h-5 w-5" />, label: "Tanggal Mulai", value: training.startDate },
          { icon: <Clock className="h-5 w-5" />, label: "Durasi", value: training.duration },
          { icon: <MapPin className="h-5 w-5" />, label: "Ruangan", value: training.room },
        ].map(({ icon, label, value }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-sky-light/20 rounded-lg text-sky">{icon}</div>
              <div>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className="font-semibold text-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preparations */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg text-navy">Aktivitas Persiapan</CardTitle>
            <CardDescription>Checklist task yang harus diselesaikan sebelum training dimulai.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <TrainingPreparationsTable
            trainingId={training.id}
            preparations={training.preparations}
            onChange={handlePreparationsChange}
            isNestedView={false}
          />
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg text-navy">Daftar Peserta (Karyawan)</CardTitle>
            <CardDescription>Kelola data karyawan yang terdaftar untuk mengikuti training ini.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success">
              <FileSpreadsheet className="h-4 w-4" /> Import Excel
            </Button>
            <Button className="gap-2 bg-navy hover:bg-navy/90 text-surface" onClick={() => handleOpenParticipantModal("add")}>
              <Plus className="h-4 w-4" /> Tambah Peserta
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
                    <Badge variant="outline" className="font-normal bg-background">{par.department}</Badge>
                  </TableCell>
                  <TableCell>{par.trainingDate}</TableCell>
                  <TableCell>{par.attendedHours} Jam</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          className="w-full flex items-center gap-2 text-navy cursor-pointer"
                          onClick={() => handleOpenParticipantModal("edit", par)}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                          onClick={() => handleOpenParticipantModal("delete", par)}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {participants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-text-secondary">
                    Belum ada peserta yang terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Peserta */}
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
                  Apakah Anda yakin ingin menghapus <strong>{editingParticipant.name}</strong> dari daftar peserta? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={confirmDeleteParticipant} disabled={saving} className="bg-danger text-white hover:bg-danger/90">
                    {saving ? "Menghapus..." : "Hapus Data"}
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
                    <Label>Jam Kehadiran</Label>
                    <Input type="number" min="0" value={editAttendedHours} onChange={(e) => setEditAttendedHours(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleEditParticipant} disabled={saving} className="bg-navy text-surface hover:bg-navy-light">
                    {saving ? "Menyimpan..." : "Update Data"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK Karyawan</Label>
                    <Input id="nik" placeholder="Masukkan NIK... (contoh: 20260105)"
                      value={searchNik} onChange={(e) => handleSearchNik(e.target.value)} />
                    {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Karyawan</Label>
                    <Input value={foundEmployee?.name ?? ""} disabled className="bg-muted/50 text-text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Divisi</Label>
                    <Input value={foundEmployee?.department ?? ""} disabled className="bg-muted/50 text-text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Training</Label>
                    <Input type="date" value={trainingDateInput} onChange={(e) => setTrainingDateInput(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={handleAddParticipant} disabled={!foundEmployee || saving} className="bg-navy text-surface hover:bg-navy-light">
                    {saving ? "Menambahkan..." : "Tambahkan"}
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
