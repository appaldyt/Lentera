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

export default function CalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [filterYear, setFilterYear] = useState("2026");

  useEffect(() => {
    if (activeTab === "classic") {
      // Force FullCalendar to recalculate its dimensions after a short delay
      // because Radix Tabs animation might interfere with immediate calculation
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);
  
  const events = [
    {
      id: "TR-001",
      title: "Aviation Safety Leadership",
      type: "MANDATORY",
      start: "2026-06-10",
      end: "2026-06-12",
      backgroundColor: "#F9A825", // PLANNING - Warning
    },
    {
      id: "TR-002",
      title: "Customer Service Excellence",
      type: "NON_MANDATORY",
      start: "2026-05-28",
      backgroundColor: "#1E88E5", // ONGOING - Sky Blue
    },
    {
      id: "TR-003",
      title: "Basic Fire Fighting & Safety",
      type: "MANDATORY",
      start: "2026-05-15",
      backgroundColor: "#2E7D32", // COMPLETED - Success
    },
    {
      id: "TR-004",
      title: "Ground Handling Operations",
      type: "NON_MANDATORY",
      start: "2026-07-01",
      end: "2026-07-04",
      backgroundColor: "#F9A825", // PLANNING - Warning
    },
    {
      id: "TR-005",
      title: "Leadership Workshop",
      type: "MANDATORY",
      start: "2026-05-30",
      end: "2026-05-31",
      backgroundColor: "#1E88E5",
    },
    {
      id: "TR-006",
      title: "Station Head Mastery Bootcamp",
      type: "NON_MANDATORY",
      start: "2026-07-25",
      end: "2026-08-05",
      backgroundColor: "#607d8b", // slate
      label: "Coaching & Mentoring"
    }
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const filteredEvents = filterYear === "all" 
    ? events 
    : events.filter(e => new Date(e.start).getFullYear().toString() === filterYear);

  const mandatoryEvents = filteredEvents.filter(e => e.type === "MANDATORY");
  const nonMandatoryEvents = filteredEvents.filter(e => e.type === "NON_MANDATORY");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderGridRow = (event: any, idx: number) => {
    const startDate = new Date(event.start);
    const startMonth = startDate.getMonth();
    const endDate = event.end ? new Date(event.end) : startDate;
    const endMonth = endDate.getMonth();
    const colSpan = (endMonth - startMonth) + 1;

    return (
      <div key={event.id || idx} className="contents group">
        <div className="p-3 border-b border-border/50 bg-background group-hover:bg-muted/30 text-sm font-medium text-navy flex items-center border-r">
          {idx + 1}. {event.title}
        </div>
        {months.map((_, i) => (
          <div key={`empty-${i}`} className="border-b border-border/50 border-r last:border-r-0 group-hover:bg-muted/10 relative bg-background/50 h-14">
            {i === startMonth && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 left-2 h-8 rounded flex items-center justify-center px-3 text-[11px] text-white shadow-sm font-medium cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ 
                  backgroundColor: event.backgroundColor || '#1E88E5',
                  width: `calc(${colSpan * 100}% - 16px)`,
                  zIndex: 10
                }}
                onClick={() => router.push(`/training/${event.id}`)}
              >
                {event.label || "Pelaksanaan"}
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
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
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
                  
                  {/* Header Months */}
                  <div className="grid grid-cols-[300px_repeat(12,1fr)] bg-navy text-surface font-medium text-sm">
                    <div className="p-3 border-r border-white/20 text-center flex items-center justify-center">
                      Jenis Training
                    </div>
                    {months.map(m => (
                      <div key={m} className="p-3 border-r border-white/20 text-center last:border-r-0">
                        {m}
                      </div>
                    ))}
                  </div>

                  {/* NON-MANDATORY SECTION */}
                  <div className="bg-[#455a64] text-white p-2 text-sm font-bold pl-4">Non-Mandatory</div>
                  <div className="grid grid-cols-[300px_repeat(12,1fr)]">
                    {nonMandatoryEvents.map((e, idx) => renderGridRow(e, idx))}
                  </div>

                  {/* MANDATORY SECTION */}
                  <div className="bg-[#455a64] text-white p-2 text-sm font-bold pl-4 border-t border-white/20">Mandatory</div>
                  <div className="grid grid-cols-[300px_repeat(12,1fr)]">
                    {mandatoryEvents.map((e, idx) => renderGridRow(e, idx))}
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLASSIC FULLCALENDAR VIEW */}
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
                    multiMonthYear: 'year',
                    dayGridMonth: 'month',
                    timeGridWeek: 'week',
                    timeGridDay: 'day',
                  }}
                  events={events}
                  height="auto"
                  dayMaxEvents={true}
                  eventClick={(info) => {
                    info.jsEvent.preventDefault();
                    if (info.event.id) {
                      router.push(`/training/${info.event.id}`);
                    }
                  }}
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false
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
