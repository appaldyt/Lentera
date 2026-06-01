"use client";

import React, { useState } from "react";
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
  TableFooter,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data
const mockLicenses = [
  {
    id: "LIC-001",
    employee: {
      nik: "20260105",
      name: "Siti Rahma",
      position: "Aviation Safety Inspector",
      workLocation: "CGK",
      employeeStatus: "PKWTT",
      lob: "Ground Handling",
    },
    licenseName: "Aircraft Maintenance Engineer (AME)",
    licenseNumber: "AME-001",
    category: "Operasional",
    issuedDate: "2023-08-15",
    expiryDate: "2025-08-15",
    status: "EXPIRED",
  },
  {
    id: "LIC-002",
    employee: {
      nik: "20260103",
      name: "Andi Pratama",
      position: "Customer Service Agent",
      workLocation: "SUB",
      employeeStatus: "PKWT",
      lob: "Food",
    },
    licenseName: "Customer Excellence Certification",
    licenseNumber: "-",
    category: "Akademik",
    issuedDate: "2025-02-10",
    expiryDate: "2028-02-10",
    status: "ACTIVE",
  },
  {
    id: "LIC-003",
    employee: {
      nik: "20260212",
      name: "Budi Santoso",
      position: "Ground Handling Supervisor",
      workLocation: "CGK",
      employeeStatus: "PKWTT",
      lob: "Cargo & Logistik",
    },
    licenseName: "Dangerous Goods Regulations (DGR)",
    licenseNumber: "DGR-2024-001",
    category: "Operasional",
    issuedDate: "2024-06-20",
    expiryDate: "2026-06-20",
    status: "EXPIRING_3_MONTHS",
  },
  {
    id: "LIC-004",
    employee: {
      nik: "20260519",
      name: "Dewi Lestari",
      position: "Flight Dispatcher",
      workLocation: "KNO",
      employeeStatus: "PKWTT",
      lob: "Ground Handling",
    },
    licenseName: "Flight Dispatcher License (FOO)",
    licenseNumber: "FOO-2026-0519",
    category: "Operasional",
    issuedDate: "2026-01-10",
    expiryDate: "2026-10-10",
    status: "EXPIRING_5_MONTHS",
  },
  {
    id: "LIC-005",
    employee: {
      nik: "20260721",
      name: "Ahmad Fauzi",
      position: "Aviation Security",
      workLocation: "CGK",
      employeeStatus: "PKWT",
      lob: "Aviation Security",
    },
    licenseName: "Basic Aviation Security (AVSEC)",
    licenseNumber: "-",
    category: "Operasional",
    issuedDate: "2024-06-15",
    expiryDate: "2026-06-15", // Expiring in < 1 month (assuming current date is May 2026)
    status: "EXPIRING_1_MONTH",
  },
];

const mockEmployees = [
  { nik: "20260105", name: "Siti Rahma", position: "Aviation Safety Inspector", workLocation: "CGK", employeeStatus: "PKWTT", lob: "Ground Handling" },
  { nik: "20260103", name: "Andi Pratama", position: "Customer Service Agent", workLocation: "SUB", employeeStatus: "PKWT", lob: "Food" },
  { nik: "20260212", name: "Budi Santoso", position: "Ground Handling Supervisor", workLocation: "CGK", employeeStatus: "PKWTT", lob: "Cargo & Logistik" },
  { nik: "20260519", name: "Dewi Lestari", position: "Flight Dispatcher", workLocation: "KNO", employeeStatus: "PKWTT", lob: "Ground Handling" },
  { nik: "20260721", name: "Ahmad Fauzi", position: "Aviation Security", workLocation: "CGK", employeeStatus: "PKWT", lob: "Aviation Security" },
  { nik: "20260888", name: "Reza Rahadian", position: "Pilot", workLocation: "DPS", employeeStatus: "PKWTT", lob: "Cargo & Logistik" },
];

