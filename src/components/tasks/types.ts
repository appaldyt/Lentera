export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskSubtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  startDate: string | null;
  dueDate: string | null;
  picName: string | null;
  picNik: string | null;
  order: number;
  linkOutput: string | null;
  subtasks: TaskSubtask[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumnDef {
  id: TaskStatus;
  title: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  accentColor: string;
}

export interface TaskFilters {
  search: string;
  priority: string;
  category: string;
  pic: string;
}
