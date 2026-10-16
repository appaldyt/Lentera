"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TaskItem, TaskStatus, TaskFilters } from "@/components/tasks/types";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskStatsHeader } from "@/components/tasks/TaskStatsHeader";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { TaskTableView } from "@/components/tasks/TaskTableView";
import { TaskGanttChart } from "@/components/tasks/TaskGanttChart";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Loader2 } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "gantt" | "table">("board");

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    priority: "ALL",
    category: "ALL",
    pic: "ALL",
  });

  // Modals State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<TaskStatus>("TODO");

  // Fetch tasks
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

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) || false;
        const matchesPic = t.picName?.toLowerCase().includes(query) || false;
        const matchesCat = t.category.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesPic && !matchesCat) {
          return false;
        }
      }

      // Priority
      if (filters.priority !== "ALL" && t.priority !== filters.priority) {
        return false;
      }

      // Category
      if (filters.category !== "ALL" && t.category !== filters.category) {
        return false;
      }

      // PIC
      if (filters.pic !== "ALL" && t.picName !== filters.pic) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Handlers
  const handleAddNew = (status: TaskStatus = "TODO") => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setFormModalOpen(true);
  };

  const handleEditCard = (task: TaskItem) => {
    setEditingTask(task);
    setFormModalOpen(true);
  };

  const handleCardClick = (task: TaskItem) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Gagal menghapus tugas:", err);
      fetchTasks(); // rollback if error
    }
  };

  const handleQuickMove = async (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Gagal memindahkan tugas:", err);
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

  const handleResetFilters = () => {
    setFilters({
      search: "",
      priority: "ALL",
      category: "ALL",
      pic: "ALL",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
      {/* Header & KPI Summary */}
      <TaskStatsHeader
        tasks={tasks}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddNew={() => handleAddNew("TODO")}
      />

      {/* Filter Bar */}
      <TaskFilterBar
        tasks={tasks}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 rounded-2xl bg-surface border border-border">
          <Loader2 className="w-8 h-8 text-sky animate-spin mb-2" />
          <p className="text-xs text-text-secondary">Memuat data papan tugas...</p>
        </div>
      ) : viewMode === "board" ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTasksChange={(updated) => setTasks(updated)}
          onCardClick={handleCardClick}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onAddNew={handleAddNew}
          onQuickMove={handleQuickMove}
        />
      ) : viewMode === "gantt" ? (
        <TaskGanttChart
          tasks={filteredTasks}
          onCardClick={handleCardClick}
        />
      ) : (
        <TaskTableView
          tasks={filteredTasks}
          onCardClick={handleCardClick}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

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

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask}
        defaultStatus={defaultColumnStatus}
        onSaved={handleTaskSaved}
      />
    </div>
  );
}