export default function LicensesPage() {
  const [licenses, setLicenses] = useState(mockLicenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Semua Lisensi");

  // Column Filters
  const [filterColNama, setFilterColNama] = useState("");
  const [filterColLokasi, setFilterColLokasi] = useState("");
  const [filterColLisensi, setFilterColLisensi] = useState("");
  const [filterColStatus, setFilterColStatus] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    position: "",
    workLocation: "CGK",
    employeeStatus: "PKWTT",
    lob: "Ground Handling",
    licenseName: "",
    licenseNumber: "-",
    category: "Operasional",
    issuedDate: "",
    expiryDate: "",
    status: "ACTIVE"
  });

  const handleOpenModal = (mode: "add" | "edit" | "delete", license: typeof mockLicenses[0] | null = null) => {
    setModalMode(mode);
    if ((mode === "edit" || mode === "delete") && license) {
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
        issuedDate: license.issuedDate,
        expiryDate: license.expiryDate,
        status: license.status
      });
    } else {
      setEditingId(null);
      setFormData({
        nik: "", name: "", position: "", workLocation: "CGK", employeeStatus: "PKWTT", lob: "Ground Handling",
        licenseName: "", licenseNumber: "-", category: "Operasional", issuedDate: "", expiryDate: "", status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNik = e.target.value;
    const foundEmployee = mockEmployees.find(emp => emp.nik === newNik);
    
    setFormData(prev => ({
      ...prev,
      nik: newNik,
      name: foundEmployee ? foundEmployee.name : prev.name,
      position: foundEmployee ? foundEmployee.position : prev.position,
      workLocation: foundEmployee ? foundEmployee.workLocation : prev.workLocation,
      employeeStatus: foundEmployee ? foundEmployee.employeeStatus : prev.employeeStatus,
      lob: foundEmployee ? foundEmployee.lob : prev.lob,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newLicense = {
        id: `LIC-00${licenses.length + 1}`,
        employee: {
          nik: formData.nik,
          name: formData.name,
          position: formData.position,
          workLocation: formData.workLocation,
          employeeStatus: formData.employeeStatus,
          lob: formData.lob,
        },
        licenseName: formData.licenseName,
        licenseNumber: formData.licenseNumber || "-",
        category: formData.category,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
        status: formData.status,
      };
      setLicenses([...licenses, newLicense]);
    } else {
      setLicenses(licenses.map(lic => lic.id === editingId ? {
        ...lic,
        employee: {
          nik: formData.nik,
          name: formData.name,
          position: formData.position,
          workLocation: formData.workLocation,
          employeeStatus: formData.employeeStatus,
          lob: formData.lob,
        },
        licenseName: formData.licenseName,
        licenseNumber: formData.licenseNumber || "-",
        category: formData.category,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate,
        status: formData.status,
      } : lic));
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (editingId) {
      setLicenses(licenses.filter(lic => lic.id !== editingId));
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  const filteredLicenses = licenses.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      item.employee.name.toLowerCase().includes(searchLower) ||
      item.employee.nik.toLowerCase().includes(searchLower) ||
      item.licenseName.toLowerCase().includes(searchLower);
      
    const matchTab = activeTab === "Semua Lisensi" || item.category === activeTab;
    
    const matchColNama = item.employee.name.toLowerCase().includes(filterColNama.toLowerCase());
    const matchColLokasi = item.employee.workLocation.toLowerCase().includes(filterColLokasi.toLowerCase());
    const matchColLisensi = item.licenseName.toLowerCase().includes(filterColLisensi.toLowerCase());
    const matchColStatus = filterColStatus === "ALL" || item.status === filterColStatus;
    
    return matchSearch && matchTab && matchColNama && matchColLokasi && matchColLisensi && matchColStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Aktif</Badge>;
      case "EXPIRING_5_MONTHS":
        return <Badge variant="warning" className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Berakhir &lt; 5 Bulan</Badge>;
      case "EXPIRING_3_MONTHS":
        return <Badge variant="warning" className="bg-orange-500 hover:bg-orange-600 text-white border-transparent">Berakhir &lt; 3 Bulan</Badge>;
      case "EXPIRING_1_MONTH":
        return <Badge variant="danger" className="bg-red-500 hover:bg-red-600 text-white border-transparent">Berakhir &lt; 1 Bulan</Badge>;
      case "EXPIRED":
        return <Badge variant="danger" className="bg-red-700 hover:bg-red-800 text-white border-transparent">Kadaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Monitoring Lisensi & Sertifikasi
          </h2>
          <p className="text-text-secondary">
            Pantau masa berlaku lisensi dan sertifikasi karyawan.
          </p>
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
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-text-secondary">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-sky hover:bg-sky/90 text-surface gap-2" onClick={() => handleOpenModal("add")}>
              <Plus className="h-4 w-4" />
              Tambah Lisensi
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
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
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              {isFilterOpen && (
                <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Data
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
                      onClick={() => {
                        setFilterColNama("");
                        setFilterColLokasi("");
                        setFilterColLisensi("");
                        setFilterColStatus("ALL");
                      }}
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
                {filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-text-secondary">
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
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)}></div>
                              <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                                  onClick={() => {
                                    handleOpenModal("edit", item);
                                    setOpenActionId(null);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                  onClick={() => {
                                    handleOpenModal("delete", item);
                                    setOpenActionId(null);
                                  }}
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

      {/* Form & Confirmation Modal */}
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
                  Apakah Anda yakin ingin menghapus data lisensi atas nama <strong>{formData.name}</strong> ({formData.licenseName})? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="button" onClick={confirmDelete} className="bg-danger hover:bg-danger/90 text-white">
                    Hapus Data
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">NIK</label>
                  <Input required value={formData.nik} onChange={handleNikChange} placeholder="Ketik NIK (Contoh: 20260105)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Karyawan</label>
                  <Input required readOnly className="bg-muted/50 cursor-not-allowed" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Otomatis Terisi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Jabatan</label>
                  <Input required readOnly className="bg-muted/50 cursor-not-allowed" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Otomatis Terisi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Lokasi Kerja</label>
                  <Input required readOnly className="bg-muted/50 cursor-not-allowed" value={formData.workLocation} onChange={(e) => setFormData({...formData, workLocation: e.target.value})} placeholder="Otomatis Terisi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Status Karyawan</label>
                  <Input required readOnly className="bg-muted/50 cursor-not-allowed" value={formData.employeeStatus} onChange={(e) => setFormData({...formData, employeeStatus: e.target.value})} placeholder="Otomatis Terisi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Line of Business (LOB)</label>
                  <Input required readOnly className="bg-muted/50 cursor-not-allowed" value={formData.lob} onChange={(e) => setFormData({...formData, lob: e.target.value})} placeholder="Otomatis Terisi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Lisensi</label>
                  <Input required value={formData.licenseName} onChange={(e) => setFormData({...formData, licenseName: e.target.value})} placeholder="Nama Lisensi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">No Lisensi</label>
                  <Input value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} placeholder="Isi - jika tidak ada" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Kategori</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Akademik">Akademik</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Tanggal Terbit</label>
                  <Input required type="date" value={formData.issuedDate} onChange={(e) => setFormData({...formData, issuedDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Tanggal Kadaluwarsa</label>
                  <Input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-surface">
                  {modalMode === "add" ? "Simpan Data" : "Update Data"}
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
