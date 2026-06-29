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
import { Search, Send, UserPlus, Check } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const filteredData = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.training.toLowerCase().includes(searchTerm.toLowerCase())
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
    await assignEvaluator(selectedParticipant.id, selectedEvaluatorId);
    await fetchData();
    setIsProcessing(false);
    setIsDialogOpen(false);
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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder="Cari nama/training..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <th className="px-4 py-3 font-medium">Ditugaskan Kepada</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 10).map((data) => (
                  <tr key={data.id} className="border-b border-border hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-medium text-navy">{data.name}</td>
                    <td className="px-4 py-4 text-text-secondary">{data.training}</td>
                    <td className="px-4 py-4 text-text-secondary">{data.dateEnded}</td>
                    <td className="px-4 py-4">
                      {data.evaluatorName === "Belum Ditugaskan" ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning-dark border-warning/20">
                          Belum Ditugaskan
                        </Badge>
                      ) : (
                        <span className="font-medium text-navy">{data.evaluatorName}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {data.evaluatorName === "Belum Ditugaskan" ? (
                        <Button 
                          size="sm" 
                          className="bg-sky hover:bg-sky-dark text-surface gap-2"
                          onClick={() => handleOpenDialog(data)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Pilih Atasan
                        </Button>
                      ) : data.isSent ? (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

