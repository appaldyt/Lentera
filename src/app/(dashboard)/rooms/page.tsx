"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Download, ChevronDown, ChevronRight, Link as LinkIcon, CornerDownRight, Image as ImageIcon } from "lucide-react";
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
    facilitiesList: [
      { id: "F1", name: "Proyektor 4K", type: "Elektronik", quantity: 2, photoLink: "#" },
      { id: "F2", name: "Soundsystem", type: "Audio", quantity: 1, photoLink: "#" },
      { id: "F3", name: "AC Sentral", type: "Pendingin", quantity: 4, photoLink: "#" },
      { id: "F4", name: "Podium", type: "Mebel", quantity: 1, photoLink: "#" },
    ],
    ownership: "INTERNAL",
    location: "Gedung Pusat (Lantai 2)",
  },
  {
    id: "RM-002",
    name: "Hangar 3 Practice Area",
    capacity: 50,
    facilities: "Alat Peraga Ground Handling, APAR, Safety Kit",
    facilitiesList: [
      { id: "F5", name: "Alat Peraga Ground Handling", type: "Peraga", quantity: 5, photoLink: "#" },
      { id: "F6", name: "APAR", type: "Safety", quantity: 3, photoLink: "#" },
      { id: "F7", name: "Safety Kit", type: "Safety", quantity: 50, photoLink: "#" },
    ],
    ownership: "INTERNAL",
    location: "Fasilitas Hangar",
  },
  {
    id: "RM-003",
    name: "Meeting Room Mawar",
    capacity: 25,
    facilities: "Smart TV, Papan Tulis Kaca, AC",
    facilitiesList: [
      { id: "F8", name: "Smart TV 65 Inch", type: "Elektronik", quantity: 1, photoLink: "#" },
      { id: "F9", name: "Papan Tulis Kaca", type: "Alat Tulis", quantity: 1, photoLink: "#" },
      { id: "F10", name: "AC Split 2 PK", type: "Pendingin", quantity: 2, photoLink: "#" },
    ],
    ownership: "RENTED",
    location: "Hotel Bandara Internasional",
  },
  {
    id: "RM-004",
    name: "Laboratorium Komputer 1",
    capacity: 30,
    facilities: "30 PC All-in-One, Jaringan LAN, Proyektor",
    facilitiesList: [
      { id: "F11", name: "PC All-in-One Core i7", type: "Komputer", quantity: 30, photoLink: "#" },
      { id: "F12", name: "Switch Hub 48 Port", type: "Jaringan", quantity: 1, photoLink: "#" },
      { id: "F13", name: "Proyektor EPSON", type: "Elektronik", quantity: 1, photoLink: "#" },
    ],
    ownership: "INTERNAL",
    location: "Gedung Diklat (Lantai 1)",
  },
  {
    id: "RM-005",
    name: "Ballroom B",
    capacity: 200,
    facilities: "Panggung, LED Videotron, Soundsystem Premium",
    facilitiesList: [
      { id: "F14", name: "Panggung Modular", type: "Mebel", quantity: 1, photoLink: "#" },
      { id: "F15", name: "LED Videotron 4x3m", type: "Elektronik", quantity: 1, photoLink: "#" },
      { id: "F16", name: "Soundsystem Premium (Line Array)", type: "Audio", quantity: 1, photoLink: "#" },
    ],
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Nama Ruangan</TableHead>
            <TableHead className="text-right">Kapasitas</TableHead>
            <TableHead>Fasilitas</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead className="text-center">Foto</TableHead>
            <TableHead>Kepemilikan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRooms.map((room) => (
            <Fragment key={room.id}>
              <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(room.id)}>
                <TableCell>
                  {expandedRows[room.id] ? (
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  )}
                </TableCell>
                <TableCell className="font-medium text-navy">
                  {room.name}
                </TableCell>
                <TableCell className="text-right">{room.capacity} Org</TableCell>
                <TableCell className="max-w-[300px] py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {room.facilities.split(', ').map((facility, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-text-secondary border border-border">
                        {facility}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{room.location}</TableCell>
                <TableCell className="text-center">
                  <a href="#" className="inline-flex items-center justify-center p-2 text-sky hover:bg-sky/10 rounded-md transition-colors" onClick={(e) => e.stopPropagation()} title="Lihat Foto Ruangan">
                    <ImageIcon className="h-4 w-4" />
                  </a>
                </TableCell>
                <TableCell>{getOwnershipBadge(room.ownership)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {/* Nested Table for Facilities */}
              {expandedRows[room.id] && (
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableCell colSpan={8} className="p-0 border-b-0">
                    <div className="pl-12 pr-4 py-3">
                      <div className="rounded-md border border-border overflow-hidden bg-white shadow-sm">
                        <Table>
                          <TableHeader className="bg-navy text-surface">
                            <TableRow className="hover:bg-navy">
                              <TableHead className="w-[50px] text-surface/80">No</TableHead>
                              <TableHead className="text-surface/80">Nama Barang</TableHead>
                              <TableHead className="text-surface/80">Jenis</TableHead>
                              <TableHead className="text-right text-surface/80">Jumlah</TableHead>
                              <TableHead className="text-center text-surface/80">Link Foto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {room.facilitiesList.map((item, idx) => (
                              <TableRow key={item.id} className="hover:bg-slate-50">
                                <TableCell className="text-text-secondary">
                                  <CornerDownRight className="h-4 w-4 inline-block mr-1 text-slate-300" />
                                  {idx + 1}
                                </TableCell>
                                <TableCell className="font-medium text-navy">{item.name}</TableCell>
                                <TableCell className="text-text-secondary">{item.type}</TableCell>
                                <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                <TableCell className="text-center">
                                  <a href={item.photoLink} className="inline-flex items-center gap-1 text-xs text-sky hover:underline" onClick={(e) => e.stopPropagation()}>
                                    <LinkIcon className="h-3 w-3" />
                                    Lihat Foto
                                  </a>
                                </TableCell>
                              </TableRow>
                            ))}
                            {room.facilitiesList.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-sm text-text-secondary py-4">
                                  Belum ada rincian fasilitas
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={5} className="py-2 border-t border-dashed border-border/50">
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-sky hover:text-sky-light hover:bg-sky/10" onClick={(e) => e.stopPropagation()}>
                                  <Plus className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">Tambah Barang Baru</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
          {mockRooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Tidak ada data ruangan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
