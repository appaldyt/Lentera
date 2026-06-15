"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Training {
  name: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface TrainingTask {
  id: string;
  trainingId: string;
  activityName: string;
  category: string;
  dueDate: string;
  priority: string;
  pic: string;
  team: string;
  isCompleted: boolean;
  progress: string;
  linkOutput: string | null;
  note: string | null;
  order: number;
  createdAt: string;
  training: Training;
}

function MetricCard({ title, value, icon: Icon, colorClass, bgClass, description, loading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-navy">{loading ? "—" : value}</div>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function TrainingTasksDashboard() {
  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterPic, setFilterPic] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetch("/api/training-tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const date = new Date(t.dueDate);
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = String(date.getFullYear());

      if (filterMonth !== "all" && m !== filterMonth) return false;
      if (filterYear !== "all" && y !== filterYear) return false;
      if (filterTeam !== "all" && t.team !== filterTeam) return false;
      if (filterPic !== "all" && t.pic !== filterPic) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;

      return true;
    });
  }, [tasks, filterMonth, filterYear, filterTeam, filterPic, filterPriority]);

  const totalActive = filteredTasks.filter((t) => !t.isCompleted).length;
  const highPriority = filteredTasks.filter((t) => !t.isCompleted && (t.priority === "Urgent" || t.priority === "Important")).length;
  const overdue = filteredTasks.filter((t) => !t.isCompleted && new Date(t.dueDate) < new Date()).length;
  const completed = filteredTasks.filter((t) => t.isCompleted).length;

  // Extract unique options for filters
  const uniqueTeams = Array.from(new Set(tasks.map((t) => t.team))).filter(Boolean);
  const uniquePics = Array.from(new Set(tasks.map((t) => t.pic))).filter(Boolean);
  const uniqueYears = Array.from(new Set(tasks.map((t) => new Date(t.dueDate).getFullYear().toString()))).sort();
  if (!uniqueYears.includes(new Date().getFullYear().toString())) {
    uniqueYears.push(new Date().getFullYear().toString());
  }

  // Gantt Chart Logic - 12 Months Fixed View
  const targetYear = filterYear === "all" ? new Date().getFullYear() : parseInt(filterYear);
  const minDate = new Date(targetYear, 0, 1);
  const maxDate = new Date(targetYear, 11, 31, 23, 59, 59);
  
  const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Task & Timeline Dashboard</h2>
          <p className="text-sm text-text-secondary">Pantau seluruh persiapan training dan tenggat waktunya.</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4" /> Filter
          </Button>

          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-[320px] z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filter Tugas
                </h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Bulan</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    >
                      <option value="all">Semua</option>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = String(i + 1).padStart(2, "0");
                        return <option key={m} value={m}>{new Date(2020, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                      })}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondary">Tahun</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="all">Semua</option>
                      {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Team</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                  >
                    <option value="all">Semua Team</option>
                    {uniqueTeams.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">PIC</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterPic}
                    onChange={(e) => setFilterPic(e.target.value)}
                  >
                    <option value="all">Semua PIC</option>
                    {uniquePics.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Priority</label>
                    <select
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">Semua Prioritas</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Important">Important</option>
                      <option value="Normal">Normal</option>
                    </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Task Aktif"
          value={totalActive}
          icon={ListTodo}
          colorClass="text-sky-500"
          bgClass="bg-sky-50"
          description="Total persiapan belum selesai"
          loading={loading}
        />
        <MetricCard
          title="High Priority"
          value={highPriority}
          icon={AlertTriangle}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
          description="Perlu perhatian khusus"
          loading={loading}
        />
        <MetricCard
          title="Jatuh Tempo (Overdue)"
          value={overdue}
          icon={Clock}
          colorClass="text-rose-500"
          bgClass="bg-rose-50"
          description="Melewati tenggat waktu"
          loading={loading}
        />
        <MetricCard
          title="Selesai"
          value={completed}
          icon={CheckCircle2}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
          description="Task berhasil dituntaskan"
          loading={loading}
        />
      </div>

      {/* Gantt Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart / Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[1000px]">
              {loading ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-text-secondary">Memuat data timeline...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-text-secondary">Tidak ada data task yang sesuai filter.</div>
              ) : (
                <div className="relative border border-border/50 rounded-lg bg-background mt-6 overflow-hidden">
                  {/* Table-like Header */}
                  <div className="flex bg-[#0f2842] text-white text-xs font-medium">
                    <div className="w-[300px] flex-shrink-0 p-3 border-r border-[#1a3855] flex items-center justify-center">
                      Task / Aktivitas
                    </div>
                    <div className="flex-1 grid grid-cols-12">
                      {MONTH_LABELS.map((m, i) => (
                        <div key={m} className={`p-3 text-center border-[#1a3855] ${i !== 11 ? 'border-r' : ''}`}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body with Guidelines */}
                  <div className="relative">
                    {/* 12 Columns Background Lines */}
                    <div className="absolute inset-0 left-[300px] grid grid-cols-12 pointer-events-none opacity-10">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`h-full border-border ${i !== 11 ? 'border-r' : ''}`} />
                      ))}
                    </div>

                    <div className="space-y-0 relative z-10 pb-6">
                      {Array.from(new Set(filteredTasks.map(t => t.training.name))).map((trainingName) => {
                        const trainingTasks = filteredTasks
                          .filter(t => t.training.name === trainingName)
                          .sort((a, b) => a.order - b.order);

                        return (
                          <div key={trainingName}>
                            {/* Training Name Header Row */}
                            <div className="bg-[#4b6073] text-white text-sm px-4 py-2 font-medium border-b border-[#3b4e5f]">
                              {trainingName}
                            </div>
                            
                            <div className="space-y-0">
                              {trainingTasks.map((task) => {
                                const taskStart = new Date(task.createdAt).getTime();
                                const taskEnd = new Date(task.dueDate).getTime();
                                const left = Math.max(0, Math.min(100, ((taskStart - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100));
                                const right = Math.max(0, Math.min(100, ((taskEnd - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100));
                                const width = Math.max(1, right - left); // at least 1% wide
                                const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
                                
                                let barColor = "bg-sky-500";
                                if (task.isCompleted) barColor = "bg-emerald-500";
                                else if (isOverdue) barColor = "bg-rose-500";
                                else if (task.priority === "Urgent" || task.priority === "Important") barColor = "bg-amber-500";

                                return (
                                  <div key={task.id} className="flex group relative border-b border-border/40 hover:bg-slate-50/50">
                                    {/* Task Label */}
                                    <div className="w-[300px] flex-shrink-0 p-3 pr-2 flex items-center bg-white">
                                      <p className="text-sm font-medium text-navy line-clamp-2" title={task.activityName}>
                                        • {task.activityName}
                                      </p>
                                    </div>
                                    
                                    {/* Gantt Bar Area */}
                                    <div className="flex-1 grid grid-cols-12 relative bg-transparent">
                                      {Array.from({ length: 12 }).map((_, i) => {
                                        const taskMonth = new Date(task.dueDate).getMonth();
                                        const taskYear = new Date(task.dueDate).getFullYear();
                                        const isMatch = taskMonth === i && taskYear === targetYear;
                                        
                                        return (
                                          <div key={i} className="flex items-center justify-center py-2 relative h-10">
                                            {isMatch && (
                                              <div 
                                                className={`h-6 w-12 rounded ${barColor} opacity-90 transition-all hover:opacity-100 shadow-sm flex items-center justify-center cursor-default z-10`}
                                                title={`Due: ${new Date(task.dueDate).toLocaleDateString('id-ID')} - ${task.progress}`}
                                              >
                                                <span className="text-[10px] text-white font-medium px-1 truncate">
                                                  {task.progress}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                      </div>
                                    </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex gap-4 p-4 border-t border-border/50 bg-slate-50 text-xs text-text-secondary justify-end">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Selesai</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-sky-500" /> On Track</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /> High Priority</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500" /> Overdue</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
