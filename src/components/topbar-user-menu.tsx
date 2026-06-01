"use client";

import { useState } from "react";
import { User, ChevronDown, LogOut, ShieldCheck, UserCog, Settings } from "lucide-react";
import { useUser, UserRole, ROLE_LABELS } from "@/context/user-context";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-amber-100 text-amber-700 border-amber-300",
  ADMIN: "bg-sky/15 text-sky border-sky/30",
  USER: "bg-navy/10 text-navy border-navy/20",
};

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  SUPER_ADMIN: <ShieldCheck className="h-3 w-3" />,
  ADMIN: <UserCog className="h-3 w-3" />,
  USER: <User className="h-3 w-3" />,
};

export function TopbarUserMenu() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-background transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-sky-light/20 flex items-center justify-center text-sky border border-sky/30">
          <User className="h-5 w-5" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-xs font-semibold text-text-primary">{user.name}</span>
          <span className="text-[10px] text-text-secondary">{ROLE_LABELS[user.role]}</span>
        </div>
        <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-[calc(100%+8px)] w-60 z-50 shadow-xl border-border animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 bg-navy/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sky/15 flex items-center justify-center text-sky font-bold text-base shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>
                    {ROLE_ICONS[user.role]}
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="px-2 py-2 border-b border-border">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-primary hover:bg-muted/60 transition-colors"
              >
                <Settings className="h-4 w-4 text-text-secondary" />
                Pengaturan
              </Link>
            </div>

            {/* Logout */}
            <div className="px-2 py-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-danger hover:bg-danger/10 transition-colors">
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
