"use client";

import React, { useState, useEffect } from "react";
import { Info, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEvaluationQuestions,
  getEvaluationQuestionsByTrainingId,
  createEvaluationQuestion,
  updateEvaluationQuestion,
  deleteEvaluationQuestion
} from "@/actions/evaluation-questions";

export default function TrainingSpecificQuestions({ trainingId }: { trainingId: string }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", text: "", type: "RATING", status: "Aktif" });

  const [globalQuestions, setGlobalQuestions] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [trainingId]);

  const fetchQuestions = async () => {
    setLoading(true);
    const data = await getEvaluationQuestionsByTrainingId(trainingId);
    setQuestions(data);
    setLoading(false);
  };

  const handleOpenModal = (mode: "add" | "edit" | "delete", q: any = null) => {
    setModalMode(mode);
    if (q) {
      setEditingId(q.id);
      setFormData({ title: q.title, text: q.text, type: q.type || "RATING", status: q.status });
    } else {
      setEditingId(null);
      setFormData({ title: "", text: "", type: "RATING", status: "Aktif" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (modalMode === "add") {
      await createEvaluationQuestion({
        ...formData,
        isGlobal: false,
        trainingId: trainingId
      });
    } else if (modalMode === "edit" && editingId) {
      await updateEvaluationQuestion(editingId, {
        ...formData,
        isGlobal: false,
        trainingId: trainingId
      });
    }

    await fetchQuestions();
    setIsModalOpen(false);
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    await deleteEvaluationQuestion(editingId);
    await fetchQuestions();
    setIsModalOpen(false);
    setSaving(false);
  };

  const handleOpenPreview = async () => {
    setIsPreviewOpen(true);
    setLoadingPreview(true);
    const data = await getEvaluationQuestions();
    setGlobalQuestions(data);
    setLoadingPreview(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-sky-light/10 border border-sky-light/30 flex items-start gap-3">
         <Info className="h-5 w-5 text-sky mt-0.5 shrink-0" />
         <div>
            <h4 className="text-sm font-semibold text-navy">Informasi Penggabungan Pertanyaan</h4>
            <p className="text-xs text-text-secondary mt-1">
               Sistem akan otomatis menggabungkan pertanyaan yang ada di tabel ini dengan <strong>Pertanyaan Global</strong> (dari menu Manajemen Pertanyaan). Gunakan form ini hanya jika Anda butuh pertanyaan ekstra untuk spesifik training ini.
            </p>
         </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
         <h3 className="font-semibold text-navy">Daftar Pertanyaan Khusus</h3>
         <div className="flex items-center gap-2">
           <Button size="sm" variant="outline" className="text-sky hover:text-sky-dark border-sky/30 hover:bg-sky-light/10 gap-2" onClick={handleOpenPreview}>
              <Eye className="h-4 w-4" />
              Preview Form
           </Button>
           <Button size="sm" className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={() => handleOpenModal("add")}>
              <Plus className="h-4 w-4" />
              Tambah Pertanyaan
           </Button>
         </div>
      </div>
      
      <div className="border border-border rounded-md overflow-hidden bg-white">
         <Table>
            <TableHeader className="bg-slate-50">
               <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead className="w-48">Judul Kriteria</TableHead>
                  <TableHead>Teks Pertanyaan</TableHead>
                  <TableHead className="w-32 text-center">Tipe</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-6 text-text-secondary text-sm">
                     Memuat data...
                   </TableCell>
                 </TableRow>
               ) : questions.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-text-secondary text-sm">
                       Belum ada pertanyaan khusus untuk training ini.<br/>
                       <span className="text-xs">Klik tombol "Tambah Pertanyaan" untuk mulai membuat.</span>
                    </TableCell>
                 </TableRow>
               ) : (
                 questions.map((q, idx) => (
                   <TableRow key={q.id}>
                     <TableCell className="text-center">{idx + 1}</TableCell>
                     <TableCell className="font-medium">{q.title}</TableCell>
                     <TableCell className="text-text-secondary">{q.text}</TableCell>
                     <TableCell className="text-center">
                       {q.type === "ESSAY" ? (
                         <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Essay</Badge>
                       ) : (
                         <Badge variant="outline" className="text-navy bg-slate-50 border-slate-200">Rating</Badge>
                       )}
                     </TableCell>
                     <TableCell className="text-center">
                       {q.status === "Aktif" ? (
                         <Badge className="bg-success/10 text-success-dark border-success/20">Aktif</Badge>
                       ) : (
                         <Badge variant="outline" className="text-slate-500 bg-slate-100">Nonaktif</Badge>
                       )}
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-sky hover:text-sky-dark hover:bg-sky-light/20" onClick={() => handleOpenModal("edit", q)}>
                           <Pencil className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:text-danger-dark hover:bg-danger/10" onClick={() => handleOpenModal("delete", q)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))
               )}
            </TableBody>
         </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? "Tambah Pertanyaan Khusus" : modalMode === "edit" ? "Edit Pertanyaan Khusus" : "Hapus Pertanyaan"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "delete" 
                ? "Apakah Anda yakin ingin menghapus pertanyaan ini? Data yang sudah dihapus tidak dapat dikembalikan."
                : "Masukkan detail kriteria pertanyaan yang akan dievaluasi oleh atasan."}
            </DialogDescription>
          </DialogHeader>

          {modalMode === "delete" ? (
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Batal</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </DialogFooter>
          ) : (
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Kriteria <span className="text-danger">*</span></Label>
                  <Input 
                    id="title" 
                    placeholder="Contoh: Penguasaan Materi" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="text">Teks Pertanyaan <span className="text-danger">*</span></Label>
                  <Textarea 
                    id="text" 
                    placeholder="Tuliskan pertanyaan lengkap di sini..." 
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipe Pertanyaan</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="RATING">Rating (Skala 1-5)</option>
                    <option value="ESSAY">Teks Bebas (Essay)</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Aktif">Aktif (Tampil di Form)</option>
                    <option value="Nonaktif">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky-dark text-white" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Form Evaluasi</DialogTitle>
            <DialogDescription>
              Tampilan urutan pertanyaan yang akan dilihat oleh atasan saat mengevaluasi karyawan.
            </DialogDescription>
          </DialogHeader>

          {loadingPreview ? (
            <div className="py-8 text-center text-text-secondary">Memuat draft...</div>
          ) : (
            <div className="space-y-6 mt-4">
               {/* Global Questions */}
               {globalQuestions.filter(q => q.status === "Aktif").map((q, idx) => (
                 <div key={`global-${q.id}`} className="p-4 border rounded-md shadow-sm">
                   <div className="flex items-center justify-between">
                     <h4 className="font-semibold text-navy">{idx + 1}. {q.title}</h4>
                     <Badge variant="outline" className="bg-slate-100 text-xs text-slate-500">Global</Badge>
                   </div>
                   <p className="text-sm text-text-secondary mt-2">{q.text}</p>
                   {q.type === 'ESSAY' ? (
                     <div className="mt-4 opacity-50">
                       <Textarea disabled placeholder="Jawaban teks bebas..." className="min-h-[80px]" />
                     </div>
                   ) : (
                     <div className="flex gap-1 mt-4 opacity-50">
                       {[1,2,3,4,5].map(i => <div key={i} className="h-6 w-6 rounded border flex items-center justify-center text-xs">⭐</div>)}
                     </div>
                   )}
                 </div>
               ))}

               {/* Specific Questions */}
               {questions.filter(q => q.status === "Aktif").map((q, idx) => (
                 <div key={`specific-${q.id}`} className="p-4 border border-sky-light/50 bg-sky-light/5 rounded-md shadow-sm">
                   <div className="flex items-center justify-between">
                     <h4 className="font-semibold text-sky-dark">{globalQuestions.filter(g => g.status === "Aktif").length + idx + 1}. {q.title}</h4>
                     <Badge className="bg-sky/10 text-sky-dark border-sky/20 text-xs">Khusus Training</Badge>
                   </div>
                   <p className="text-sm text-text-secondary mt-2">{q.text}</p>
                   {q.type === 'ESSAY' ? (
                     <div className="mt-4 opacity-50">
                       <Textarea disabled placeholder="Jawaban teks bebas..." className="min-h-[80px]" />
                     </div>
                   ) : (
                     <div className="flex gap-1 mt-4 opacity-50">
                       {[1,2,3,4,5].map(i => <div key={i} className="h-6 w-6 rounded border flex items-center justify-center text-xs">⭐</div>)}
                     </div>
                   )}
                 </div>
               ))}
               
               {globalQuestions.filter(q => q.status === "Aktif").length === 0 && questions.filter(q => q.status === "Aktif").length === 0 && (
                 <div className="text-center py-8 text-text-secondary">Tidak ada pertanyaan aktif yang akan ditampilkan.</div>
               )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsPreviewOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
