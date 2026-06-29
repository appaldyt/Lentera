"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Eye, BarChart, FileCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEvaluationResults, EvaluationResult } from "@/actions/evaluation-results";

export default function EvaluasiResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getEvaluationResults();
      setResults(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredData = results.filter(r => 
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.trainingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (result: EvaluationResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string, color: string) => {
    switch (color) {
      case "success":
        return <Badge className="bg-success/10 text-success-dark border-success/20 hover:bg-success/20">{status}</Badge>;
      case "warning":
        return <Badge className="bg-warning/10 text-warning-dark border-warning/20 hover:bg-warning/20">{status}</Badge>;
      case "danger":
        return <Badge className="bg-danger/10 text-danger-dark border-danger/20 hover:bg-danger/20">{status}</Badge>;
      case "sky":
        return <Badge className="bg-sky/10 text-sky-dark border-sky/20 hover:bg-sky/20">{status}</Badge>;
      case "navy":
        return <Badge className="bg-navy/10 text-navy border-navy/20 hover:bg-navy/20">{status}</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 bg-slate-100">{status}</Badge>;
    }
  };

  const averageScore = results.length > 0 
    ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Hasil Evaluasi</h1>
        <p className="mt-2 text-text-secondary">
          Pantau hasil penilaian evaluasi efektivitas training yang telah diisi oleh atasan.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-sky">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Evaluasi Selesai</CardTitle>
            <FileCheck className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{isLoading ? "-" : results.length}</div>
            <p className="text-xs text-text-secondary mt-1">Dokumen telah masuk ke sistem</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-navy">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Rata-rata Skor</CardTitle>
            <BarChart className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{isLoading ? "-" : averageScore} <span className="text-lg font-normal text-text-secondary">/ 5.0</span></div>
            <p className="text-xs text-text-secondary mt-1">Dari seluruh evaluasi yang selesai</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Hasil Evaluasi</CardTitle>
              <CardDescription>Rincian skor dan status kelulusan peserta training.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder="Cari nama, training, atasan..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Karyawan</th>
                  <th className="px-4 py-3 font-medium">Pelatihan</th>
                  <th className="px-4 py-3 font-medium">Penilai</th>
                  <th className="px-4 py-3 font-medium">Tgl Selesai</th>
                  <th className="px-4 py-3 font-medium">Skor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-secondary">Memuat data...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-secondary">Tidak ada hasil ditemukan.</td>
                  </tr>
                ) : (
                  filteredData.map((data) => (
                    <tr key={data.id} className="border-b border-border hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-medium text-navy">
                        {data.employeeName}
                        <div className="text-xs font-normal text-text-secondary">{data.employeeNik}</div>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">{data.trainingName}</td>
                      <td className="px-4 py-4 text-navy">
                        {data.evaluatorName}
                        <div className="text-xs font-normal text-text-secondary">{data.evaluatorNik}</div>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">{data.dateCompleted}</td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-navy">{data.score.toFixed(1)}</span>
                        <span className="text-text-secondary text-xs">/5.0</span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(data.status, data.statusColor)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-sky border-sky/30 hover:bg-sky/5 hover:text-sky-dark"
                          onClick={() => handleOpenDialog(data)}
                        >
                          <Eye className="h-4 w-4" />
                          Lihat
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {selectedResult && (
            <>
              <div className="bg-navy p-6 text-white">
                <DialogTitle className="text-xl font-bold mb-1">Detail Hasil Evaluasi</DialogTitle>
                <DialogDescription className="text-sky-100">
                  Evaluasi Pasca-Pelatihan (Implementasi 3 Bulan)
                </DialogDescription>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Nama Karyawan</p>
                    <p className="font-medium text-navy">{selectedResult.employeeName} ({selectedResult.employeeNik})</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Atasan Penilai</p>
                    <p className="font-medium text-navy">{selectedResult.evaluatorName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-text-secondary mb-1">Pelatihan</p>
                    <p className="font-medium text-navy">{selectedResult.trainingName}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-navy mb-1">Rating Akhir Evaluasi</p>
                    <p className="text-xs text-text-secondary mb-2">Rata-rata dari kriteria penilaian (Skala 1-5)</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-3xl font-bold text-sky">{selectedResult.score.toFixed(1)}</span>
                      <span className="text-text-secondary">/ {selectedResult.maxScore.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(selectedResult.score)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
                  <p className="text-sm font-medium text-navy">Status Penilaian</p>
                  {getStatusBadge(selectedResult.status, selectedResult.statusColor)}
                </div>

                <div>
                  <p className="text-sm font-medium text-navy mb-2">Feedback & Rekomendasi Atasan</p>
                  <div className="bg-white border border-slate-200 rounded-md p-4 text-sm text-text-secondary leading-relaxed">
                    "{selectedResult.feedback}"
                  </div>
                </div>
              </div>
              
              <DialogFooter className="p-6 pt-0 sm:justify-end">
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-navy hover:bg-navy-dark text-white"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
