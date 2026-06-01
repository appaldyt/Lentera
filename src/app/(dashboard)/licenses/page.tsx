"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, Edit, Trash2, X, Upload, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface License {
  id: string;
  employee: {
    nik: string;
    name: string;
    position: string;
    workLocation: string;
    employeeStatus: string;
    lob: string;
  };
  licenseName: string;
  licenseNumber: string;
  category: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

const EMPTY_FORM = {
  nik: "", name: "", position: "", workLocation: "CGK",
  employeeStatus: "PKWTT", lob: "Ground Handling",
  licenseName: "", licenseNumber: "-", category: "Operasional",
  issuedDate: "", expiryDate: "",
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Semua Lisensi");

  const [filterColNama, setFilterColNama] = useState("");
  const [filterColLokasi, setFilterColLokasi] = useState("");
  const [filterColLisensi, setFilterColLisensi] = useState("");
  const [filterColStatus, setFilterColStatus] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/licenses")
      .then((r) => r.json())
      .then((json) => setLicenses(json.licenses ?? []))
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenModal = (mode: "add" | "edit" | "delete", license: License | null = null) => {
    setModalMode(mode);
    if (license) {
      setEditingId(license.id);
      setFormData({
        nik: license.employee.nik,
        name: license.employee.name,
        position: license.employee.position,
        workLocation: license.employee.workLocation,
        employeeStatus: license.employee.employeeStatus,
        lob: license.employee.lob,
        licenseName: license.licenseName,
        licenseNumber: license.licenseNumber || "-",
        category: license.category,
        issuedDate: license.issuedDate ?? "",
        expiryDate: license.expiryDate ?? "",
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        nik: formData.nik,
        name: formData.name,
        position: formData.position,
        workLocation: formData.workLocation,
        employeeStatus: formData.employeeStatus,
        lob: formData.lob,
        licenseName: formData.licenseName,
        licenseNumber: formData.licenseNumber,
        category: formData.category,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
      };

      if (modalMode === "add") {
        const res = await fetch("/api/licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        setLicenses((prev) => [...prev, json.license]);
      } else if (modalMode === "edit" && editingId) {
        const res = await fetch(`/api/licenses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        setLicenses((prev) => prev.map((l) => (l.id === editingId ? json.license : l)));
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await fetch(`/api/licenses/${editingId}`, { method: "DELETE" });
      setLicenses((prev) => prev.filter((l) => l.id !== editingId));
      setIsModalOpen(false);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredLicenses = licenses.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      item.employee.name.toLowerCase().includes(q) ||
      item.employee.nik.toLowerCase().includes(q) ||
      item.licenseName.toLowerCase().includes(q);
    const matchTab = activeTab === "Semua Lisensi" || item.category === activeTab;
    const matchNama = item.employee.name.toLowerCase().includes(filterColNama.toLowerCase());
    const matchLokasi = item.employee.workLocation.toLowerCase().includes(filterColLokasi.toLowerCase());
    const matchLisensi = item.licenseName.toLowerCase().includes(filterColLisensi.toLowerCase());
    const matchStatus = filterColStatus === "ALL" || item.status === filterColStatus;
    return matchSearch && matchTab && matchNama && matchLokasi && matchLisensi && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Aktif</Badge>;
      case "EXPIRING_5_MONTHS":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Berakhir &lt; 5 Bulan</Badge>;
      case "EXPIRING_3_MONTHS":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-transparent">Berakhir &lt; 3 Bulan</Badge>;
      case "EXPIRING_1_MONTH":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">Berakhir &lt; 1 Bulan</Badge>;
      case "EXPIRED":
        return <Badge className="bg-red-700 hover:bg-red-800 text-white border-transparent">Kadaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Monitoring Lisensi &amp; Sertifikasi
          </h2>
          <p className="text-text-secondary">Pantau masa berlaku lisensi dan sertifikasi karyawan.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted">
              <TabsTrigger value="Semua Lisensi">Semua Lisensi</TabsTrigger>
              <TabsTrigger value="Akademik">Akademik</TabsTrigger>
              <TabsTrigger value="Operasional">Operasional</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-border/50 text-text-secondary">
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-text-secondary">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="bg-sky hover:bg-sky/90 text-surface gap-2" onClick={() => handleOpenModal("add")}>
              <Plus className="h-4 w-4" /> Tambah Lisensi
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Cari NIK, Nama Karyawan, atau Lisensi..."
                className="pl-9 bg-background/50 border-border/50 focus-visible:ring-sky/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="gap-2 border-border/50 text-text-secondary w-full sm:w-auto"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" /> Filter
              </Button>

              {isFilterOpen && (
                <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" /> Filter Data
                    </h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Nama Karyawan</label>
                      <Input placeholder="Filter by Name..." className="h-8 text-sm" value={filterColNama} onChange={(e) => setFilterColNama(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Lokasi Kerja</label>
                      <Input placeholder="Filter by Location..." className="h-8 text-sm" value={filterColLokasi} onChange={(e) => setFilterColLokasi(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Nama Lisensi</label>
                      <Input placeholder="Filter by License..." className="h-8 text-sm" value={filterColLisensi} onChange={(e) => setFilterColLisensi(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Status Lisensi</label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                        value={filterColStatus}
                        onChange={(e) => setFilterColStatus(e.target.value)}
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="EXPIRING_5_MONTHS">Berakhir &lt; 5 Bulan</option>
                        <option value="EXPIRING_3_MONTHS">Berakhir &lt; 3 Bulan</option>
                        <option value="EXPIRING_1_MONTH">Berakhir &lt; 1 Bulan</option>
                        <option value="EXPIRED">Kadaluwarsa</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setFilterColNama(""); setFilterColLokasi(""); setFilterColLisensi(""); setFilterColStatus("ALL"); }}
                    >
                      Clear
                    </Button>
                    <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>
                      Filter Results
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-navy">NIK</TableHead>
                  <TableHead className="font-semibold text-navy">Nama</TableHead>
                  <TableHead className="font-semibold text-navy">Jabatan</TableHead>
                  <TableHead className="font-semibold text-navy">Lokasi Kerja</TableHead>
                  <TableHead className="font-semibold text-navy">LOB</TableHead>
                  <TableHead className="font-semibold text-navy">Status Karyawan</TableHead>
                  <TableHead className="font-semibold text-navy">Jenis Lisensi</TableHead>
                  <TableHead className="font-semibold text-navy">No Lisensi</TableHead>
                  <TableHead className="font-semibold text-navy">Nama Lisensi</TableHead>
                  <TableHead className="font-semibold text-navy">Tanggal Terbit</TableHead>
                  <TableHead className="font-semibold text-navy">Kadaluwarsa</TableHead>
                  <TableHead className="font-semibold text-navy">Status</TableHead>
                  <TableHead className="text-right font-semibold text-navy">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center text-text-secondary">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center text-text-secondary">
                      Tidak ada lisensi ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLicenses.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.employee.nik}</TableCell>
                      <TableCell>{item.employee.name}</TableCell>
                      <TableCell>{item.employee.position}</TableCell>
                      <TableCell>{item.employee.workLocation}</TableCell>
                      <TableCell>{item.employee.lob}</TableCell>
                      <TableCell>{item.employee.employeeStatus}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.licenseNumber || "-"}</TableCell>
                      <TableCell className="font-medium text-navy">{item.licenseName}</TableCell>
                      <TableCell>{item.issuedDate}</TableCell>
                      <TableCell className="font-medium">{item.expiryDate}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="relative inline-block text-left">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-secondary"
                            onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {openActionId === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                              <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                                  onClick={() => { handleOpenModal("edit", item); setOpenActionId(null); }}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                  onClick={() => { handleOpenModal("delete", item); setOpenActionId(null); }}
                                >
                                  <Trash2 className="h-4 w-4" /> Hapus
                                </button>
                              </Card>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">
                {modalMode === "add" ? "Tambah Lisensi Baru" : modalMode === "edit" ? "Edit Data Lisensi" : "Konfirmasi Hapus"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {modalMode === "delete" ? (
              <div className="space-y-6">
                <p className="text-text-secondary">
                  Apakah Anda yakin ingin menghapus data lisensi atas nama{" "}
                  <strong>{formData.name}</strong> ({formData.licenseName})? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button onClick={confirmDelete} disabled={saving} className="bg-danger hover:bg-danger/90 text-white">
                    {saving ? "Menghapus..." : "Hapus Data"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">NIK</label>
                    <Input required value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} placeholder="Contoh: IAS-2021-0045" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Nama Karyawan</label>
                    <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Jabatan</label>
                    <Input required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Jabatan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Lokasi Kerja</label>
                    <Input required value={formData.workLocation} onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })} placeholder="CGK / SUB / DPS ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Status Karyawan</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.employeeStatus}
                      onChange={(e) => setFormData({ ...formData, employeeStatus: e.target.value })}
                    >
                      <option value="PKWTT">PKWTT</option>
                      <option value="PKWT">PKWT</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Line of Business (LOB)</label>
                    <Input required value={formData.lob} onChange={(e) => setFormData({ ...formData, lob: e.target.value })} placeholder="Ground Handling / Food / ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Nama Lisensi</label>
                    <Input required value={formData.licenseName} onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })} placeholder="Nama lisensi/sertifikasi" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">No Lisensi</label>
                    <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="Isi - jika tidak ada" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Kategori</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Operasional">Operasional</option>
                      <option value="Akademik">Akademik</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tanggal Terbit</label>
                    <Input required type="date" value={formData.issuedDate} onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Tanggal Kadaluwarsa</label>
                    <Input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-sky hover:bg-sky/90 text-surface">
                    {saving ? "Menyimpan..." : modalMode === "add" ? "Simpan Data" : "Update Data"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
