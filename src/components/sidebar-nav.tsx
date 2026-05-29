"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar, Badge, CircleDollarSign, Building, Settings, Users } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-4">
          <SidebarItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === "/dashboard"} />
          <SidebarItem href="/employees" icon={<Users size={20} />} label="Karyawan" active={pathname?.startsWith("/employees")} />
          <SidebarItem href="/training" icon={<BookOpen size={20} />} label="Training" active={pathname?.startsWith("/training")} />
          <SidebarItem href="/calendar" icon={<Calendar size={20} />} label="Calendar" active={pathname?.startsWith("/calendar")} />
          <SidebarItem href="/licenses" icon={<Badge size={20} />} label="Lisensi" active={pathname?.startsWith("/licenses")} />
          <SidebarItem href="/finance" icon={<CircleDollarSign size={20} />} label="Anggaran" active={pathname?.startsWith("/finance")} />
          <SidebarItem href="/rooms" icon={<Building size={20} />} label="Ruangan" active={pathname?.startsWith("/rooms")} />
        </nav>
      </div>
      <div className="border-t border-navy-dark p-4">
        <SidebarItem href="/settings" icon={<Settings size={20} />} label="Pengaturan" active={pathname?.startsWith("/settings")} />
      </div>
    </>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-sky text-surface"
          : "text-surface/70 hover:bg-navy-dark hover:text-surface"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
