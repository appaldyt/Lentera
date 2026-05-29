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

const mockEmployees = [
  {
    id: "EMP-001",
    nik: "20260101",
    name: "Budi Santoso",
    division: "Operations",
    position: "Senior Manager",
    email: "budi.s@ias.id",
    phone: "0812-3456-7890",
  },
  {
    id: "EMP-002",
    nik: "20260102",
    name: "Rina Wijaya",
    division: "Finance",
    position: "Finance Officer",
    email: "rina.w@ias.id",
    phone: "0813-2233-4455",
  },
  {
    id: "EMP-003",
    nik: "20260103",
    name: "Hendra Gunawan",
    division: "Maintenance",
    position: "Chief Engineer",
    email: "hendra.g@ias.id",
    phone: "0811-9988-7766",
  },
  {
    id: "EMP-004",
    nik: "20260104",
    name: "Andi Pratama",
    division: "Ground Handling",
    position: "Supervisor",
    email: "andi.p@ias.id",
    phone: "0856-1234-5678",
  },
  {
    id: "EMP-005",
    nik: "20260105",
    name: "Siti Rahma",
    division: "Human Resources",
    position: "HR Specialist",
    email: "siti.r@ias.id",
    phone: "0821-4455-6677",
  },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Karyawan</h2>
          <p className="text-text-secondary">Kelola data seluruh karyawan dan direktori tenaga kerja.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import Data
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari NIK atau Nama Karyawan..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter Divisi
        </Button>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIK</TableHead>
            <TableHead>Nama Karyawan</TableHead>
            <TableHead>Divisi</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. Telepon</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockEmployees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium text-navy">{emp.nik}</TableCell>
              <TableCell className="font-medium">{emp.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal bg-background">
                  {emp.division}
                </Badge>
              </TableCell>
              <TableCell>{emp.position}</TableCell>
              <TableCell>{emp.email}</TableCell>
              <TableCell>{emp.phone}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {mockEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada data karyawan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
