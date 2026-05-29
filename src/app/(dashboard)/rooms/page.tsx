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

const mockRooms = [
  {
    id: "RM-001",
    name: "Auditorium A",
    capacity: 100,
    facilities: "Proyektor 4K, Soundsystem, AC Sentral, Podium",
    ownership: "INTERNAL",
    location: "Gedung Pusat (Lantai 2)",
  },
  {
    id: "RM-002",
    name: "Hangar 3 Practice Area",
    capacity: 50,
    facilities: "Alat Peraga Ground Handling, APAR, Safety Kit",
    ownership: "INTERNAL",
    location: "Fasilitas Hangar",
  },
  {
    id: "RM-003",
    name: "Meeting Room Mawar",
    capacity: 25,
    facilities: "Smart TV, Papan Tulis Kaca, AC",
    ownership: "RENTED",
    location: "Hotel Bandara Internasional",
  },
  {
    id: "RM-004",
    name: "Laboratorium Komputer 1",
    capacity: 30,
    facilities: "30 PC All-in-One, Jaringan LAN, Proyektor",
    ownership: "INTERNAL",
    location: "Gedung Diklat (Lantai 1)",
  },
  {
    id: "RM-005",
    name: "Ballroom B",
    capacity: 200,
    facilities: "Panggung, LED Videotron, Soundsystem Premium",
    ownership: "RENTED",
    location: "Gedung Convention Center",
  },
];

function getOwnershipBadge(ownership: string) {
  switch (ownership) {
    case "INTERNAL":
      return <Badge variant="default" className="bg-sky text-surface">Internal</Badge>;
    case "RENTED":
      return <Badge variant="warning">Sewa (Rented)</Badge>;
    default:
      return <Badge variant="outline">{ownership}</Badge>;
  }
}

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Ruangan</h2>
          <p className="text-text-secondary">Inventaris fasilitas ruangan untuk kegiatan training dan rapat.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import Excel
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Ruangan
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari nama atau lokasi ruangan..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter Kepemilikan
        </Button>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Ruangan</TableHead>
            <TableHead className="text-right">Kapasitas</TableHead>
            <TableHead>Fasilitas</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Kepemilikan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium text-navy">
                {room.name}
              </TableCell>
              <TableCell className="text-right">{room.capacity} Org</TableCell>
              <TableCell className="max-w-[200px] truncate" title={room.facilities}>
                {room.facilities}
              </TableCell>
              <TableCell>{room.location}</TableCell>
              <TableCell>{getOwnershipBadge(room.ownership)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {mockRooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada data ruangan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
