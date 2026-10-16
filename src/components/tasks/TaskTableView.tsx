"use client";

import React from "react";
import { TaskItem, TaskPriority, TaskStatus } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  ExternalLink,
  CheckSquare,
} from "lucide-react";

interface TaskTableViewProps {
  tasks: TaskItem[];
  onCardClick: (task: TaskItem) => void;
  onEditCard: (task: TaskItem) => void;
  onDeleteCard: (id: string) => void;
}

export function TaskTableView({
  tasks,
  onCardClick,
  onEditCard,
  onDeleteCard,
}: TaskTableViewProps) {
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

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs">
      <Table>
        <TableHeader className="bg-slate-50/70">
          <TableRow>
            <TableHead className="w-[30%]">Tugas & Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead>PIC</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            <TableHead>Checklist</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-text-secondary text-xs">
                Tidak ada data tugas yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const status = getStatusBadge(task.status);
              const priority = getPriorityBadge(task.priority);
              const isOverdue =
                task.dueDate &&
                task.status !== "DONE" &&
                new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

              const totalSub = task.subtasks?.length || 0;
              const completedSub = task.subtasks?.filter((s) => s.isCompleted).length || 0;

              return (
                <TableRow key={task.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => onCardClick(task)}>
                  <TableCell>
                    <div className="font-semibold text-sm text-text-primary group-hover:text-sky">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-navy/5 text-navy border border-navy/10">
                        {task.category || "Umum"}
                      </span>
                      {task.linkOutput && (
                        <a
                          href={task.linkOutput}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky hover:underline text-[11px] inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Bukti Output
                        </a>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg}`}>
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${priority.bg}`}>
                      {priority.label}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-medium text-text-primary">
                      {task.picName || <span className="text-text-secondary/60 italic">-</span>}
                    </span>
                  </TableCell>

                  <TableCell>
                    {task.dueDate ? (
                      <span
                        className={`text-xs inline-flex items-center gap-1 ${
                          isOverdue ? "text-red-600 font-semibold" : "text-text-secondary"
                        }`}
                      >
                        {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                        {new Date(task.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-text-secondary/60 text-xs">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {totalSub > 0 ? (
                      <span className="text-xs text-text-secondary inline-flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-sky" /> {completedSub}/{totalSub}
                      </span>
                    ) : (
                      <span className="text-text-secondary/60 text-xs">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-text-secondary hover:text-navy"
                        onClick={() => onCardClick(task)}
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-text-secondary hover:text-navy"
                        onClick={() => onEditCard(task)}
                        title="Edit Tugas"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-text-secondary hover:text-red-600"
                        onClick={() => onDeleteCard(task.id)}
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
