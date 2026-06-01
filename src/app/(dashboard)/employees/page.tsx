"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Filter, MoreHorizontal, Download, X, Pencil,
  Trash2, Upload, FileUp, AlertCircle, CheckCircle2, ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Employee {
  id: string;
  nik: string;
  name: string;
  division: string;
  position: string;
  email: string;
  phone: string;
  workLocation: string;
  lob: string;
  employeeStatus: string;
}

interface ImportRow {
  nik: string;
  name: string;
  division: string;
  position: string;
  email: string;
  phone: string;
  workLocation: string;
  lob: string;
  employeeStatus: string;
  _errors: string[];
}

const EMPTY_FORM = {
  nik: "", name: "", division: "", position: "",
  email: "", phone: "", workLocation: "CGK", lob: "", employeeStatus: "PKWTT",
};

const CSV_HEADERS = ["NIK", "Nama", "Divisi", "Jabatan", "Email", "Telepon", "Lokasi Kerja", "LOB", "Status Karyawan"];

function parseCSV(text: string): ImportRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    // Handle quoted fields
    const cols: string[] = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const [nik = "", name = "", division = "", position = "", email = "", phone = "", workLocation = "", lob = "", employeeStatus = "PKWTT"] = cols;

    const errors: string[] = [];
    if (!nik) errors.push("NIK wajib diisi");
    if (!name) errors.push("Nama wajib diisi");
    if (!email) errors.push("Email wajib diisi");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Format email tidak valid");
    if (!division) errors.push("Divisi wajib diisi");
    if (!position) errors.push("Jabatan wajib diisi");

    return { nik, name, division, position, email, phone, workLocation, lob, employeeStatus: employeeStatus || "PKWTT", _errors: errors };
  }).filter((row) => row.nik || row.name || row.email);
}

