"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Clock, XCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface LicenseNotif {
  id: string;
  licenseName: string;
  licenseNumber: string;
  expiryDate: string;
  status: "EXPIRED" | "EXPIRING_1_MONTH" | "EXPIRING_3_MONTHS";
  employee: { name: string; nik: string };
}

const STATUS_CONFIG = {
  EXPIRED: {
    label: "Kadaluarsa",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "text-danger bg-danger/10 border-danger/20",
    dot: "bg-danger",
  },
  EXPIRING_1_MONTH: {
    label: "< 1 Bulan",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "text-warning bg-warning/10 border-warning/20",
    dot: "bg-warning",
  },
  EXPIRING_3_MONTHS: {
    label: "< 3 Bulan",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "text-sky bg-sky/10 border-sky/20",
    dot: "bg-sky",
  },
};

export function NotificationBell() {
  const [notifs, setNotifs] = useState<LicenseNotif[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/licenses")
      .then((r) => r.json())
      .then((json) => {
        const urgent = (json.licenses ?? []).filter(
          (l: { status: string }) =>
            l.status === "EXPIRED" ||
            l.status === "EXPIRING_1_MONTH" ||
            l.status === "EXPIRING_3_MONTHS"
        );
        setNotifs(urgent);
      })
      .catch(() => setNotifs([]));
  }, []);

  const expired = notifs.filter((n) => n.status === "EXPIRED").length;
  const expiring1 = notifs.filter((n) => n.status === "EXPIRING_1_MONTH").length;
  const expiring3 = notifs.filter((n) => n.status === "EXPIRING_3_MONTHS").length;

  return (
    <div className="relative">
      <button
        className="relative rounded-full p-2 text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {notifs.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 shadow-xl border-border animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-navy/5 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-navy">Peringatan Lisensi</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {notifs.length > 0
                    ? `${notifs.length} lisensi perlu perhatian`
                    : "Semua lisensi aktif"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary chips */}
            {notifs.length > 0 && (
              <div className="flex gap-2 px-4 py-2 border-b border-border bg-background">
                {expired > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-danger/10 text-danger border-danger/20">
                    <XCircle className="h-3 w-3" /> {expired} Kadaluarsa
                  </span>
                )}
                {expiring1 > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-warning/10 text-warning border-warning/20">
                    <AlertTriangle className="h-3 w-3" /> {expiring1} &lt;1 Bln
                  </span>
                )}
                {expiring3 > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-sky/10 text-sky border-sky/20">
                    <Clock className="h-3 w-3" /> {expiring3} &lt;3 Bln
                  </span>
                )}
              </div>
            )}

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifs.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-text-secondary">
                  Tidak ada lisensi yang mendekati kadaluarsa.
                </div>
              ) : (
                notifs.map((n) => {
                  const cfg = STATUS_CONFIG[n.status];
                  return (
                    <div key={n.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.className}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary mt-1 leading-snug">{n.licenseName}</p>
                      <p className="text-xs text-text-secondary">{n.employee.name} · {n.employee.nik}</p>
                      <p className="text-xs text-text-secondary mt-0.5">Kadaluarsa: <span className="font-medium">{n.expiryDate}</span></p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 bg-background">
              <Link
                href="/licenses"
                onClick={() => setIsOpen(false)}
                className="text-xs text-sky hover:underline font-medium"
              >
                Lihat semua lisensi →
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
