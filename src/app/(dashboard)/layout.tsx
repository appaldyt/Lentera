import { Plane, Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarNav } from "@/components/sidebar-nav";

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
        <SidebarNav />
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
