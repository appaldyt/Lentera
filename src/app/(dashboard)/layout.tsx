import { LayoutDashboard, BookOpen, Calendar, Badge, CircleDollarSign, Building, Settings, Plane, Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-navy text-surface md:flex">
        <div className="flex h-16 items-center border-b border-navy-dark px-6">
          <div className="flex items-center gap-2 text-sky-light">
            <Plane className="h-6 w-6" />
            <span className="text-xl font-bold tracking-wider text-surface">LENTERA</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            <SidebarItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
            <SidebarItem href="/training" icon={<BookOpen size={20} />} label="Training" />
            <SidebarItem href="/calendar" icon={<Calendar size={20} />} label="Calendar" />
            <SidebarItem href="/licenses" icon={<Badge size={20} />} label="Lisensi" />
            <SidebarItem href="/finance" icon={<CircleDollarSign size={20} />} label="Anggaran" />
            <SidebarItem href="/rooms" icon={<Building size={20} />} label="Ruangan" />
          </nav>
        </div>
        <div className="border-t border-navy-dark p-4">
          <SidebarItem href="/settings" icon={<Settings size={20} />} label="Pengaturan" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder="Cari training, karyawan, atau lisensi..."
                className="w-full bg-background pl-9 border-border"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative rounded-full p-2 text-text-secondary hover:bg-background hover:text-text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-sky-light/20 flex items-center justify-center text-sky border border-sky/30 cursor-pointer">
              <User className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
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
