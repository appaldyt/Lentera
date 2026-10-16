"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskItem, TaskStatus, TaskPriority, TaskSubtask } from "./types";
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onTaskUpdated: (updatedTask: TaskItem) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  if (!task) return null;

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const handleToggleSubtask = async (subtask: TaskSubtask) => {
    const newCompleted = !subtask.isCompleted;

    // Optimistic update
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtask.id ? { ...st, isCompleted: newCompleted } : st
    );
    const updatedTask = { ...task, subtasks: updatedSubtasks };
    onTaskUpdated(updatedTask);

    try {
      await fetch(`/api/tasks/${task.id}/subtasks/${subtask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newCompleted }),
      });
    } catch (err) {
      console.error("Gagal update subtask:", err);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const titleToAdd = newSubtaskTitle.trim();
    setNewSubtaskTitle("");
    setIsAddingSubtask(true);

    const updatedSubtasksList = [
      ...task.subtasks.map((st) => ({
        title: st.title,
        isCompleted: st.isCompleted,
      })),
      { title: titleToAdd, isCompleted: false },
    ];

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtasks: updatedSubtasksList }),
      });
      const data = await res.json();
      if (data.task) {
        onTaskUpdated(data.task);
      }
    } catch (err) {
      console.error("Gagal menambah subtask:", err);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    // Optimistic update
    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    onTaskUpdated({ ...task, subtasks: updatedSubtasks });

    try {
      await fetch(`/api/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Gagal hapus subtask:", err);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "TODO":
        return { label: "To Do", bg: "bg-slate-100 text-slate-700 border-slate-200" };
      case "IN_PROGRESS":
        return { label: "In Progress", bg: "bg-sky-50 text-sky-700 border-sky-200" };
      case "IN_REVIEW":
        return { label: "In Review", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "DONE":
        return { label: "Selesai", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return { label: "Urgent", bg: "bg-red-50 text-red-700 border-red-200" };
      case "HIGH":
        return { label: "Tinggi", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      case "MEDIUM":
        return { label: "Sedang", bg: "bg-sky-50 text-sky-700 border-sky-200" };
      case "LOW":
        return { label: "Rendah", bg: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((st) => st.isCompleted).length || 0;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
            >
              {statusBadge.label}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityBadge.bg}`}
            >
              Prioritas {priorityBadge.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy/5 text-navy border border-navy/10">
              <Tag className="w-3 h-3" /> {task.category || "Umum"}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-text-primary text-left">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-border text-xs">
            {/* PIC */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-text-secondary">Penanggung Jawab (PIC)</p>
                <p className="font-semibold text-text-primary">
                  {task.picName || "Belum ditugaskan"}
                </p>
              </div>
            </div>

            {/* Tenggat Waktu */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  isOverdue ? "bg-red-100 text-red-600" : "bg-sky/10 text-sky"
                }`}
              >
                {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-[11px] text-text-secondary">Jatuh Tempo</p>
                <p
                  className={`font-semibold ${
                    isOverdue ? "text-red-600" : "text-text-primary"
                  }`}
                >
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Tidak ada tenggat"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Deskripsi Tugas
            </h4>
            <div className="p-3.5 rounded-xl bg-surface border border-border text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {task.description || (
                <span className="text-text-secondary/60 italic">
                  Tidak ada deskripsi rinci.
                </span>
              )}
            </div>
          </div>

          {/* Link Output / Dokumen Pendukung */}
          {task.linkOutput && (
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Link Output / Dokumen
              </h4>
              <a
                href={task.linkOutput}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky/5 text-sky hover:bg-sky/10 border border-sky/20 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="truncate max-w-sm">{task.linkOutput}</span>
              </a>
            </div>
          )}

          {/* Subtasks / Checklist Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Checklist / Subtask ({completedSubtasks}/{totalSubtasks})
              </h4>
              {totalSubtasks > 0 && (
                <span className="text-xs font-bold text-sky">
                  {progressPercent}%
                </span>
              )}
            </div>

            {totalSubtasks > 0 && (
              <div className="w-full bg-border rounded-full h-2 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent === 100 ? "bg-emerald-500" : "bg-sky"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Checklist List */}
            <div className="space-y-1.5 mb-3">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-border"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st)}
                    className="flex items-center gap-2.5 text-left text-sm flex-1 cursor-pointer"
                  >
                    {st.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-sky" />
                    )}
                    <span
                      className={`${
                        st.isCompleted
                          ? "line-through text-text-secondary/60"
                          : "text-text-primary font-medium"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                    title="Hapus subtask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah item checklist baru..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-surface focus:outline-none focus:ring-1 focus:ring-sky"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!newSubtaskTitle.trim() || isAddingSubtask}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </form>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Tugas
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
            >
              <Pencil className="w-4 h-4 mr-1.5" /> Edit Tugas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
