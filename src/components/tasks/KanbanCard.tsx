"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem, TaskPriority } from "./types";
import {
  Calendar,
  CheckSquare,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanCardProps {
  task: TaskItem;
  onClick: (task: TaskItem) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onQuickMove?: (id: string, newStatus: TaskItem["status"]) => void;
  isOverlay?: boolean;
}

export function KanbanCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onQuickMove,
  isOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          className: "bg-red-50 text-red-700 border-red-200 font-semibold",
          dot: "bg-red-500",
        };
      case "HIGH":
        return {
          label: "Tinggi",
          className: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
          dot: "bg-amber-500",
        };
      case "MEDIUM":
        return {
          label: "Sedang",
          className: "bg-sky-50 text-sky-700 border-sky-200 font-medium",
          dot: "bg-sky",
        };
      case "LOW":
      default:
        return {
          label: "Rendah",
          className: "bg-slate-50 text-slate-600 border-slate-200 font-normal",
          dot: "bg-slate-400",
        };
    }
  };

  const priorityStyle = getPriorityBadge(task.priority);

  // Check Overdue
  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
    : null;

  // Subtask progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((st) => st.isCompleted).length || 0;
  const subtaskProgress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Avatar Initials
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`group relative rounded-xl border bg-surface p-4 shadow-xs transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-30 border-dashed border-sky" : "border-border hover:border-sky/40"
      } ${isOverlay ? "rotate-2 shadow-xl ring-2 ring-sky/50 scale-105" : ""}`}
    >
      {/* Top row: Category tag & Priority badge & Action dropdown */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-navy/5 text-navy border border-navy/10">
            {task.category || "Umum"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${priorityStyle.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
            {priorityStyle.label}
          </span>
        </div>

        {/* Dropdown Menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-text-secondary hover:bg-navy/5 hover:text-navy"
                title="Pilihan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onClick(task)}>
                <CheckSquare className="w-4 h-4 mr-2" /> Detail Tugas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Tugas
              </DropdownMenuItem>
              {onQuickMove && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Pindah ke
                  </div>
                  {task.status !== "TODO" && (
                    <DropdownMenuItem onClick={() => onQuickMove(task.id, "TODO")}>
                      📋 To Do
                    </DropdownMenuItem>
                  )}
                  {task.status !== "IN_PROGRESS" && (
                    <DropdownMenuItem onClick={() => onQuickMove(task.id, "IN_PROGRESS")}>
                      ⏳ In Progress
                    </DropdownMenuItem>
                  )}
                  {task.status !== "IN_REVIEW" && (
                    <DropdownMenuItem onClick={() => onQuickMove(task.id, "IN_REVIEW")}>
                      🔍 In Review
                    </DropdownMenuItem>
                  )}
                  {task.status !== "DONE" && (
                    <DropdownMenuItem onClick={() => onQuickMove(task.id, "DONE")}>
                      ✅ Selesai
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug mb-1.5 group-hover:text-sky transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar (if exists) */}
      {totalSubtasks > 0 && (
        <div className="mb-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1">
            <span className="flex items-center gap-1 font-medium">
              <CheckSquare className="w-3 h-3 text-sky" /> Checklist
            </span>
            <span>
              {completedSubtasks}/{totalSubtasks} ({subtaskProgress}%)
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                subtaskProgress === 100 ? "bg-emerald-500" : "bg-sky"
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-text-secondary">
        {/* Due Date & Attachment */}
        <div className="flex items-center gap-2">
          {formattedDueDate && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                isOverdue
                  ? "bg-red-50 text-red-600 font-semibold"
                  : "bg-surface text-text-secondary"
              }`}
              title={isOverdue ? "Tugas Melewati Jatuh Tempo!" : "Tenggat Waktu"}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
              ) : (
                <Clock className="w-3 h-3 text-text-secondary shrink-0" />
              )}
              {formattedDueDate}
            </span>
          )}

          {task.linkOutput && (
            <a
              href={task.linkOutput}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sky hover:text-sky-light p-0.5 transition-colors"
              title="Buka Link Output/Dokumen"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* PIC Avatar */}
        {task.picName ? (
          <div
            className="flex items-center gap-1.5 max-w-[120px]"
            title={`PIC: ${task.picName}`}
          >
            <div className="w-5 h-5 rounded-full bg-navy/10 text-navy font-bold text-[10px] flex items-center justify-center shrink-0 border border-navy/20">
              {getInitials(task.picName)}
            </div>
            <span className="text-[11px] font-medium text-text-primary truncate">
              {task.picName.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-text-secondary/60 italic flex items-center gap-1">
            <UserIcon className="w-3 h-3" /> Unassigned
          </span>
        )}
      </div>
    </div>
  );
}
