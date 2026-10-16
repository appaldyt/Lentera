"use client";

import React from "react";
import { TaskItem } from "./types";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Columns3,
  CalendarRange,
  Table as TableIcon,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskStatsHeaderProps {
  tasks: TaskItem[];
  viewMode: "board" | "gantt" | "table";
  onViewModeChange: (mode: "board" | "gantt" | "table") => void;
  onAddNew: () => void;
}

export function TaskStatsHeader({
  tasks,
  viewMode,
  onViewModeChange,
  onAddNew,
}: TaskStatsHeaderProps) {
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false;
    return new Date(t.dueDate).setHours(23, 59, 59, 999) < Date.now();
  }).length;

  return (
    <div className="space-y-4">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Manajemen Tugas
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola dan pantau seluruh aktivitas, proyek, dan tugas operasional non-training.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="inline-flex items-center rounded-lg border border-border bg-surface p-1 shadow-2xs">
            <button
              onClick={() => onViewModeChange("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-navy text-surface shadow-xs"
                  : "text-text-secondary hover:text-navy hover:bg-slate-100"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange("gantt")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "gantt"
                  ? "bg-navy text-surface shadow-xs"
                  : "text-text-secondary hover:text-navy hover:bg-slate-100"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Gantt</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-navy text-surface shadow-xs"
                  : "text-text-secondary hover:text-navy hover:bg-slate-100"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <Button onClick={onAddNew} className="gap-1.5 text-xs shadow-xs">
            <Plus className="w-4 h-4" /> Tambah Tugas
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Tasks */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary">Total Tugas</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{totalTasks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary">Sedang Dikerjakan</p>
            <p className="text-2xl font-bold text-sky mt-1">{inProgressTasks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky/10 text-sky flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary">Jatuh Tempo</p>
            <p className={`text-2xl font-bold mt-1 ${overdueTasks > 0 ? "text-red-600" : "text-text-primary"}`}>
              {overdueTasks}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            overdueTasks > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary">Selesai</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedTasks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
