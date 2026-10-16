"use client";

import React, { useState, useMemo } from "react";
import { TaskItem, TaskPriority, TaskStatus } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Filter,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

interface TaskGanttChartProps {
  tasks: TaskItem[];
  loading?: boolean;
  onCardClick?: (task: TaskItem) => void;
}

export function TaskGanttChart({
  tasks,
  loading = false,
  onCardClick,
}: TaskGanttChartProps) {
  // Time scale
  const [viewMode, setViewMode] = useState<"weeks" | "months" | "quarters">("months");

  // Filters
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPic, setFilterPic] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Collapsible state (categories)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Extract unique filter options
  const uniqueCategories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks]
  );

  const uniquePics = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.picName).filter(Boolean) as string[])),
    [tasks]
  );

  const uniqueYears = useMemo(() => {
    const years = Array.from(
      new Set(
        tasks
          .map((t) => {
            const date = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
            return date.getFullYear().toString();
          })
          .filter(Boolean)
      )
    ).sort();
    const curYear = new Date().getFullYear().toString();
    if (!years.includes(curYear)) years.push(curYear);
    return years;
  }, [tasks]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const isAllExpanded = collapsedCategories.size === 0;

  const toggleAllExpandCollapse = () => {
    if (isAllExpanded) {
      setCollapsedCategories(new Set(uniqueCategories));
    } else {
      setCollapsedCategories(new Set());
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskDate = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
      const m = String(taskDate.getMonth() + 1).padStart(2, "0");
      const y = String(taskDate.getFullYear());

      if (filterMonth !== "all" && m !== filterMonth) return false;
      if (filterYear !== "all" && y !== filterYear) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPic !== "all" && t.picName !== filterPic) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;

      return true;
    });
  }, [tasks, filterMonth, filterYear, filterCategory, filterPic, filterPriority]);

  // Gantt Chart Mathematics
  const targetYear = filterYear === "all" ? new Date().getFullYear() : parseInt(filterYear);
  const minDate = new Date(targetYear, 0, 1);
  const maxDate = new Date(targetYear, 11, 31, 23, 59, 59);
  const totalYearMs = maxDate.getTime() - minDate.getTime();

  const today = new Date();
  const isTodayInYear = today.getFullYear() === targetYear;
  const todayLeft = Math.max(
    0,
    Math.min(100, ((today.getTime() - minDate.getTime()) / totalYearMs) * 100)
  );

  const timelineHeaders = useMemo(() => {
    if (viewMode === "months") {
      return ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"].map(
        (label) => ({ label })
      );
    } else if (viewMode === "quarters") {
      return ["Q1 (Jan - Mar)", "Q2 (Apr - Jun)", "Q3 (Jul - Sep)", "Q4 (Okt - Des)"].map((label) => ({
        label,
      }));
    } else if (viewMode === "weeks") {
      return Array.from({ length: 52 }).map((_, i) => ({ label: `W${i + 1}` }));
    }
    return [];
  }, [viewMode]);

  const timelineMinWidth =
    viewMode === "weeks"
      ? "min-w-[2400px]"
      : viewMode === "quarters"
      ? "min-w-[900px]"
      : "min-w-[1100px]";

  // Group tasks by category
  const groupedTasks = useMemo(() => {
    const groups: { [category: string]: TaskItem[] } = {};
    filteredTasks.forEach((t) => {
      const cat = t.category || "Umum";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    return groups;
  }, [filteredTasks]);

  // Category progress calculation
  const getCategoryProgress = (items: TaskItem[]) => {
    if (items.length === 0) return 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    items.forEach((item) => {
      if (item.status === "DONE") {
        totalPoints += 100;
        earnedPoints += 100;
      } else {
        totalPoints += 100;
        const totalSub = item.subtasks?.length || 0;
        if (totalSub > 0) {
          const completedSub = item.subtasks.filter((s) => s.isCompleted).length;
          earnedPoints += Math.round((completedSub / totalSub) * 100);
        } else if (item.status === "IN_PROGRESS") {
          earnedPoints += 40;
        } else if (item.status === "IN_REVIEW") {
          earnedPoints += 80;
        }
      }
    });

    return Math.round(earnedPoints / totalPoints);
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-lg font-bold text-navy">
            Gantt Chart / Timeline Tugas
          </CardTitle>
          <p className="text-xs text-text-secondary mt-0.5">
            Pantau durasi, rentang pengerjaan, dan tenggat waktu per kategori tugas.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Scale Buttons */}
          <div className="flex bg-muted/60 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode("weeks")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "weeks"
                  ? "bg-surface shadow-xs text-sky font-semibold"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              Weeks
            </button>
            <button
              onClick={() => setViewMode("months")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "months"
                  ? "bg-surface shadow-xs text-sky font-semibold"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              Months
            </button>
            <button
              onClick={() => setViewMode("quarters")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "quarters"
                  ? "bg-surface shadow-xs text-sky font-semibold"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              Quarters
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs text-text-secondary hover:text-navy gap-1.5 h-8"
            onClick={toggleAllExpandCollapse}
          >
            {isAllExpanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Collapse All
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> Expand All
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-8"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-3.5 w-3.5" /> Filter
          </Button>

          {/* Filter Popover */}
          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-[320px] z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h4 className="font-semibold text-navy text-xs flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" /> Filter Timeline
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary">Bulan</label>
                    <select
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    >
                      <option value="all">Semua Bulan</option>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = String(i + 1).padStart(2, "0");
                        return (
                          <option key={m} value={m}>
                            {new Date(2020, i, 1).toLocaleString("id-ID", { month: "long" })}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary">Tahun</label>
                    <select
                      className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="all">Semua</option>
                      {uniqueYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary">Kategori</label>
                  <select
                    className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">Semua Kategori</option>
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary">PIC</label>
                  <select
                    className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={filterPic}
                    onChange={(e) => setFilterPic(e.target.value)}
                  >
                    <option value="all">Semua PIC</option>
                    {uniquePics.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary">Prioritas</label>
                  <select
                    className="flex h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">Tinggi</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="LOW">Rendah</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
          <div className={`${timelineMinWidth} transition-all duration-300`}>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-text-secondary">
                Memuat data timeline...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-xs text-text-secondary border border-dashed rounded-xl">
                Tidak ada data tugas yang sesuai dengan filter.
              </div>
            ) : (
              <div className="relative border border-border/70 rounded-xl bg-background overflow-hidden shadow-2xs">
                {/* Table Header Header */}
                <div className="flex bg-[#0B2A4A] text-white text-xs font-semibold sticky top-0 z-30">
                  <div className="w-[320px] flex-shrink-0 p-3 border-r border-[#1a3855] flex items-center justify-between bg-[#0B2A4A] sticky left-0 z-40">
                    <span>Task / Aktivitas</span>
                    <span className="text-[10px] text-sky-light/80 font-normal">Kategori</span>
                  </div>
                  <div className="flex-1 flex">
                    {timelineHeaders.map((col, i) => (
                      <div
                        key={i}
                        className={`p-3 text-center border-[#1a3855] flex-1 ${
                          i !== timelineHeaders.length - 1 ? "border-r" : ""
                        }`}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body Container */}
                <div className="relative max-h-[550px] overflow-y-auto scrollbar-thin">
                  {/* Vertical Guidelines */}
                  <div className="absolute inset-0 left-[320px] flex pointer-events-none opacity-10">
                    {timelineHeaders.map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-full border-border ${
                          i !== timelineHeaders.length - 1 ? "border-r" : ""
                        }`}
                      />
                    ))}
                  </div>

                  {/* Today Marker Line */}
                  {isTodayInYear && (
                    <div className="absolute inset-0 left-[320px] pointer-events-none z-20">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-sky shadow-xs"
                        style={{ left: `${todayLeft}%` }}
                      >
                        <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-sky" />
                      </div>
                    </div>
                  )}

                  {/* Category Groups */}
                  <div className="space-y-0 relative z-10">
                    {Object.entries(groupedTasks).map(([catName, catTasks]) => {
                      const isCollapsed = collapsedCategories.has(catName);
                      const progress = getCategoryProgress(catTasks);

                      return (
                        <div key={catName} className="border-b border-border/60">
                          {/* Group Header Row */}
                          <div
                            onClick={() => toggleCategory(catName)}
                            className="bg-[#41556C] text-white text-xs px-4 py-2.5 font-medium flex items-center justify-between cursor-pointer hover:bg-[#34465B] transition-colors sticky left-0 z-20 min-w-max w-full select-none"
                          >
                            <div className="flex items-center gap-2 sticky left-4">
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                              )}
                              <span className="font-semibold text-sm">{catName}</span>
                              <Badge className="bg-sky/20 text-white border-transparent text-[10px] px-2">
                                {catTasks.length} Tugas
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 mr-4 sticky right-4">
                              <span className="text-[11px] text-white/80">Progres:</span>
                              <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="h-full bg-emerald-400 transition-all duration-500 ease-out"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold w-9 text-right">{progress}%</span>
                            </div>
                          </div>

                          {/* Task Rows inside category */}
                          {!isCollapsed && (
                            <div className="divide-y divide-border/30 bg-surface">
                              {catTasks.map((task) => {
                                const taskStart = task.startDate
                                  ? new Date(task.startDate).getTime()
                                  : task.createdAt
                                  ? new Date(task.createdAt).getTime()
                                  : minDate.getTime();

                                const taskEnd = task.dueDate
                                  ? new Date(task.dueDate).getTime()
                                  : taskStart + 3 * 24 * 60 * 60 * 1000;

                                const left = Math.max(
                                  0,
                                  Math.min(100, ((taskStart - minDate.getTime()) / totalYearMs) * 100)
                                );
                                const right = Math.max(
                                  0,
                                  Math.min(100, ((taskEnd - minDate.getTime()) / totalYearMs) * 100)
                                );
                                const width = Math.max(1, right - left);

                                const isOverdue =
                                  task.status !== "DONE" &&
                                  task.dueDate &&
                                  new Date(task.dueDate).getTime() < Date.now();

                                let barColor = "bg-sky";
                                if (task.status === "DONE") barColor = "bg-emerald-500";
                                else if (isOverdue) barColor = "bg-rose-500";
                                else if (task.priority === "URGENT" || task.priority === "HIGH")
                                  barColor = "bg-amber-500";

                                const totalSub = task.subtasks?.length || 0;
                                const completedSub =
                                  task.subtasks?.filter((s) => s.isCompleted).length || 0;
                                const taskProgress =
                                  task.status === "DONE"
                                    ? "100%"
                                    : totalSub > 0
                                    ? `${completedSub}/${totalSub}`
                                    : task.status === "IN_PROGRESS"
                                    ? "Proses"
                                    : "To Do";

                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => onCardClick?.(task)}
                                    className="flex group relative hover:bg-slate-50/70 transition-colors cursor-pointer"
                                  >
                                    {/* Task Name Label (Left Sticky Column) */}
                                    <div className="w-[320px] flex-shrink-0 p-3 pr-2 flex items-center justify-between bg-surface group-hover:bg-slate-50/70 border-r border-border/40 sticky left-0 z-10 transition-colors">
                                      <div className="truncate pr-2">
                                        <p
                                          className="text-xs font-semibold text-text-primary truncate group-hover:text-sky transition-colors"
                                          title={task.title}
                                        >
                                          • {task.title}
                                        </p>
                                        <p className="text-[10px] text-text-secondary truncate mt-0.5">
                                          {task.picName ? `PIC: ${task.picName}` : "Unassigned"}
                                        </p>
                                      </div>
                                      <span
                                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${
                                          task.status === "DONE"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : task.status === "IN_PROGRESS"
                                            ? "bg-sky-50 text-sky-700 border-sky-200"
                                            : task.status === "IN_REVIEW"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                      >
                                        {task.status}
                                      </span>
                                    </div>

                                    {/* Timeline Bar Area */}
                                    <div className="flex-1 relative bg-transparent h-12">
                                      <div
                                        className={`absolute h-7 rounded-md ${barColor} opacity-90 transition-all hover:opacity-100 hover:ring-2 hover:ring-white shadow-xs flex items-center justify-center z-10 top-2.5 px-2`}
                                        style={{
                                          left: `${left}%`,
                                          width: `${Math.max(width, 2.5)}%`,
                                        }}
                                        title={`${task.title} | Mulai: ${
                                          task.startDate
                                            ? new Date(task.startDate).toLocaleDateString("id-ID")
                                            : "-"
                                        } | Tenggat: ${
                                          task.dueDate
                                            ? new Date(task.dueDate).toLocaleDateString("id-ID")
                                            : "-"
                                        } | PIC: ${task.picName || "-"} | Status: ${task.status}`}
                                      >
                                        <span className="text-[10px] text-white font-medium truncate drop-shadow-xs">
                                          {taskProgress}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Legend */}
                <div className="flex flex-wrap items-center gap-4 p-3.5 border-t border-border/60 bg-slate-50/70 text-xs text-text-secondary justify-end">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Selesai
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky" /> On Track
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Priority
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
