"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskItem, TaskPriority, TaskStatus } from "./types";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface EmployeeOption {
  nik: string;
  name: string;
  division?: string;
  position?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TaskItem | null;
  defaultStatus?: TaskStatus;
  onSaved: (task: TaskItem) => void;
}

const CATEGORY_PRESETS = [
  "Umum",
  "Operasional",
  "GA (General Affairs)",
  "IT & Sistem",
  "HR & Kepegawaian",
  "Keuangan & Tagihan",
  "Fasilitas & Gedung",
  "Vendor & Pengadaan",
  "Legal & Sertifikasi",
];

export function TaskFormModal({
  isOpen,
  onClose,
  initialData,
  defaultStatus = "TODO",
  onSaved,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [category, setCategory] = useState("Umum");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [picName, setPicName] = useState("");
  const [picNik, setPicNik] = useState("");
  const [linkOutput, setLinkOutput] = useState("");
  const [subtasks, setSubtasks] = useState<{ title: string; isCompleted: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // Load employee options from /api/employees
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        if (data.employees) {
          setEmployees(data.employees);
        }
      } catch (err) {
        console.error("Gagal load karyawan:", err);
      }
    }
    fetchEmployees();
  }, []);

  // Initialize form when opened or initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "TODO");
      setPriority(initialData.priority || "MEDIUM");
      setCategory(initialData.category || "Umum");
      setStartDate(
        initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : ""
      );
      setDueDate(
        initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : ""
      );
      setPicName(initialData.picName || "");
      setPicNik(initialData.picNik || "");
      setLinkOutput(initialData.linkOutput || "");
      setSubtasks(
        initialData.subtasks?.map((st) => ({
          title: st.title,
          isCompleted: st.isCompleted,
        })) || []
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus);
      setPriority("MEDIUM");
      setCategory("Umum");
      setStartDate("");
      setDueDate("");
      setPicName("");
      setPicNik("");
      setLinkOutput("");
      setSubtasks([]);
    }
    setSubtaskInput("");
  }, [initialData, defaultStatus, isOpen]);

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { title: subtaskInput.trim(), isCompleted: false }]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handlePicSelect = (selectedVal: string) => {
    if (selectedVal === "NONE") {
      setPicName("");
      setPicNik("");
      return;
    }
    const emp = employees.find((e) => e.nik === selectedVal);
    if (emp) {
      setPicName(emp.name);
      setPicNik(emp.nik);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        category: category.trim() || "Umum",
        startDate: startDate || null,
        dueDate: dueDate || null,
        picName: picName || null,
        picNik: picNik || null,
        linkOutput: linkOutput.trim() || null,
        subtasks,
      };

      const url = initialData ? `/api/tasks/${initialData.id}` : "/api/tasks";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.task) {
        onSaved(data.task);
        onClose();
      }
    } catch (err) {
      console.error("Gagal simpan tugas:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary">
            {initialData ? "Edit Tugas Operasional" : "Tambah Tugas Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul Tugas */}
          <div>
            <Label htmlFor="title" className="text-xs font-semibold text-text-primary">
              Judul Tugas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Pembaruan SOP Operasional Ruangan Lab"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <Label htmlFor="description" className="text-xs font-semibold text-text-primary">
              Deskripsi / Keterangan
            </Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail instruksi, kebutuhan, atau konteks tugas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Status & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-text-primary">Status Kolom</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">📋 To Do (Belum Dikerjakan)</SelectItem>
                  <SelectItem value="IN_PROGRESS">⏳ In Progress (Sedang Dikerjakan)</SelectItem>
                  <SelectItem value="IN_REVIEW">🔍 In Review (Menunggu Validasi)</SelectItem>
                  <SelectItem value="DONE">✅ Selesai (Done)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-text-primary">Tingkat Prioritas</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Rendah (Low)</SelectItem>
                  <SelectItem value="MEDIUM">🔵 Sedang (Medium)</SelectItem>
                  <SelectItem value="HIGH">🟠 Tinggi (High)</SelectItem>
                  <SelectItem value="URGENT">🔴 Mendesak (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kategori & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-text-primary">Kategori Tugas</Label>
              <div className="flex gap-1.5 mt-1">
                <Input
                  list="category-suggestions"
                  placeholder="Ketik atau pilih kategori..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <datalist id="category-suggestions">
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <Label htmlFor="picName" className="text-xs font-semibold text-text-primary">
                Penanggung Jawab (PIC)
              </Label>
              <div className="mt-1">
                <Input
                  id="picName"
                  list="pic-suggestions"
                  placeholder="Ketik nama PIC bebas atau pilih karyawan..."
                  value={picName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPicName(val);
                    const matched = employees.find(
                      (emp) => emp.name.toLowerCase() === val.toLowerCase()
                    );
                    if (matched) {
                      setPicNik(matched.nik);
                    } else {
                      setPicNik("");
                    }
                  }}
                />
                <datalist id="pic-suggestions">
                  {employees.map((emp) => (
                    <option key={emp.nik} value={emp.name}>
                      {emp.division ? `${emp.name} - ${emp.division}` : emp.name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Tanggal Mulai & Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-xs font-semibold text-text-primary">
                Tanggal Mulai (Opsional)
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-xs font-semibold text-text-primary">
                Tenggat Waktu / Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Link Output / Dokumen */}
          <div>
            <Label htmlFor="linkOutput" className="text-xs font-semibold text-text-primary">
              Link Bukti Output / Lampiran Dokumen
            </Label>
            <Input
              id="linkOutput"
              type="url"
              placeholder="https://drive.google.com/... atau tautan file"
              value={linkOutput}
              onChange={(e) => setLinkOutput(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Checklist / Subtask Section */}
          <div className="pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-text-primary block mb-2">
              Checklist / Subtask
            </Label>

            {/* List of current subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky" />
                      <span className="font-medium text-text-primary">{st.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Item subtask baru..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </div>

          {/* Footer Form Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat Tugas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
