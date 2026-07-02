import { Plane, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarNav } from "@/components/sidebar-nav";
import { TopbarUserMenu } from "@/components/topbar-user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { UserProvider } from "@/context/user-context";

import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session?.role === "EVALUATOR") {
    redirect("/evaluasi/dashboard");
  }

  return (
    <UserProvider>
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
            <div className="flex items-center gap-3 ml-auto">
              <NotificationBell />
              <TopbarUserMenu />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
