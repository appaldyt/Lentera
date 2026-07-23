"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Filter, X, ChevronDown, ChevronRight, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { calculateOverallProgress } from "@/lib/utils";

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED": return <Badge variant="success" className="ml-2 bg-emerald-500 text-white border-transparent hover:bg-emerald-600">Completed</Badge>;
    case "PLANNING":  return <Badge variant="warning" className="ml-2 bg-amber-500 text-white border-transparent hover:bg-amber-600">Planning</Badge>;
    case "ONGOING":   return <Badge variant="default" className="ml-2 bg-sky-500 text-white border-transparent hover:bg-sky-600">Ongoing</Badge>;
    case "CANCELLED": return <Badge variant="danger" className="ml-2 bg-rose-500 text-white border-transparent hover:bg-rose-600">Cancelled</Badge>;
    default:          return <Badge variant="outline" className="ml-2 text-white border-white/30">{status}</Badge>;
  }
}

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
  startDate: string | null;
  dueDate: string;
  workHours: number;
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
  
  // Collapsible state
  const [collapsedTrainings, setCollapsedTrainings] = useState<Set<string>>(new Set());

  const toggleTraining = (trainingName: string) => {
    setCollapsedTrainings(prev => {
      const next = new Set(prev);
      if (next.has(trainingName)) {
        next.delete(trainingName);
      } else {
        next.add(trainingName);
      }
      return next;
    });
  };

  const uniqueTrainingNamesList = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.training.name)));
  }, [tasks]);

  const isAllExpanded = collapsedTrainings.size === 0;

  const toggleAllExpandCollapse = () => {
    if (isAllExpanded) {
      setCollapsedTrainings(new Set(uniqueTrainingNamesList));
    } else {
      setCollapsedTrainings(new Set());
    }
  };

  useEffect(() => {
    fetch("/api/training-tasks")
      .then((res) => res.json())
      .then((data) => {
        const fetchedTasks = data.tasks || [];
        setTasks(fetchedTasks);
        
        const uniqueTrainingNames = new Set<string>();
        fetchedTasks.forEach((t: TrainingTask) => uniqueTrainingNames.add(t.training.name));
        setCollapsedTrainings(uniqueTrainingNames);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const date = new Date(t.dueDate);
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = String(date.getFullYear());

      if (t.training.status === "CANCELLED") return false;

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

  const [viewMode, setViewMode] = useState<"weeks" | "months" | "quarters">("months");

  // Gantt Chart Logic - Dynamic Scale
  const targetYear = filterYear === "all" ? new Date().getFullYear() : parseInt(filterYear);
  const minDate = new Date(targetYear, 0, 1);
  const maxDate = new Date(targetYear, 11, 31, 23, 59, 59);
  const totalYearMs = maxDate.getTime() - minDate.getTime();
  
  const today = new Date();
  const isTodayInYear = today.getFullYear() === targetYear;
  const todayLeft = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / totalYearMs) * 100));

  const timelineHeaders = useMemo(() => {
    if (viewMode === "months") {
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(label => ({ label }));
    } else if (viewMode === "quarters") {
      return ["Q1", "Q2", "Q3", "Q4"].map(label => ({ label }));
    } else if (viewMode === "weeks") {
      return Array.from({ length: 52 }).map((_, i) => ({ label: `W${i + 1}` }));
    }
    return [];
  }, [viewMode]);

  const timelineMinWidth = viewMode === "weeks" ? "min-w-[2500px]" : viewMode === "quarters" ? "min-w-[800px]" : "min-w-[1000px]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Task & Timeline Dashboard</h2>
          <p className="text-sm text-text-secondary">Pantau seluruh persiapan training dan tenggat waktunya.</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border mr-2">
            <button 
              onClick={() => setViewMode("weeks")} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "weeks" ? "bg-white shadow-sm text-sky" : "text-text-secondary hover:text-navy"}`}
            >
              Weeks
            </button>
            <button 
              onClick={() => setViewMode("months")} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "months" ? "bg-white shadow-sm text-sky" : "text-text-secondary hover:text-navy"}`}
            >
              Months
            </button>
            <button 
              onClick={() => setViewMode("quarters")} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "quarters" ? "bg-white shadow-sm text-sky" : "text-text-secondary hover:text-navy"}`}
            >
              Quarters
            </button>
          </div>
          
          <Button variant="outline" className="gap-2 text-text-secondary hover:text-navy" onClick={toggleAllExpandCollapse}>
            {isAllExpanded ? (
              <><Minimize2 className="h-3.5 w-3.5" /> Collapse All</>
            ) : (
              <><Maximize2 className="h-3.5 w-3.5" /> Expand All</>
            )}
          </Button>

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
                      <option value="all">Semua Tahun</option>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                        <option key={y} value={y.toString()}>{y}</option>
                      ))}
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
            <div className={`${timelineMinWidth} transition-all duration-300`}>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-text-secondary">Memuat data timeline...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-text-secondary">Tidak ada data task yang sesuai filter.</div>
              ) : (
                <div className="relative border border-border/50 rounded-lg bg-background mt-6 overflow-y-auto overflow-x-hidden max-h-[500px] scrollbar-thin">
                  {/* Table-like Header */}
                  <div className="flex bg-[#0f2842] text-white text-xs font-medium sticky top-0 z-30">
                    <div className="w-[300px] flex-shrink-0 p-3 border-r border-[#1a3855] flex items-center justify-center bg-[#0f2842] sticky left-0 z-40">
                      Task / Aktivitas
                    </div>
                    <div className="flex-1 flex">
                      {timelineHeaders.map((col, i) => (
                        <div key={i} className={`p-3 text-center border-[#1a3855] flex-1 ${i !== timelineHeaders.length - 1 ? 'border-r' : ''}`}>
                          {col.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body with Guidelines */}
                  <div className="relative">
                    {/* Columns Background Lines */}
                    <div className="absolute inset-0 left-[300px] flex pointer-events-none opacity-10">
                      {timelineHeaders.map((_, i) => (
                        <div key={i} className={`flex-1 h-full border-border ${i !== timelineHeaders.length - 1 ? 'border-r' : ''}`} />
                      ))}
                    </div>

                    {/* Today Marker */}
                    {isTodayInYear && (
                      <div className="absolute inset-0 left-[300px] pointer-events-none z-20">
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-sky-500/80" 
                          style={{ left: `${todayLeft}%` }}
                        >
                          <div className="absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-500" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-0 relative z-10 pb-6">
                      {Array.from(new Map(filteredTasks.map(t => [t.training.name, t.training])).values())
                        .sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime())
                        .map((training) => {
                        const trainingName = training.name;
                        const trainingTasks = filteredTasks
                          .filter(t => t.training.name === trainingName)
                          .sort((a, b) => a.order - b.order);

                        const isCollapsed = collapsedTrainings.has(trainingName);

                        return (
                          <div key={trainingName}>
                            {/* Training Name Header Row */}
                            <div 
                              className="bg-[#4b6073] text-white text-sm px-4 py-2 font-medium border-b border-[#3b4e5f] flex items-center justify-between cursor-pointer hover:bg-[#3b4e5f] transition-colors sticky left-0 z-20 min-w-max w-full"
                              onClick={() => toggleTraining(trainingName)}
                            >
                              <div className="flex items-center sticky left-4">
                                {isCollapsed ? <ChevronRight className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                                {trainingName}
                                {getStatusBadge(training.status)}
                              </div>
                              <div className="flex items-center gap-2 mr-4 sticky right-4">
                                <span className="text-xs text-white/80">Progres:</span>
                                <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden shrink-0">
                                  <div 
                                    className="h-full bg-emerald-400 transition-all duration-500 ease-out" 
                                    style={{ width: `${calculateOverallProgress(trainingTasks)}%` }} 
                                  />
                                </div>
                                <span className="text-xs font-bold w-8 text-right">{calculateOverallProgress(trainingTasks)}%</span>
                              </div>
                            </div>
                            
                            {!isCollapsed && (
                              <div className="space-y-0">
                                {trainingTasks.map((task) => {
                                  // Timeline Bar Math
                                  const taskStart = new Date(task.startDate || task.createdAt).getTime();
                                  const taskEnd = new Date(task.dueDate).getTime();
                                  const left = Math.max(0, Math.min(100, ((taskStart - minDate.getTime()) / totalYearMs) * 100));
                                  const right = Math.max(0, Math.min(100, ((taskEnd - minDate.getTime()) / totalYearMs) * 100));
                                  const width = Math.max(0.5, right - left); // Ensure it's at least visible
                                  const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
                                  
                                  let barColor = "bg-sky-500";
                                  if (task.isCompleted) barColor = "bg-emerald-500";
                                  else if (isOverdue) barColor = "bg-rose-500";
                                  else if (task.priority === "Urgent" || task.priority === "Important") barColor = "bg-amber-500";

                                  return (
                                    <div key={task.id} className="flex group relative border-b border-border/40 hover:bg-slate-50/50">
                                      {/* Task Label */}
                                      <div className="w-[300px] flex-shrink-0 p-3 pr-2 flex items-center bg-white border-r border-border/20 sticky left-0 z-10">
                                        <p className="text-sm font-medium text-navy line-clamp-2" title={task.activityName}>
                                          • {task.activityName}
                                        </p>
                                      </div>
                                      
                                      {/* Gantt Bar Area */}
                                      <div className="flex-1 relative bg-transparent h-10">
                                        <div 
                                          className={`absolute h-6 rounded ${barColor} opacity-90 transition-all hover:opacity-100 shadow-sm flex items-center justify-center cursor-default z-10 top-2`}
                                          style={{ left: `${left}%`, width: `${width}%` }}
                                          title={`Start: ${task.startDate ? new Date(task.startDate).toLocaleDateString('id-ID') : '-'} | Due: ${new Date(task.dueDate).toLocaleDateString('id-ID')} | Estimasi: ${task.workHours || 0} Jam | Progres: ${task.progress}`}
                                        >
                                          {width > 3 && (
                                            <span className="text-[10px] text-white font-medium px-1 truncate">
                                              {task.progress}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
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
