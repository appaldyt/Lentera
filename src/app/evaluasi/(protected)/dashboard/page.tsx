"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, Clock, CalendarDays, Loader2 } from "lucide-react";
import { getMyDashboardTasks } from "@/actions/evaluation-assignments";

export default function EvaluasiDashboardPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getMyDashboardTasks();
      setEvaluations(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const pendingCount = evaluations.filter(e => e.status === "PENDING").length;
  const completedCount = evaluations.filter(e => e.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Dashboard Evaluasi</h1>
        <p className="mt-2 text-text-secondary">
          Daftar karyawan yang membutuhkan evaluasi efektivitas training (3 bulan pasca-pelatihan).
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Menunggu Evaluasi</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{pendingCount}</div>
            <p className="text-xs text-text-secondary mt-1">Batas waktu terdekat: 25 Jun 2026</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Selesai Dievaluasi</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{completedCount}</div>
            <p className="text-xs text-text-secondary mt-1">Total selesai tahun ini</p>
          </CardContent>
        </Card>
      </div>

      {/* List / Table of Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas Evaluasi</CardTitle>
          <CardDescription>Pilih karyawan di bawah ini untuk mengisi form evaluasinya.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8 text-text-secondary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center p-8 border rounded-lg border-dashed border-border bg-slate-50">
                <p className="text-text-secondary">Anda belum memiliki tugas evaluasi saat ini.</p>
              </div>
            ) : (
              evaluations.map((evalData) => (
              <div 
                key={evalData.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${
                  evalData.status === 'PENDING' ? 'bg-surface hover:bg-slate-50 border-border' : 'bg-slate-50/50 border-border/50 opacity-80'
                } transition-colors`}
              >
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className={`p-2 rounded-full ${evalData.status === 'PENDING' ? 'bg-sky/10 text-sky' : 'bg-success/10 text-success'}`}>
                    {evalData.status === 'PENDING' ? <ClipboardList className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">{evalData.employeeName}</h3>
                    <p className="text-sm text-text-secondary mb-1">{evalData.position}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1 font-medium">
                        {evalData.trainingName}
                      </span>
                      <span className="hidden sm:inline text-border">•</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> Training: {evalData.trainingDate}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-3">
                  {evalData.status === "PENDING" ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning-dark border-warning/20">
                      Batas: {evalData.dueDate}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-success/10 text-success-dark border-success/20">
                      Selesai
                    </Badge>
                  )}
                  
                  {evalData.status === "PENDING" ? (
                    <Link href={`/evaluasi/form/${evalData.id}`}>
                      <Button size="sm" className="bg-navy hover:bg-navy-dark text-surface">
                        Mulai Evaluasi
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Sudah Diisi
                    </Button>
                  )}
                </div>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
