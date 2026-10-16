"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumnDef, TaskItem, TaskStatus } from "./types";

const COLUMNS: KanbanColumnDef[] = [
  {
    id: "TODO",
    title: "To Do",
    color: "#475569",
    badgeBg: "#e2e8f0",
    borderColor: "#cbd5e1",
    accentColor: "#64748b",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "#0369a1",
    badgeBg: "#e0f2fe",
    borderColor: "#bae6fd",
    accentColor: "#1E88E5",
  },
  {
    id: "IN_REVIEW",
    title: "In Review",
    color: "#b45309",
    badgeBg: "#fef3c7",
    borderColor: "#fde68a",
    accentColor: "#f59e0b",
  },
  {
    id: "DONE",
    title: "Selesai",
    color: "#15803d",
    badgeBg: "#dcfce7",
    borderColor: "#bbf7d0",
    accentColor: "#22c55e",
  },
];

interface KanbanBoardProps {
  tasks: TaskItem[];
  onTasksChange: (tasks: TaskItem[]) => void;
  onCardClick: (task: TaskItem) => void;
  onEditCard: (task: TaskItem) => void;
  onDeleteCard: (id: string) => void;
  onAddNew: (status: TaskStatus) => void;
  onQuickMove: (id: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  onTasksChange,
  onCardClick,
  onEditCard,
  onDeleteCard,
  onAddNew,
  onQuickMove,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string): TaskStatus | null => {
    // If id is directly a column id
    if (COLUMNS.some((col) => col.id === id)) {
      return id as TaskStatus;
    }
    // Find task
    const task = tasks.find((t) => t.id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move task to new container optimistically
    const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
    if (activeTaskIndex === -1) return;

    const updatedTasks = [...tasks];
    updatedTasks[activeTaskIndex] = {
      ...updatedTasks[activeTaskIndex],
      status: overContainer,
    };

    onTasksChange(updatedTasks);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    let overIndex = tasks.findIndex((t) => t.id === overId);

    let updatedTasks = [...tasks];

    if (activeIndex !== -1) {
      if (activeContainer === overContainer) {
        if (overIndex !== -1 && activeIndex !== overIndex) {
          updatedTasks = arrayMove(updatedTasks, activeIndex, overIndex);
        }
      } else {
        // Moved to different column
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          status: overContainer,
        };
      }
    }

    // Recalculate order numbers within each column
    const reorderedItems: { id: string; status: TaskStatus; order: number }[] = [];
    COLUMNS.forEach((col) => {
      const colTasks = updatedTasks.filter((t) => t.status === col.id);
      colTasks.forEach((t, idx) => {
        t.order = idx;
        reorderedItems.push({ id: t.id, status: col.id, order: idx });
      });
    });

    onTasksChange(updatedTasks);

    // Sync to backend via batch reorder API
    try {
      await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedItems }),
      });
    } catch (err) {
      console.error("Failed to sync drag & drop reorder:", err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.order - b.order);

          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onCardClick={onCardClick}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onQuickMove={onQuickMove}
              onAddNew={onAddNew}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            onClick={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
