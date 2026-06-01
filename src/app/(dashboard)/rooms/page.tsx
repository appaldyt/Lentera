"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Download, ChevronDown, ChevronRight, Link as LinkIcon, CornerDownRight, Image as ImageIcon, X, Pencil, Trash2 } from "lucide-react";
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
import { Card } from "@/components/ui/card";

type Ownership = "INTERNAL" | "RENTED";

interface Facility {
  id: string;
  name: string;
  type: string;
  quantity: number;
  photoLink: string;
  notes: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string;
  facilitiesList: Facility[];
  ownership: Ownership;
  ownerEntity: string;
  location: string;
  photoLink: string;
}

const initialRooms: Room[] = [
  {
    id: "RM-001",
    name: "Auditorium A",
    capacity: 100,
    facilities: "Proyektor 4K, Soundsystem, AC Sentral, Podium",
    facilitiesList: [
      { id: "F1", name: "Proyektor 4K", type: "Elektronik", quantity: 2, photoLink: "#", notes: "Resolusi 4K, merk Epson" },
      { id: "F2", name: "Soundsystem", type: "Audio", quantity: 1, photoLink: "#", notes: "Set lengkap speaker & mixer" },
      { id: "F3", name: "AC Sentral", type: "Pendingin", quantity: 4, photoLink: "#", notes: "" },
      { id: "F4", name: "Podium", type: "Mebel", quantity: 1, photoLink: "#", notes: "" },
    ],
    ownership: "INTERNAL",
    ownerEntity: "PT Integrasi Aviasi Solusi",
    location: "Gedung Pusat (Lantai 2)",
    photoLink: "#",
  },
  {
    id: "RM-002",
    name: "Hangar 3 Practice Area",
    capacity: 50,
    facilities: "Alat Peraga Ground Handling, APAR, Safety Kit",
    facilitiesList: [
      { id: "F5", name: "Alat Peraga Ground Handling", type: "Peraga", quantity: 5, photoLink: "#", notes: "Termasuk mock-up baggage" },
      { id: "F6", name: "APAR", type: "Safety", quantity: 3, photoLink: "#", notes: "Powder 6kg, cek berkala 6 bulan" },
      { id: "F7", name: "Safety Kit", type: "Safety", quantity: 50, photoLink: "#", notes: "" },
    ],
    ownership: "INTERNAL",
    ownerEntity: "PT Integrasi Aviasi Solusi",
    location: "Fasilitas Hangar",
    photoLink: "#",
  },
  {
    id: "RM-003",
    name: "Meeting Room Mawar",
    capacity: 25,
    facilities: "Smart TV, Papan Tulis Kaca, AC",
    facilitiesList: [
      { id: "F8", name: "Smart TV 65 Inch", type: "Elektronik", quantity: 1, photoLink: "#", notes: "Samsung, termasuk remote & bracket" },
      { id: "F9", name: "Papan Tulis Kaca", type: "Alat Tulis", quantity: 1, photoLink: "#", notes: "" },
      { id: "F10", name: "AC Split 2 PK", type: "Pendingin", quantity: 2, photoLink: "#", notes: "" },
    ],
    ownership: "RENTED",
    ownerEntity: "Hotel Aero Bandara",
    location: "Hotel Bandara Internasional",
    photoLink: "#",
  },
  {
    id: "RM-004",
    name: "Laboratorium Komputer 1",
    capacity: 30,
    facilities: "30 PC All-in-One, Jaringan LAN, Proyektor",
    facilitiesList: [
      { id: "F11", name: "PC All-in-One Core i7", type: "Komputer", quantity: 30, photoLink: "#", notes: "RAM 16GB, SSD 512GB" },
      { id: "F12", name: "Switch Hub 48 Port", type: "Jaringan", quantity: 1, photoLink: "#", notes: "Cisco Catalyst 2960" },
      { id: "F13", name: "Proyektor EPSON", type: "Elektronik", quantity: 1, photoLink: "#", notes: "" },
    ],
    ownership: "INTERNAL",
    ownerEntity: "PT Integrasi Aviasi Solusi",
    location: "Gedung Diklat (Lantai 1)",
    photoLink: "#",
  },
  {
    id: "RM-005",
    name: "Ballroom B",
    capacity: 200,
    facilities: "Panggung, LED Videotron, Soundsystem Premium",
    facilitiesList: [
      { id: "F14", name: "Panggung Modular", type: "Mebel", quantity: 1, photoLink: "#", notes: "Ukuran 6x4m, bisa dibongkar" },
      { id: "F15", name: "LED Videotron 4x3m", type: "Elektronik", quantity: 1, photoLink: "#", notes: "" },
      { id: "F16", name: "Soundsystem Premium (Line Array)", type: "Audio", quantity: 1, photoLink: "#", notes: "Set 8 unit speaker line array" },
    ],
    ownership: "RENTED",
    ownerEntity: "Gedung Convention Center IAS",
    location: "Gedung Convention Center",
    photoLink: "#",
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

const emptyFacility = (): Facility => ({
  id: `NEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: "",
  type: "",
  quantity: 1,
  photoLink: "",
  notes: "",
});

const emptyForm = {
  name: "",
  capacity: "",
  location: "",
  ownership: "INTERNAL" as Ownership,
  ownerEntity: "",
  photoLink: "",
  facilitiesList: [emptyFacility()],
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwnership, setFilterOwnership] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm, facilitiesList: [emptyFacility()] });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ ...emptyForm, facilitiesList: [emptyFacility()] });
    setIsModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditId(room.id);
    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      location: room.location,
      ownership: room.ownership,
      ownerEntity: room.ownerEntity,
      photoLink: room.photoLink,
      facilitiesList: room.facilitiesList.map((f) => ({ ...f })),
    });
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const promptDelete = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
    setOpenActionId(null);
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      setRooms(rooms.filter((r) => r.id !== roomToDelete.id));
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleFacilityChange = (idx: number, field: keyof Facility, value: string | number) => {
    const updated = formData.facilitiesList.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    );
    setFormData({ ...formData, facilitiesList: updated });
  };

  const addFacilityRow = () => {
    setFormData({ ...formData, facilitiesList: [...formData.facilitiesList, emptyFacility()] });
  };

  const removeFacilityRow = (idx: number) => {
    setFormData({
      ...formData,
      facilitiesList: formData.facilitiesList.filter((_, i) => i !== idx),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validFacilities = formData.facilitiesList.filter((f) => f.name.trim() !== "");
    const facilitiesStr = validFacilities.map((f) => f.name).join(", ");

    if (editId) {
      setRooms(rooms.map((r) =>
        r.id === editId
          ? {
              ...r,
              name: formData.name,
              capacity: Number(formData.capacity),
              location: formData.location,
              ownership: formData.ownership,
              ownerEntity: formData.ownerEntity,
              photoLink: formData.photoLink,
              facilities: facilitiesStr,
              facilitiesList: validFacilities,
            }
          : r
      ));
    } else {
      const newRoom: Room = {
        id: `RM-00${rooms.length + 1}`,
        name: formData.name,
        capacity: Number(formData.capacity),
        location: formData.location,
        ownership: formData.ownership,
        ownerEntity: formData.ownerEntity,
        photoLink: formData.photoLink,
        facilities: facilitiesStr,
        facilitiesList: validFacilities,
      };
      setRooms([newRoom, ...rooms]);
    }

    setIsModalOpen(false);
    setFormData({ ...emptyForm, facilitiesList: [emptyFacility()] });
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwnership = filterOwnership === "ALL" || room.ownership === filterOwnership;
    return matchesSearch && matchesOwnership;
  });

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
          <Button className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Tambah Ruangan
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Cari nama atau lokasi ruangan..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            Filter Kepemilikan
            {filterOwnership !== "ALL" && (
              <span className="ml-1 rounded-full bg-sky text-white text-xs px-1.5">1</span>
            )}
          </Button>
          {isFilterOpen && (
            <Card className="absolute left-0 top-[calc(100%+8px)] w-56 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-navy text-sm">Kepemilikan</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {[{ value: "ALL", label: "Semua" }, { value: "INTERNAL", label: "Internal" }, { value: "RENTED", label: "Sewa (Rented)" }].map((opt) => (
                  <button
                    key={opt.value}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterOwnership === opt.value ? "bg-sky text-white" : "hover:bg-muted/50 text-text-primary"}`}
                    onClick={() => { setFilterOwnership(opt.value); setIsFilterOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
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
          {filteredRooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-text-secondary">
                Tidak ada data ruangan ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            filteredRooms.map((room) => (
              <Fragment key={room.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRow(room.id)}
                >
                  <TableCell>
                    {expandedRows[room.id] ? (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-text-secondary" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-navy">{room.name}</TableCell>
                  <TableCell className="text-right">{room.capacity} Org</TableCell>
                  <TableCell className="max-w-[300px] py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.split(", ").map((facility, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-text-secondary border border-border"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell className="text-center">
                    <a
                      href={room.photoLink || "#"}
                      className="inline-flex items-center justify-center p-2 text-sky hover:bg-sky/10 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title="Lihat Foto Ruangan"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getOwnershipBadge(room.ownership)}
                      {room.ownerEntity && (
                        <span className="text-xs text-text-secondary">{room.ownerEntity}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block text-left">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === room.id ? null : room.id);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openActionId === room.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => { e.stopPropagation(); setOpenActionId(null); }}
                          />
                          <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); handleEdit(room); }}
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); promptDelete(room); }}
                            >
                              <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                          </Card>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Nested Facilities Table */}
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
                                <TableHead className="text-surface/80">Keterangan</TableHead>
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
                                  <TableCell className="text-text-secondary text-sm max-w-[200px]">
                                    {item.notes || <span className="text-border">—</span>}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <a
                                      href={item.photoLink || "#"}
                                      className="inline-flex items-center gap-1 text-xs text-sky hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <LinkIcon className="h-3 w-3" />
                                      Lihat Foto
                                    </a>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {room.facilitiesList.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-sm text-text-secondary py-4">
                                    Belum ada rincian fasilitas
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="py-2 border-t border-dashed border-border/50">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 text-sky hover:text-sky-light hover:bg-sky/10"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(room); }}
                                  >
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
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal Tambah / Edit Ruangan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-surface z-10">
              <h3 className="text-xl font-bold text-navy">
                {editId ? "Edit Ruangan" : "Tambah Ruangan Baru"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Info Ruangan */}
              <div>
                <h4 className="text-sm font-semibold text-navy mb-3">Informasi Ruangan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Nama Ruangan</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Auditorium A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Kapasitas (Orang)</label>
                    <Input
                      required
                      type="number"
                      min={1}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Contoh: 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Kepemilikan</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value as Ownership })}
                    >
                      <option value="INTERNAL">Internal</option>
                      <option value="RENTED">Sewa (Rented)</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Entitas Pemilik</label>
                    <Input
                      value={formData.ownerEntity}
                      onChange={(e) => setFormData({ ...formData, ownerEntity: e.target.value })}
                      placeholder="Contoh: PT Integrasi Aviasi Solusi"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Lokasi</label>
                    <Input
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Contoh: Gedung Pusat (Lantai 2)"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Link Foto Ruangan</label>
                    <Input
                      value={formData.photoLink}
                      onChange={(e) => setFormData({ ...formData, photoLink: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Fasilitas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-navy">Daftar Fasilitas / Barang</h4>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={addFacilityRow}>
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Baris
                  </Button>
                </div>

                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary w-[22%]">Nama Barang</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary w-[17%]">Jenis</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary w-[12%]">Jumlah</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary w-[24%]">Keterangan</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary">Link Foto</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {formData.facilitiesList.map((fac, idx) => (
                        <tr key={fac.id}>
                          <td className="px-3 py-2">
                            <Input
                              value={fac.name}
                              onChange={(e) => handleFacilityChange(idx, "name", e.target.value)}
                              placeholder="Nama barang"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={fac.type}
                              onChange={(e) => handleFacilityChange(idx, "type", e.target.value)}
                              placeholder="Jenis"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={fac.quantity}
                              onChange={(e) => handleFacilityChange(idx, "quantity", Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={fac.notes}
                              onChange={(e) => handleFacilityChange(idx, "notes", e.target.value)}
                              placeholder="Keterangan (opsional)"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={fac.photoLink}
                              onChange={(e) => handleFacilityChange(idx, "photoLink", e.target.value)}
                              placeholder="https://..."
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              className="text-text-secondary hover:text-danger transition-colors"
                              onClick={() => removeFacilityRow(idx)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.facilitiesList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-text-secondary text-xs">
                            Belum ada fasilitas. Klik "Tambah Baris" untuk menambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-white">
                  {editId ? "Simpan Perubahan" : "Tambah Ruangan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy mb-2">Hapus Ruangan?</h3>
                <p className="text-sm text-text-secondary">
                  Apakah Anda yakin ingin menghapus ruangan{" "}
                  <strong>{roomToDelete?.name}</strong>? Semua data fasilitas di dalamnya akan ikut terhapus.
                </p>
              </div>
              <div className="flex justify-center gap-3 w-full mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={confirmDelete}>
                  Hapus Ruangan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
