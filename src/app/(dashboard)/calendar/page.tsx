"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutList } from "lucide-react";

interface TrainingEvent {
  id: string;
  title: string;
  type: string;
  start: string;
  end?: string;
  backgroundColor: string;
  status: string;
}

function statusToColor(status: string): string {
  switch (status) {
    case "COMPLETED": return "#10b981"; // emerald-500 (success)
    case "PLANNING":  return "#f59e0b"; // amber-500 (warning)
    case "ONGOING":   return "#0ea5e9"; // sky-500
    case "CANCELLED": return "#f43f5e"; // rose-500 (danger)
    default:          return "#64748b"; // slate-500
  }
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetch("/api/trainings")
      .then((res) => res.json())
      .then((json) => {
        const trainings: {
          id: string;
          name: string;
          trainingType: string;
          startDate: string | null;
          endDate: string | null;
          status: string;
        }[] = json.trainings ?? [];

        setEvents(
          trainings
            .filter((t) => t.startDate)
            .map((t) => ({
              id: t.id,
              title: t.name,
              type: t.trainingType,
              start: t.startDate!,
              end: t.endDate ?? undefined,
              backgroundColor: statusToColor(t.status),
              status: t.status,
            }))
        );
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "classic") {
      const timer = setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const currentYear = new Date().getFullYear();
  const dbYears = events.map((e) => new Date(e.start).getFullYear().toString());
  const windowYears = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  const availableYears = Array.from(new Set([...dbYears, ...windowYears])).sort((a, b) => b.localeCompare(a));

  const filteredEvents =
    filterYear === "all"
      ? events
      : events.filter((e) => new Date(e.start).getFullYear().toString() === filterYear);

  const mandatoryEvents    = filteredEvents.filter((e) => e.type === "MANDATORY").sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const nonMandatoryEvents = filteredEvents.filter((e) => e.type !== "MANDATORY").sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const renderGridRow = (event: TrainingEvent, idx: number) => {
    const startMonth = new Date(event.start).getMonth();
    const endMonth   = event.end ? new Date(event.end).getMonth() : startMonth;
    const colSpan    = endMonth - startMonth + 1;

    return (
      <div key={event.id} className="contents group">
        <div className="p-3 border-b border-border/50 bg-background group-hover:bg-muted/30 text-sm font-medium text-navy flex items-center border-r">
          {idx + 1}. {event.title}
        </div>
        {months.map((_, i) => (
          <div
            key={i}
            className="border-b border-border/50 border-r last:border-r-0 group-hover:bg-muted/10 relative bg-background/50 h-14"
          >
            {i === startMonth && (
              <div
                className="absolute top-1/2 -translate-y-1/2 left-2 h-8 rounded flex items-center justify-center px-3 text-[11px] text-white shadow-sm font-medium cursor-pointer transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: event.backgroundColor,
                  width: `calc(${colSpan * 100}% - 16px)`,
                  zIndex: 10,
                }}
                onClick={() => router.push(`/training/${event.id}`)}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase()}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Calendar of Training</h2>
          <p className="text-text-secondary">Visualisasi jadwal seluruh kegiatan training perusahaan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === "timeline" && (
            <select
              className="flex h-9 rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-end mb-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="timeline" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Timeline Program
            </TabsTrigger>
            <TabsTrigger value="classic" className="gap-2">
              <Calendar className="h-4 w-4" />
              Kalender Grid
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TIMELINE GANTT VIEW */}
        <TabsContent value="timeline" className="flex-1 m-0">
          <Card className="flex-1 overflow-hidden border-border shadow-sm">
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1000px] border-b">
                  {/* Header */}
                  <div className="grid grid-cols-[300px_repeat(12,1fr)] bg-navy text-surface font-medium text-sm">
                    <div className="p-3 border-r border-white/20 text-center flex items-center justify-center">
                      Jenis Training
                    </div>
                    {months.map((m) => (
                      <div key={m} className="p-3 border-r border-white/20 text-center last:border-r-0">
                        {m}
                      </div>
                    ))}
                  </div>

                  {/* Non-Mandatory */}
                  <div className="bg-[#455a64] text-white p-2 text-sm font-bold pl-4">Non-Mandatory</div>
                  <div className="grid grid-cols-[300px_repeat(12,1fr)]">
                    {loading ? (
                      <div className="col-span-13 p-4 text-sm text-text-secondary text-center">Memuat data...</div>
                    ) : nonMandatoryEvents.length === 0 ? (
                      <div className="col-span-13 p-4 text-sm text-text-secondary text-center">Tidak ada training non-mandatory.</div>
                    ) : (
                      nonMandatoryEvents.map((e, idx) => renderGridRow(e, idx))
                    )}
                  </div>

                  {/* Mandatory */}
                  <div className="bg-[#455a64] text-white p-2 text-sm font-bold pl-4 border-t border-white/20">Mandatory</div>
                  <div className="grid grid-cols-[300px_repeat(12,1fr)]">
                    {loading ? (
                      <div className="col-span-13 p-4 text-sm text-text-secondary text-center">Memuat data...</div>
                    ) : mandatoryEvents.length === 0 ? (
                      <div className="col-span-13 p-4 text-sm text-text-secondary text-center">Tidak ada training mandatory.</div>
                    ) : (
                      mandatoryEvents.map((e, idx) => renderGridRow(e, idx))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FULLCALENDAR VIEW */}
        <TabsContent value="classic" className="flex-1 m-0">
          <Card className="flex-1 min-h-[600px] overflow-hidden border-border shadow-sm">
            <CardContent className="p-6 h-full">
              {activeTab === "classic" && (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  buttonText={{
                    multiMonthYear: "year",
                    dayGridMonth: "month",
                    timeGridWeek: "week",
                    timeGridDay: "day",
                  }}
                  events={events}
                  height="auto"
                  dayMaxEvents={true}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    if (info.event.id) router.push(`/training/${info.event.id}`);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
