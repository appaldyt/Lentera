"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Send, UserPlus, Check, Pencil, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getParticipantsForEvaluation, assignEvaluator, sendEvaluationForm } from "@/actions/evaluation-assignments";
import { getEvaluators } from "@/actions/evaluation-users";
import { useEffect } from "react";

// Types
type Participant = {
  id: string;
  nik: string;
  name: string;
  training: string;
  dateEnded: string;
  masaTraining: string;
  evaluatorId: string | null;
  evaluatorName: string;
  status: string;
  isSent: boolean;
};

type Evaluator = {
  id: string;
  nik: string | null;
  name: string;
};

export default function EvaluasiAssignmentsPage() {
  const [filterName, setFilterName] = useState("");
  const [filterTraining, setFilterTraining] = useState("");
  const [filterMasaTraining, setFilterMasaTraining] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState("");
  const [nikInput, setNikInput] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [participantToSend, setParticipantToSend] = useState<Participant | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [participantsData, evaluatorsData] = await Promise.all([
      getParticipantsForEvaluation(),
      getEvaluators()
    ]);
    setParticipants(participantsData as any);
    setEvaluators(evaluatorsData.map(e => ({ id: e.id, nik: (e as any).nik || null, name: e.name })));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = participants.filter(p => {
    const matchName = p.name.toLowerCase().includes(filterName.toLowerCase());
    const matchTraining = p.training.toLowerCase().includes(filterTraining.toLowerCase());
    const matchMasa = filterMasaTraining === "Semua" || p.masaTraining === filterMasaTraining;
    
    let matchStatus = true;
    if (filterStatus === "Belum Dievaluasi") {
      matchStatus = p.evaluatorName === "Belum Dievaluasi";
    } else if (filterStatus === "Menunggu Evaluasi") {
      matchStatus = p.isSent && p.status !== "SELESAI_DIEVALUASI";
    } else if (filterStatus === "Selesai Dievaluasi") {
      matchStatus = p.status === "SELESAI_DIEVALUASI";
    }

    return matchName && matchTraining && matchMasa && matchStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [filterName, filterTraining, filterMasaTraining, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedEvaluatorName = evaluators.find(e => e.id === selectedEvaluatorId)?.name || "";

  const handleOpenDialog = (participant: Participant) => {
    setSelectedParticipant(participant);
    setSelectedEvaluatorId(participant.evaluatorId || "");
    const existingEv = evaluators.find(e => e.id === participant.evaluatorId);
    setNikInput(existingEv?.nik || "");
    setIsDialogOpen(true);
  };

  const handleNikChange = (nik: string) => {
    setNikInput(nik);
    const found = evaluators.find(e => e.nik === nik);
    if (found) {
      setSelectedEvaluatorId(found.id);
    } else {
      setSelectedEvaluatorId("");
    }
  };

  const handleAssign = async () => {
    if (!selectedParticipant || !selectedEvaluatorId) return;
    
    setIsProcessing(true);
    const result = await assignEvaluator(selectedParticipant.id, selectedEvaluatorId);
    if (result && !result.success) {
      alert(result.error);
    } else {
      await fetchData();
      setIsDialogOpen(false);
    }
    setIsProcessing(false);
  };

  const handleOpenConfirmDialog = (participant: Participant) => {
    setParticipantToSend(participant);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!participantToSend) return;
    
    setIsProcessing(true);
    await sendEvaluationForm(participantToSend.id);
    await fetchData();
    setIsProcessing(false);
    
    setIsConfirmDialogOpen(false);
    setTimeout(() => {
      setParticipantToSend(null);
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Distribusi Evaluasi</h1>
        <p className="mt-2 text-text-secondary">
          Tugaskan Atasan untuk mengevaluasi peserta training yang telah lewat dari 3 bulan (Fase Implementasi).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Peserta Menunggu Evaluasi</CardTitle>
              <CardDescription>Pilih atasan yang berwenang untuk memberikan penilaian.</CardDescription>
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50 text-navy"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              {isFilterOpen && (
                <Card className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Data
                    </h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-secondary">Nama Karyawan</label>
                      <Input
                        placeholder="Filter by Name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-secondary">Pelatihan</label>
                      <Input
                        placeholder="Filter by Training..."
                        value={filterTraining}
                        onChange={(e) => setFilterTraining(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-secondary">Masa Training</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                        value={filterMasaTraining}
                        onChange={(e) => setFilterMasaTraining(e.target.value)}
                      >
                        <option value="Semua">Semua Masa</option>
                        <option value="Kurang dari 3 bulan">Kurang dari 3 bulan</option>
                        <option value="Lewat 3 bulan">Lewat 3 bulan</option>
                        <option value="Lewat 6 Bulan">Lewat 6 Bulan</option>
                        <option value="Lewat Setahun">Lewat Setahun</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-secondary">Status Evaluasi</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="Semua Status">Semua Status</option>
                        <option value="Belum Dievaluasi">Belum Dievaluasi</option>
                        <option value="Menunggu Evaluasi">Menunggu Evaluasi</option>
                        <option value="Selesai Dievaluasi">Selesai Dievaluasi</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-300 text-sky hover:text-sky-dark"
                      onClick={() => { 
                        setFilterName(""); 
                        setFilterTraining(""); 
                        setFilterMasaTraining("Semua"); 
                        setFilterStatus("Semua Status"); 
                      }}
                    >
                      Clear
                    </Button>
                    <Button className="flex-1 bg-sky hover:bg-[#1565C0] text-white" onClick={() => setIsFilterOpen(false)}>
                      Filter Results
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama Karyawan</th>
                  <th className="px-4 py-3 font-medium">Pelatihan</th>
                  <th className="px-4 py-3 font-medium">Selesai Training</th>
                  <th className="px-4 py-3 font-medium">Masa Training</th>
                  <th className="px-4 py-3 font-medium">Dievaluasi Oleh</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((data) => (
                  <tr key={data.id} className="border-b border-border hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-medium text-navy">{data.name}</td>
                    <td className="px-4 py-4 text-text-secondary">{data.training}</td>
                    <td className="px-4 py-4 text-text-secondary">{data.dateEnded}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={`
                        ${data.masaTraining === "Kurang dari 3 bulan" ? "bg-slate-100 text-slate-700 border-slate-200" : ""}
                        ${data.masaTraining === "Lewat 3 bulan" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        ${data.masaTraining === "Lewat 6 Bulan" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
                        ${data.masaTraining === "Lewat Setahun" ? "bg-red-50 text-red-700 border-red-200" : ""}
                      `}>
                        {data.masaTraining}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {data.evaluatorName === "Belum Dievaluasi" ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning-dark border-warning/20">
                          Belum Dievaluasi
                        </Badge>
                      ) : (
                        <span className="font-medium text-navy">{data.evaluatorName}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {data.evaluatorName === "Belum Dievaluasi" ? (
                        <Button 
                          size="sm" 
                          className="bg-sky hover:bg-sky-dark text-surface gap-2"
                          onClick={() => handleOpenDialog(data)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Pilih Atasan
                        </Button>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          {data.isSent ? (
                            <Button variant="outline" size="sm" disabled className="gap-2 text-success border-success/30 bg-success/5 opacity-100">
                              <Check className="h-4 w-4" />
                              Terkirim
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 text-text-secondary hover:text-navy hover:bg-slate-100"
                              onClick={() => handleOpenConfirmDialog(data)}
                            >
                              <Send className="h-4 w-4" />
                              Kirim Form Evaluasi
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-text-secondary hover:text-navy hover:bg-slate-100"
                            onClick={() => handleOpenDialog(data)}
                            disabled={data.status === "SELESAI_DIEVALUASI"}
                            title={data.status === "SELESAI_DIEVALUASI" ? "Evaluasi sudah selesai, harus open evaluasi terlebih dahulu" : "Ubah Atasan"}
                          >
                            <Pencil className="h-4 w-4" />
                            Ubah
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-4 mt-2 border-t border-border">
              <p className="text-sm text-text-secondary">
                Menampilkan{" "}
                <span className="font-medium text-navy">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}
                </span>{" "}
                dari <span className="font-medium text-navy">{filteredData.length}</span> entri
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</Button>
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`e-${idx}`} className="px-2 text-text-secondary text-sm">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0${currentPage === item ? " bg-navy text-surface" : ""}`}
                        onClick={() => setCurrentPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</Button>
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-navy">Pilih Atasan</DialogTitle>
            <DialogDescription className="sr-only">
              Form untuk menugaskan atasan yang akan mengevaluasi peserta training.
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Nama Karyawan</span>
                <Input 
                  value={selectedParticipant.name} 
                  disabled 
                  className="bg-white text-navy border-slate-200 opacity-100" 
                />
              </div>
              
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Pelatihan</span>
                <Input 
                  value={selectedParticipant.training} 
                  disabled 
                  className="bg-white text-navy border-slate-200 opacity-100" 
                />
              </div>
              
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">NIK Atasan</span>
                <Input 
                  value={nikInput}
                  onChange={(e) => handleNikChange(e.target.value)}
                  placeholder="Ketik NIK atasan..."
                  className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Nama Atasan</span>
                <Input 
                  value={selectedEvaluatorName || "Nama akan otomatis muncul"} 
                  disabled 
                  className={`bg-white border-slate-200 opacity-100 ${selectedEvaluatorName ? 'text-navy font-semibold bg-sky/5' : 'text-text-secondary italic'}`} 
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-8 gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="text-sky border-sky hover:bg-sky/5 font-medium"
            >
              Batal
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedEvaluatorId || isProcessing} 
              className="bg-sky hover:bg-[#1565C0] text-white font-medium"
            >
              {isProcessing ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 border-none shadow-xl rounded-xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-sky/10 flex items-center justify-center mb-1">
              <Send className="h-6 w-6 text-sky ml-1" />
            </div>
            
            <DialogHeader className="items-center w-full">
              <DialogTitle className="text-xl font-bold text-navy mb-2">Kirim Form Evaluasi?</DialogTitle>
              <DialogDescription className="text-center text-text-secondary">
                Apakah Anda yakin ingin mengirim form evaluasi atas nama <span className="font-medium text-navy">{participantToSend?.name}</span> kepada atasan <span className="font-medium text-navy">{participantToSend?.evaluatorName}</span>?
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <DialogFooter className="mt-8 flex flex-row gap-3 w-full sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              className="w-full text-sky border-sky hover:bg-sky/5 font-medium"
            >
              Batal
            </Button>
            <Button 
              onClick={handleConfirmSend} 
              disabled={isProcessing}
              className="w-full bg-sky hover:bg-[#1565C0] text-white font-medium"
            >
              {isProcessing ? "Memproses..." : "Kirim Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

