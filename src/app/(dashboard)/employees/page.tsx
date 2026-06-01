"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Download, X, Pencil, Trash2 } from "lucide-react";
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

const mockEmployees = [
  {
    id: "EMP-001",
    nik: "20260101",
    name: "Budi Santoso",
    division: "Operations",
    position: "Senior Manager",
    email: "budi.s@ias.id",
    phone: "0812-3456-7890",
    workLocation: "CGK",
    employeeStatus: "PKWTT",
    lob: "Ground Handling",
  },
  {
    id: "EMP-002",
    nik: "20260102",
    name: "Rina Wijaya",
    division: "Finance",
    position: "Finance Officer",
    email: "rina.w@ias.id",
    phone: "0813-2233-4455",
    workLocation: "SUB",
    employeeStatus: "PKWT",
    lob: "Food",
  },
  {
    id: "EMP-003",
    nik: "20260103",
    name: "Hendra Gunawan",
    division: "Maintenance",
    position: "Chief Engineer",
    email: "hendra.g@ias.id",
    phone: "0811-9988-7766",
    workLocation: "DPS",
    employeeStatus: "PKWTT",
    lob: "Cargo & Logistik",
  },
  {
    id: "EMP-004",
    nik: "20260104",
    name: "Andi Pratama",
    division: "Ground Handling",
    position: "Supervisor",
    email: "andi.p@ias.id",
    phone: "0856-1234-5678",
    workLocation: "CGK",
    employeeStatus: "PKWTT",
    lob: "Ground Handling",
  },
  {
    id: "EMP-005",
    nik: "20260105",
    name: "Siti Rahma",
    division: "Human Resources",
    position: "HR Specialist",
    email: "siti.r@ias.id",
    phone: "0821-4455-6677",
    workLocation: "KNO",
    employeeStatus: "PKWT",
    lob: "Aviation Security",
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<typeof mockEmployees[0] | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    division: "",
    position: "",
    email: "",
    phone: "",
    workLocation: "CGK",
    lob: "",
    employeeStatus: "PKWTT"
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setEmployees(employees.map(emp => emp.id === editId ? { ...emp, ...formData } : emp));
      setEditId(null);
    } else {
      const newEmployee = {
        id: `EMP-00${employees.length + 1}`,
        ...formData
      };
      setEmployees([newEmployee, ...employees]);
    }
    
    setIsModalOpen(false);
    setFormData({
      nik: "",
      name: "",
      division: "",
      position: "",
      email: "",
      phone: "",
      workLocation: "CGK",
      lob: "",
      employeeStatus: "PKWTT"
    });
  };

  const handleEdit = (emp: typeof mockEmployees[0]) => {
    setFormData(emp);
    setEditId(emp.id);
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const promptDelete = (emp: typeof mockEmployees[0]) => {
    setEmployeeToDelete(emp);
    setIsDeleteModalOpen(true);
    setOpenActionId(null);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.nik.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDivisi = filterDivisi === "" || emp.division.toLowerCase().includes(filterDivisi.toLowerCase());
    const matchesJabatan = filterJabatan === "" || emp.position.toLowerCase().includes(filterJabatan.toLowerCase());
    const matchesLokasi = filterLokasi === "" || emp.workLocation.toLowerCase().includes(filterLokasi.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || emp.employeeStatus === filterStatus;

    return matchesSearch && matchesDivisi && matchesJabatan && matchesLokasi && matchesStatus;
  });

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
          <Button className="gap-2" onClick={() => {
            setEditId(null);
            setFormData({
              nik: "", name: "", division: "", position: "", email: "", phone: "", workLocation: "CGK", lob: "", employeeStatus: "PKWTT"
            });
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Cari NIK atau Nama Karyawan..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            Filter Data
          </Button>

          {isFilterOpen && (
            <Card className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Karyawan
                </h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Divisi</label>
                  <Input placeholder="Filter Divisi..." className="h-8 text-sm" value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Jabatan</label>
                  <Input placeholder="Filter Jabatan..." className="h-8 text-sm" value={filterJabatan} onChange={(e) => setFilterJabatan(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Lokasi Kerja</label>
                  <Input placeholder="Filter Lokasi..." className="h-8 text-sm" value={filterLokasi} onChange={(e) => setFilterLokasi(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Status Karyawan</label>
                  <select 
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PKWT">PKWT</option>
                    <option value="PKWTT">PKWTT</option>
                    <option value="OS">OS</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setFilterDivisi("");
                    setFilterJabatan("");
                    setFilterLokasi("");
                    setFilterStatus("ALL");
                  }}
                >
                  Clear
                </Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>
                  Terapkan
                </Button>
              </div>
            </Card>
          )}
        </div>
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
            <TableHead>Lokasi Kerja</TableHead>
            <TableHead>LOB</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-10 text-text-secondary">
                Tidak ada data karyawan ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium text-navy">{emp.nik}</TableCell>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.division}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.phone}</TableCell>
                <TableCell>{emp.workLocation}</TableCell>
                <TableCell>{emp.lob}</TableCell>
                <TableCell>{emp.employeeStatus}</TableCell>
                <TableCell className="text-right">
                  <div className="relative inline-block text-left">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-text-secondary"
                      onClick={() => setOpenActionId(openActionId === emp.id ? null : emp.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    
                    {openActionId === emp.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)}></div>
                        <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                            onClick={() => handleEdit(emp)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                            onClick={() => promptDelete(emp)}
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

      {/* Form Modal Tambah Karyawan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">
                {editId ? "Edit Karyawan" : "Tambah Karyawan Baru"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">NIK</label>
                  <Input required value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} placeholder="Contoh: 20260105" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Karyawan</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Divisi</label>
                  <Input required value={formData.division} onChange={(e) => setFormData({...formData, division: e.target.value})} placeholder="Contoh: Operations" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Jabatan</label>
                  <Input required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Contoh: Manager" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Email</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@ias.id" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">No. Telepon</label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0812-XXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Lokasi Kerja</label>
                  <Input required value={formData.workLocation} onChange={(e) => setFormData({...formData, workLocation: e.target.value})} placeholder="Contoh: CGK" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">LOB (Line of Business)</label>
                  <Input required value={formData.lob} onChange={(e) => setFormData({...formData, lob: e.target.value})} placeholder="Contoh: Ground Handling" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Status Karyawan</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    value={formData.employeeStatus} 
                    onChange={(e) => setFormData({...formData, employeeStatus: e.target.value})}
                  >
                    <option value="PKWT">PKWT</option>
                    <option value="PKWTT">PKWTT</option>
                    <option value="OS">OS</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-white">Simpan Data</Button>
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
                <h3 className="text-xl font-bold text-navy mb-2">Hapus Karyawan?</h3>
                <p className="text-sm text-text-secondary">
                  Apakah Anda yakin ingin menghapus data <strong>{employeeToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex justify-center gap-3 w-full mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={confirmDelete}>
                  Hapus Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