function downloadTemplate() {
  const rows = [
    CSV_HEADERS.join(","),
    'IAS-2024-0001,Nama Karyawan,Operations,Staff,nama@ias.id,0812-XXXX-XXXX,CGK,Ground Handling,PKWTT',
    'IAS-2024-0002,Karyawan Dua,Finance,Officer,karyawan2@ias.id,0813-XXXX-XXXX,SUB,Food,PKWT',
  ].join("\n");

  const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_import_karyawan.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] = useState<{ success: string[]; failed: { nik: string; reason: string }[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((json) => setEmployees(json.employees ?? []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/employees/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        setEmployees((prev) => prev.map((emp) => (emp.id === editId ? json.employee : emp)));
        setEditId(null);
      } else {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        setEmployees((prev) => [json.employee, ...prev]);
      }
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setFormData({ nik: emp.nik, name: emp.name, division: emp.division, position: emp.position, email: emp.email, phone: emp.phone, workLocation: emp.workLocation, lob: emp.lob, employeeStatus: emp.employeeStatus });
    setEditId(emp.id);
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const promptDelete = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setIsDeleteModalOpen(true);
    setOpenActionId(null);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setSaving(true);
    try {
      await fetch(`/api/employees/${employeeToDelete.id}`, { method: "DELETE" });
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Hanya file .csv yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setImportRows(rows);
      setImportStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employees: validRows }),
      });
      const result = await res.json();
      setImportResult(result);
      setImportStep("result");
      // Refresh employee list
      const refreshed = await fetch("/api/employees").then((r) => r.json());
      setEmployees(refreshed.employees ?? []);
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportStep("upload");
    setImportRows([]);
    setImportFileName("");
    setImportResult(null);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    return (
      (emp.name.toLowerCase().includes(q) || emp.nik.toLowerCase().includes(q)) &&
      (filterDivisi === "" || emp.division.toLowerCase().includes(filterDivisi.toLowerCase())) &&
      (filterJabatan === "" || emp.position.toLowerCase().includes(filterJabatan.toLowerCase())) &&
      (filterLokasi === "" || emp.workLocation.toLowerCase().includes(filterLokasi.toLowerCase())) &&
      (filterStatus === "ALL" || emp.employeeStatus === filterStatus)
    );
  });

  const validImportCount = importRows.filter((r) => r._errors.length === 0).length;
  const invalidImportCount = importRows.filter((r) => r._errors.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Karyawan</h2>
          <p className="text-text-secondary">Kelola data seluruh karyawan dan direktori tenaga kerja.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <Button className="gap-2" onClick={() => { setEditId(null); setFormData(EMPTY_FORM); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input placeholder="Cari NIK atau Nama Karyawan..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-4 w-4" /> Filter Data
          </Button>
          {isFilterOpen && (
            <Card className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Karyawan</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3" /></Button>
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
                  <select className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">Semua Status</option>
                    <option value="PKWT">PKWT</option>
                    <option value="PKWTT">PKWTT</option>
                    <option value="OS">OS</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => { setFilterDivisi(""); setFilterJabatan(""); setFilterLokasi(""); setFilterStatus("ALL"); }}>Clear</Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>Terapkan</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Table */}
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
          {loading ? (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-text-secondary">Memuat data...</TableCell></TableRow>
          ) : filteredEmployees.length === 0 ? (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-text-secondary">Tidak ada data karyawan ditemukan.</TableCell></TableRow>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary" onClick={() => setOpenActionId(openActionId === emp.id ? null : emp.id)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {openActionId === emp.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                        <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                          <button className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2" onClick={() => handleEdit(emp)}>
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2" onClick={() => promptDelete(emp)}>
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

      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Data Karyawan
              </h3>
              <Button variant="ghost" size="icon" onClick={closeImportModal}><X className="h-5 w-5" /></Button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              {[["upload", "Upload File"], ["preview", "Preview Data"], ["result", "Hasil Import"]].map(([step, label], i, arr) => (
                <React.Fragment key={step}>
                  <span className={`font-medium ${importStep === step ? "text-sky" : importStep === "result" || (importStep === "preview" && step === "upload") ? "text-text-secondary" : "text-text-secondary/40"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-text-secondary/40" />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Step 1: Upload ── */}
            {importStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />

                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors ${isDragging ? "border-sky bg-sky/5" : "border-border hover:border-sky/50 hover:bg-muted/30"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-sky" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-navy">Klik untuk upload atau drag & drop</p>
                    <p className="text-sm text-text-secondary mt-1">Hanya file <strong>.csv</strong> yang didukung</p>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-text-secondary space-y-1">
                  <p className="font-medium text-navy text-xs uppercase tracking-wide mb-2">Format kolom yang diperlukan:</p>
                  <div className="flex flex-wrap gap-2">
                    {CSV_HEADERS.map((h) => (
                      <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="gap-2 w-fit text-sky border-sky/30 hover:bg-sky/5" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Download Template CSV
                </Button>
              </div>
            )}

            {/* ── Step 2: Preview ── */}
            {importStep === "preview" && (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" />{validImportCount} valid</span>
                    {invalidImportCount > 0 && (
                      <span className="flex items-center gap-1 text-danger font-medium"><AlertCircle className="h-4 w-4" />{invalidImportCount} error</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportStep("upload"); setImportRows([]); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="overflow-auto flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, i) => (
                        <TableRow key={i} className={row._errors.length > 0 ? "bg-danger/5" : ""}>
                          <TableCell className="text-text-secondary text-xs">{i + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{row.nik || <span className="text-danger italic">kosong</span>}</TableCell>
                          <TableCell>{row.name || <span className="text-danger italic">kosong</span>}</TableCell>
                          <TableCell>{row.division}</TableCell>
                          <TableCell>{row.position}</TableCell>
                          <TableCell className="text-xs">{row.email}</TableCell>
                          <TableCell>
                            {row._errors.length === 0
                              ? <Badge className="bg-success/10 text-success border-success/20 text-xs">Valid</Badge>
                              : <Badge className="bg-danger/10 text-danger border-danger/20 text-xs">Error</Badge>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-danger">{row._errors.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {invalidImportCount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Baris dengan error akan dilewati. Hanya <strong>{validImportCount} baris valid</strong> yang akan diimport.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={closeImportModal}>Batal</Button>
                  <Button
                    className="bg-sky hover:bg-sky/90 text-white gap-2"
                    disabled={validImportCount === 0 || importing}
                    onClick={handleConfirmImport}
                  >
                    {importing ? "Mengimport..." : `Import ${validImportCount} Karyawan`}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Result ── */}
            {importStep === "result" && importResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${importResult.failed.length === 0 ? "bg-success/10" : "bg-warning/10"}`}>
                  <CheckCircle2 className={`h-8 w-8 ${importResult.failed.length === 0 ? "text-success" : "text-warning"}`} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    <strong className="text-success">{importResult.success.length} karyawan</strong> berhasil diimport
                    {importResult.failed.length > 0 && (
                      <>, <strong className="text-danger">{importResult.failed.length} gagal</strong></>
                    )}
                  </p>
                </div>

                {importResult.failed.length > 0 && (
                  <div className="w-full bg-danger/5 border border-danger/20 rounded-lg p-4 text-sm">
                    <p className="font-medium text-danger mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Data yang gagal diimport:
                    </p>
                    <ul className="space-y-1">
                      {importResult.failed.map((f, i) => (
                        <li key={i} className="text-text-secondary">
                          NIK <span className="font-mono text-navy">{f.nik}</span>: {f.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="bg-sky hover:bg-sky/90 text-white" onClick={closeImportModal}>
                  Selesai
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">{editId ? "Edit Karyawan" : "Tambah Karyawan Baru"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">NIK</label>
                  <Input required value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} placeholder="Contoh: IAS-2021-0045" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Karyawan</label>
                  <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Divisi</label>
                  <Input required value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value })} placeholder="Contoh: Operations" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Jabatan</label>
                  <Input required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Contoh: Manager" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Email</label>
                  <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@ias.id" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">No. Telepon</label>
                  <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0812-XXXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Lokasi Kerja</label>
                  <Input required value={formData.workLocation} onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })} placeholder="Contoh: CGK" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">LOB (Line of Business)</label>
                  <Input required value={formData.lob} onChange={(e) => setFormData({ ...formData, lob: e.target.value })} placeholder="Contoh: Ground Handling" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Status Karyawan</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky" value={formData.employeeStatus} onChange={(e) => setFormData({ ...formData, employeeStatus: e.target.value })}>
                    <option value="PKWT">PKWT</option>
                    <option value="PKWTT">PKWTT</option>
                    <option value="OS">OS</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={saving} className="bg-sky hover:bg-sky/90 text-white">
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
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
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" disabled={saving} onClick={confirmDelete}>
                  {saving ? "Menghapus..." : "Hapus Data"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
