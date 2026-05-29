import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockFinances = [
  {
    id: "FIN-001",
    trainingName: "Aviation Safety Leadership",
    plannedAmount: 15000000,
    actualAmount: 15000000,
    dueDate: "2026-05-15",
    status: "PAID",
  },
  {
    id: "FIN-002",
    trainingName: "Customer Service Excellence",
    plannedAmount: 5000000,
    actualAmount: 0,
    dueDate: "2026-06-01",
    status: "PENDING",
  },
  {
    id: "FIN-003",
    trainingName: "Basic Fire Fighting & Safety",
    plannedAmount: 7500000,
    actualAmount: 7500000,
    dueDate: "2026-04-20",
    status: "PAID",
  },
  {
    id: "FIN-004",
    trainingName: "Ground Handling Operations",
    plannedAmount: 25000000,
    actualAmount: 10000000,
    dueDate: "2026-05-25",
    status: "OVERDUE",
  },
  {
    id: "FIN-005",
    trainingName: "GSE Operator License Prep",
    plannedAmount: 12000000,
    actualAmount: 0,
    dueDate: "2026-06-15",
    status: "PENDING",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge variant="success">Lunas</Badge>;
    case "PENDING":
      return <Badge variant="warning">Belum Dibayar</Badge>;
    case "OVERDUE":
      return <Badge variant="danger">Jatuh Tempo</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function FinancePage() {
  const totalPlanned = mockFinances.reduce((acc, curr) => acc + curr.plannedAmount, 0);
  const totalActual = mockFinances.reduce((acc, curr) => acc + curr.actualAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Monitoring Anggaran</h2>
          <p className="text-text-secondary">Kelola budget training dan pantau status pembayaran tagihan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Laporan
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Tagihan
          </Button>
        </div>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-text-secondary">Total Anggaran (Planned)</p>
          <p className="text-2xl font-bold text-navy mt-1">{formatCurrency(totalPlanned)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-text-secondary">Total Realisasi (Actual)</p>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalActual)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-text-secondary">Tagihan Jatuh Tempo (Overdue)</p>
          <p className="text-2xl font-bold text-danger mt-1">1 Tagihan</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari nama training..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter Status
        </Button>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Training</TableHead>
            <TableHead className="text-right">Anggaran (Planned)</TableHead>
            <TableHead className="text-right">Realisasi (Actual)</TableHead>
            <TableHead>Tgl. Jatuh Tempo</TableHead>
            <TableHead>Status Pembayaran</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockFinances.map((finance) => (
            <TableRow key={finance.id}>
              <TableCell className="font-medium text-navy">
                {finance.trainingName}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(finance.plannedAmount)}</TableCell>
              <TableCell className="text-right font-medium text-success">
                {formatCurrency(finance.actualAmount)}
              </TableCell>
              <TableCell>{finance.dueDate}</TableCell>
              <TableCell>{getStatusBadge(finance.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {mockFinances.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada data anggaran.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
