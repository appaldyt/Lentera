"use client";

import React, { useState, useEffect } from "react";
import { TaskItem } from "@/components/tasks/types";
import { TaskGanttChart } from "@/components/tasks/TaskGanttChart";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ListTodo,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Columns3,
  CalendarRange,
} from "lucide-react";
import Link from "next/link";

export default function TaskTimelinePage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Gagal mengambil data tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalActive = tasks.filter((t) => t.status !== "DONE").length;
  const highPriority = tasks.filter(
    (t) => t.status !== "DONE" && (t.priority === "URGENT" || t.priority === "HIGH")
  ).length;
  const overdue = tasks.filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false;
    return new Date(t.dueDate).setHours(23, 59, 59, 999) < Date.now();
  }).length;
  const completed = tasks.filter((t) => t.status === "DONE").length;

  const handleCardClick = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleEditCard = (task: TaskItem) => {
    setEditingTask(task);
    setFormModalOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Gagal menghapus tugas:", err);
      fetchTasks();
    }
  };

  const handleTaskSaved = (savedTask: TaskItem) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
      } else {
        return [savedTask, ...prev];
      }
    });

    if (selectedTask && selectedTask.id === savedTask.id) {
      setSelectedTask(savedTask);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Timeline & Gantt Tugas
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Pantau seluruh jadwal, tenggat waktu, dan rentang pengerjaan tugas operasional non-training.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick link to Kanban Board */}
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-text-secondary hover:text-navy">
              <Columns3 className="w-3.5 h-3.5" />
              <span>Lihat Kanban Board</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setFormModalOpen(true);
            }}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Tugas
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              Total Task Aktif
            </CardTitle>
            <div className="p-2 rounded-lg bg-sky-50">
              <ListTodo className="h-4 w-4 text-sky" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{loading ? "—" : totalActive}</div>
            <p className="text-[11px] text-text-secondary mt-0.5">Tugas belum selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              High Priority
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{loading ? "—" : highPriority}</div>
            <p className="text-[11px] text-text-secondary mt-0.5">Perlu perhatian khusus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              Jatuh Tempo (Overdue)
            </CardTitle>
            <div
              className={`p-2 rounded-lg ${
                overdue > 0 ? "bg-rose-50 text-rose-500" : "bg-slate-100 text-slate-400"
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                overdue > 0 ? "text-rose-600" : "text-navy"
              }`}
            >
              {loading ? "—" : overdue}
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5">Melewati tenggat waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-text-secondary">
              Selesai
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{loading ? "—" : completed}</div>
            <p className="text-[11px] text-text-secondary mt-0.5">Tugas berhasil diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Gantt Chart Component */}
      <TaskGanttChart
        tasks={tasks}
        loading={loading}
        onCardClick={handleCardClick}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
        onTaskUpdated={(updated) => {
          handleTaskSaved(updated);
          setSelectedTask(updated);
        }}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        defaultStatus="TODO"
        onSaved={handleTaskSaved}
      />
    </div>
  );
}
