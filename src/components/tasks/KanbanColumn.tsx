"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumnDef, TaskItem, TaskStatus } from "./types";
import { Plus, Inbox } from "lucide-react";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  tasks: TaskItem[];
  onCardClick: (task: TaskItem) => void;
  onEditCard: (task: TaskItem) => void;
  onDeleteCard: (id: string) => void;
  onQuickMove: (id: string, newStatus: TaskStatus) => void;
  onAddNew: (status: TaskStatus) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onCardClick,
  onEditCard,
  onDeleteCard,
  onQuickMove,
  onAddNew,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-100/70 border transition-colors duration-200 min-w-[280px] w-full max-w-[340px] shrink-0 h-[calc(100vh-230px)] min-h-[500px] ${
        isOver
          ? "border-sky bg-sky/5 ring-2 ring-sky/20"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200/80 bg-surface/80 backdrop-blur-xs rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: column.accentColor }}
          />
          <h3 className="font-semibold text-sm text-text-primary">
            {column.title}
          </h3>
          <span
            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: column.badgeBg,
              color: column.color,
            }}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddNew(column.id)}
          className="p-1 rounded-lg text-text-secondary hover:text-navy hover:bg-slate-200/60 transition-colors"
          title={`Tambah tugas di ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Scrollable Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={onCardClick}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onQuickMove={onQuickMove}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div
            onClick={() => onAddNew(column.id)}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300/80 rounded-xl p-6 text-center cursor-pointer hover:border-sky/60 hover:bg-surface/50 transition-all duration-150 group my-2 min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-text-secondary group-hover:bg-sky/10 group-hover:text-sky transition-colors mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-text-secondary group-hover:text-sky">
              Belum ada tugas
            </p>
            <p className="text-[11px] text-text-secondary/70 mt-0.5">
              Klik untuk tambah tugas baru
            </p>
          </div>
        )}
      </div>

      {/* Column Footer Quick Add */}
      <div className="p-2 border-t border-slate-200/60 bg-surface/40 rounded-b-2xl">
        <button
          onClick={() => onAddNew(column.id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-text-secondary hover:text-navy hover:bg-surface transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tugas</span>
        </button>
      </div>
    </div>
  );
}
