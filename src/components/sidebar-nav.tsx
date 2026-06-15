"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar, Badge, CircleDollarSign, Building, Settings, Users, GraduationCap, ShieldCheck, History, Store, ListTodo } from "lucide-react";
import { useUser } from "@/context/user-context";

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1.5">
          <SidebarItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active={pathname === "/dashboard" || pathname === "/"} />

          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-sky-light/70 uppercase tracking-wider px-2">Akademik</p>
          </div>
          <SidebarItem href="/training" icon={<BookOpen className="h-4 w-4" />} label="Manajemen Training" active={pathname === "/training" || (pathname.startsWith("/training/") && pathname !== "/training/tasks")} />
          <SidebarItem href="/training/tasks" icon={<ListTodo className="h-4 w-4" />} label="Task Training" active={pathname === "/training/tasks"} />
          <SidebarItem href="/learning-hours" icon={<GraduationCap className="h-4 w-4" />} label="Learning Hours" active={pathname.startsWith("/learning-hours")} />
          <SidebarItem href="/calendar" icon={<Calendar className="h-4 w-4" />} label="Kalender Training" active={pathname === "/calendar"} />
          <SidebarItem href="/licenses" icon={<Badge className="h-4 w-4" />} label="Lisensi & Sertifikasi" active={pathname === "/licenses"} />

          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-sky-light/70 uppercase tracking-wider px-2">Operasional</p>
          </div>
          <SidebarItem href="/employees" icon={<Users className="h-4 w-4" />} label="Manajemen Karyawan" active={pathname === "/employees"} />
          <SidebarItem href="/training-history" icon={<History className="h-4 w-4" />} label="Riwayat Training" active={pathname === "/training-history"} />
          <SidebarItem href="/finance" icon={<CircleDollarSign className="h-4 w-4" />} label="Anggaran & Biaya" active={pathname === "/finance"} />
          <SidebarItem href="/rooms" icon={<Building className="h-4 w-4" />} label="Manajemen Ruangan" active={pathname === "/rooms"} />
          <SidebarItem href="/vendors" icon={<Store className="h-4 w-4" />} label="Manajemen Vendor" active={pathname === "/vendors"} />

          {user.role === "SUPER_ADMIN" && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-sky-light/70 uppercase tracking-wider px-2">Administrasi</p>
              </div>
              <SidebarItem href="/accounts" icon={<ShieldCheck className="h-4 w-4" />} label="Manajemen Akun" active={pathname.startsWith("/accounts")} />
            </>
          )}
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
