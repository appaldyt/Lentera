"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  const router = useRouter();
  
  const events = [
    {
      id: "TR-001",
      title: "Aviation Safety Leadership",
      start: "2026-06-10",
      end: "2026-06-12",
      backgroundColor: "#F9A825", // PLANNING - Warning
    },
    {
      id: "TR-002",
      title: "Customer Service Excellence",
      start: "2026-05-28",
      backgroundColor: "#1E88E5", // ONGOING - Sky Blue
    },
    {
      id: "TR-003",
      title: "Basic Fire Fighting & Safety",
      start: "2026-05-15",
      backgroundColor: "#2E7D32", // COMPLETED - Success
    },
    {
      title: "Ground Handling Operations",
      start: "2026-07-01",
      end: "2026-07-04",
      backgroundColor: "#F9A825", // PLANNING - Warning
    },
    {
      title: "Leadership Workshop",
      start: "2026-05-30T10:00:00",
      end: "2026-05-30T15:00:00",
      backgroundColor: "#1E88E5",
    },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy">Calendar of Training</h2>
        <p className="text-text-secondary">Visualisasi jadwal seluruh kegiatan training perusahaan.</p>
      </div>

      <Card className="flex-1 min-h-[600px] overflow-hidden">
        <CardContent className="p-6 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            height="100%"
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
        </CardContent>
      </Card>
    </div>
  );
}
