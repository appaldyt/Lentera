"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getEvaluationQuestions, createEvaluationQuestion, updateEvaluationQuestion, deleteEvaluationQuestion } from "@/actions/evaluation-questions";
import { useEffect } from "react";

export default function EvaluasiAdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    status: "Aktif"
  });

  const fetchQuestions = async () => {
    setIsLoading(true);
    const data = await getEvaluationQuestions();
    setQuestions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: "", text: "", status: "Aktif" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (q: any) => {
    setEditingId(q.id);
    setFormData({ title: q.title, text: q.text, status: q.status });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.text) return;
    setIsSaving(true);
    
    if (editingId) {
      await updateEvaluationQuestion(editingId, formData);
    } else {
      await createEvaluationQuestion(formData);
    }
    
    await fetchQuestions();
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus pertanyaan ini?")) {
      await deleteEvaluationQuestion(id);
      await fetchQuestions();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Manajemen Pertanyaan</h1>
          <p className="mt-2 text-text-secondary">
            Kelola daftar kriteria dan pertanyaan yang akan ditampilkan di Form Evaluasi Atasan.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-navy hover:bg-navy-dark text-surface gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pertanyaan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pertanyaan Evaluasi</CardTitle>
          <CardDescription>Total {questions.length} pertanyaan terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium w-12 text-center">No</th>
                  <th className="px-4 py-3 font-medium w-48">Judul Kriteria</th>
                  <th className="px-4 py-3 font-medium">Teks Pertanyaan</th>
                  <th className="px-4 py-3 font-medium w-24">Status</th>
                  <th className="px-4 py-3 font-medium text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, index) => (
                  <tr key={q.id} className="border-b border-border hover:bg-slate-50/50">
                    <td className="px-4 py-4 text-center font-medium text-navy">{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-navy">{q.title}</td>
                    <td className="px-4 py-4 text-text-secondary">{q.text}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={q.status === 'Aktif' ? 'bg-success/10 text-success-dark border-success/20' : 'bg-slate-100 text-text-secondary border-border'}>
                        {q.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(q)}
                          className="h-8 w-8 text-sky hover:text-sky-dark hover:bg-sky/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(q.id)}
                          className="h-8 w-8 text-danger hover:text-danger-dark hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-navy">
              {editingId ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form untuk menambah atau mengubah pertanyaan evaluasi.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-text-secondary">Judul Kriteria</span>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Kualitas Kerja"
                className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
              />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-text-secondary">Teks Pertanyaan</span>
              <Textarea 
                value={formData.text} 
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Tuliskan deskripsi lengkap kriteria evaluasi..."
                className="min-h-[100px] bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-text-secondary">Status</span>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger className="w-full bg-white border-slate-300 text-navy focus:ring-sky focus:border-sky data-[state=open]:border-sky">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="text-sky border-sky hover:bg-sky/5 font-medium"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.title || !formData.text || isSaving}
              className="bg-sky hover:bg-[#1565C0] text-white font-medium"
            >
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
