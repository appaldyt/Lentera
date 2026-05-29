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

const mockLicenses = [
  {
    id: "LIC-001",
    name: "Sertifikat K3 Umum",
    category: "Safety",
    ownership: "Perusahaan",
    issuedDate: "2023-01-15",
    expiryDate: "2026-01-15",
    status: "EXPIRED",
  },
  {
    id: "LIC-002",
    name: "Aircraft Maintenance Engineer License",
    category: "Aviation",
    ownership: "Budi Santoso",
    issuedDate: "2024-06-20",
    expiryDate: "2026-06-20",
    status: "EXPIRING_SOON",
  },
  {
    id: "LIC-003",
    name: "ISO 9001:2015",
    category: "Quality Management",
    ownership: "Perusahaan",
    issuedDate: "2025-02-10",
    expiryDate: "2028-02-10",
    status: "ACTIVE",
  },
  {
    id: "LIC-004",
    name: "GSE Operator License",
    category: "Operations",
    ownership: "Andi Pratama",
    issuedDate: "2024-03-05",
    expiryDate: "2027-03-05",
    status: "ACTIVE",
  },
  {
    id: "LIC-005",
    name: "Aviation Security (Avsec) License",
    category: "Security",
    ownership: "Rina Wijaya",
    issuedDate: "2024-07-01",
    expiryDate: "2026-07-01",
    status: "EXPIRING_SOON",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "EXPIRING_SOON":
      return <Badge variant="warning">Expiring Soon</Badge>;
    case "EXPIRED":
      return <Badge variant="danger">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function LicensesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Monitoring Lisensi</h2>
          <p className="text-text-secondary">Pantau masa berlaku sertifikasi perusahaan dan lisensi karyawan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import Excel
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Lisensi
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari lisensi atau nama pemilik..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter Kategori
        </Button>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Lisensi</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Kepemilikan</TableHead>
            <TableHead>Tanggal Terbit</TableHead>
            <TableHead>Kedaluwarsa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockLicenses.map((license) => (
            <TableRow key={license.id}>
              <TableCell className="font-medium text-navy">
                {license.name}
              </TableCell>
              <TableCell>{license.category}</TableCell>
              <TableCell>{license.ownership}</TableCell>
              <TableCell>{license.issuedDate}</TableCell>
              <TableCell>{license.expiryDate}</TableCell>
              <TableCell>{getStatusBadge(license.status)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {mockLicenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada data lisensi.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
