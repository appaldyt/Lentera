import { Plane, LogOut, LayoutDashboard, Send, Users, FileText, BarChart, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/actions/auth";

export default async function EvaluasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-border bg-surface hidden md:flex flex-shrink-0">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/evaluasi/dashboard" className="flex items-center gap-2 text-navy hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky text-surface shadow">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-wider">LENTERA</span>
          </Link>
        </div>
        
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Aplikasi</p>
          <p className="font-medium text-navy text-sm">Portal Evaluasi</p>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <Link href="/evaluasi/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Evaluasi Saya
          </Link>
          {(session?.role === "EVALUATION_ADMIN" || session?.role === "SUPER_ADMIN") && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-3">Admin Panel</p>
              </div>
              <Link href="/evaluasi/admin/assignments" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
                <Send className="h-4 w-4" />
                Distribusi Evaluasi
              </Link>
              <Link href="/evaluasi/admin/results" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
                <BarChart className="h-4 w-4" />
                Hasil Evaluasi
              </Link>
              <Link href="/evaluasi/admin/questions" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
                <FileText className="h-4 w-4" />
                Manajemen Pertanyaan
              </Link>
              <Link href="/evaluasi/admin/criteria" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
                <Settings className="h-4 w-4" />
                Kriteria Kelulusan
              </Link>
              <Link href="/evaluasi/admin/users" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-slate-100 hover:text-navy transition-colors">
                <Users className="h-4 w-4" />
                Manajemen Akun
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border bg-slate-50/50">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-navy truncate">{session?.name || "Bapak/Ibu Atasan"}</p>
            <p className="text-xs text-text-secondary truncate">{session?.role === "SUPER_ADMIN" ? "Super Admin" : (session?.role === "EVALUATION_ADMIN" ? "Evaluation Admin" : "Evaluator")}</p>
          </div>
          <form action={async () => {
            "use server";
            const { logoutEvaluator } = await import("@/actions/auth");
            await logoutEvaluator();
            const { redirect } = await import("next/navigation");
            redirect("/evaluasi/login");
          }}>
            <Button type="submit" variant="outline" className="w-full justify-start gap-2 border-border text-danger hover:bg-danger/10 hover:text-danger">
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header (opsional, untuk layar kecil) */}
        <header className="flex md:hidden h-16 items-center justify-between border-b border-border bg-surface px-4">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky" />
            <span className="font-bold text-navy">Portal Evaluasi</span>
          </div>
          <form action={async () => {
            "use server";
            const { logoutEvaluator } = await import("@/actions/auth");
            await logoutEvaluator();
            const { redirect } = await import("next/navigation");
            redirect("/evaluasi/login");
          }}>
            <Button type="submit" variant="ghost" size="icon" className="text-danger">
              <LogOut className="h-5 w-5" />
            </Button>
          </form>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
