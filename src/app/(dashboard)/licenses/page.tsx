"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Filter, Download, Plus, Edit, Trash2, X, Upload, MoreHorizontal,
  FileUp, AlertCircle, CheckCircle2, ChevronRight,
} from "lucide-react";
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

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

const IMPORT_HEADERS = [
  "NIK", "Nama", "Jabatan", "Lokasi Kerja", "Status Karyawan",
  "LOB", "Nama Lisensi", "No Lisensi", "Kategori", "Tanggal Terbit", "Tanggal Kadaluwarsa",
];

interface ImportRow {
  nik: string; name: string; position: string; workLocation: string;
  employeeStatus: string; lob: string; licenseName: string;
  licenseNumber: string; category: string; issuedDate: string; expiryDate: string;
  _errors: string[];
}

function formatExcelDate(excelValue: any): string {
  if (!excelValue) return "";
  if (typeof excelValue === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(excelValue.trim())) {
    return excelValue.trim();
  }
  if (typeof excelValue === "number") {
    // Excel epoch starts on Jan 1, 1900. 
    // 25569 is the number of days between Jan 1, 1900 and Jan 1, 1970
    const date = new Date((excelValue - (25569 + 1)) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }
  return String(excelValue).trim();
}

function parseXLSX(buffer: ArrayBuffer): ImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });

  return rows.map((row) => {
    const nik = String(row["NIK"] ?? "").trim();
    const name = String(row["Nama"] ?? "").trim();
    const position = String(row["Jabatan"] ?? "").trim();
    const workLocation = String(row["Lokasi Kerja"] ?? "").trim();
    const employeeStatus = String(row["Status Karyawan"] ?? "").trim() || "PKWTT";
    const lob = String(row["LOB"] ?? "").trim();
    const licenseName = String(row["Nama Lisensi"] ?? "").trim();
    const licenseNumber = String(row["No Lisensi"] ?? "").trim() || "-";
    const category = String(row["Kategori"] ?? "").trim() || "Operasional";
    const issuedDate = formatExcelDate(row["Tanggal Terbit"]);
    const expiryDate = formatExcelDate(row["Tanggal Kadaluwarsa"]);

    const errors: string[] = [];
    if (!nik) errors.push("NIK wajib diisi");
    if (!name) errors.push("Nama wajib diisi");
    if (!licenseName) errors.push("Nama Lisensi wajib diisi");
    if (!issuedDate) errors.push("Tanggal Terbit wajib diisi");
    if (!expiryDate) errors.push("Tanggal Kadaluwarsa wajib diisi");

    return {
      nik, name, position, workLocation, employeeStatus,
      lob, licenseName, licenseNumber,
      category, issuedDate, expiryDate, _errors: errors,
    };
  }).filter((r) => r.nik || r.name || r.licenseName);
}

function downloadTemplate() {
  const sampleData = [
    { NIK: "IAS-2024-0001", Nama: "Budi Santoso", Jabatan: "Aviation Safety Inspector", "Lokasi Kerja": "CGK", "Status Karyawan": "PKWTT", LOB: "Ground Handling", "Nama Lisensi": "Aircraft Maintenance Engineer (AME)", "No Lisensi": "AME-2024-001", Kategori: "Operasional", "Tanggal Terbit": "2024-01-15", "Tanggal Kadaluwarsa": "2027-01-15" },
    { NIK: "IAS-2024-0002", Nama: "Siti Rahma", Jabatan: "Flight Instructor", "Lokasi Kerja": "SUB", "Status Karyawan": "PKWT", LOB: "Aviation Security", "Nama Lisensi": "Basic Aviation Security (AVSEC)", "No Lisensi": "AVSEC-2024-002", Kategori: "Operasional", "Tanggal Terbit": "2024-03-10", "Tanggal Kadaluwarsa": "2026-03-10" },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData, { header: IMPORT_HEADERS });
  XLSX.utils.book_append_sheet(wb, ws, "Template Lisensi");
  XLSX.writeFile(wb, "template_import_lisensi.xlsx");
}

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

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] = useState<{ created: string[]; updated: string[]; failed: { nik: string; licenseName: string; reason: string }[] } | null>(null);
  const [existingLicenseKeys, setExistingLicenseKeys] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  // ── Import ─────────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Hanya file .xlsx yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rows = parseXLSX(buffer);
      setImportRows(rows);

      // Cek kombinasi (NIK + Nama Lisensi) yang sudah ada untuk badge Baru/Update
      const keys = rows
        .filter((r) => r.nik && r.licenseName)
        .map((r) => ({ nik: r.nik, licenseName: r.licenseName }));
      try {
        const res = await fetch("/api/licenses/check-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys }),
        });
        const json = await res.json();
        setExistingLicenseKeys(new Set(json.existing ?? []));
      } catch {
        setExistingLicenseKeys(new Set());
      }

      setImportStep("preview");
    };
    reader.readAsArrayBuffer(file);
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
      const res = await fetch("/api/licenses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenses: validRows }),
      });
      const result = await res.json();
      setImportResult(result);
      setImportStep("result");
      const refreshed = await fetch("/api/licenses").then((r) => r.json());
      setLicenses(refreshed.licenses ?? []);
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
    setExistingLicenseKeys(new Set());
  };

  const validImportCount = importRows.filter((r) => r._errors.length === 0).length;
  const invalidImportCount = importRows.filter((r) => r._errors.length > 0).length;

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab, filterColNama, filterColLokasi, filterColLisensi, filterColStatus]);

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

  const totalPages = Math.ceil(filteredLicenses.length / ITEMS_PER_PAGE);
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleExport = () => {
    if (filteredLicenses.length === 0) {
      alert("Tidak ada data untuk dieksport");
      return;
    }

    const exportData = filteredLicenses.map((item, idx) => ({
      "No": idx + 1,
      "NIK": item.employee.nik,
      "Nama": item.employee.name,
      "Jabatan": item.employee.position,
      "Lokasi Kerja": item.employee.workLocation,
      "Status Karyawan": item.employee.employeeStatus,
      "LOB": item.employee.lob,
      "Nama Lisensi": item.licenseName,
      "No Lisensi": item.licenseNumber || "-",
      "Kategori": item.category,
      "Tanggal Terbit": item.issuedDate,
      "Tanggal Kadaluwarsa": item.expiryDate,
      "Status": item.status === "ACTIVE" ? "Aktif" :
                item.status === "EXPIRING_5_MONTHS" ? "Berakhir < 5 Bulan" :
                item.status === "EXPIRING_3_MONTHS" ? "Berakhir < 3 Bulan" :
                item.status === "EXPIRING_1_MONTH" ? "Berakhir < 1 Bulan" :
                item.status === "EXPIRED" ? "Kadaluwarsa" : item.status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Data Lisensi");
    XLSX.writeFile(wb, "Monitoring_Lisensi_Sertifikasi.xlsx");
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
            <Button variant="outline" className="gap-2 border-border/50 text-text-secondary" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" className="gap-2 border-border/50 text-text-secondary" onClick={handleExport}>
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
                  paginatedLicenses.map((item) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              className="w-full flex items-center gap-2 text-navy cursor-pointer"
                              onClick={() => handleOpenModal("edit", item)}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                              onClick={() => handleOpenModal("delete", item)}
                            >
                              <Trash2 className="h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredLicenses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
              <p className="text-sm text-text-secondary">
                Menampilkan{" "}
                <span className="font-medium text-navy">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLicenses.length)}
                </span>{" "}
                dari <span className="font-medium text-navy">{filteredLicenses.length}</span> lisensi
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</Button>
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`e-${idx}`} className="px-2 text-text-secondary text-sm">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={currentPage === item ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0${currentPage === item ? " bg-navy text-surface" : ""}`}
                        onClick={() => setCurrentPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</Button>
                <Button variant="outline" size="sm" className="h-8 px-3" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Data Lisensi
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

            {/* Step 1: Upload */}
            {importStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />
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
                    <p className="font-semibold text-navy">Klik untuk upload atau drag &amp; drop</p>
                    <p className="text-sm text-text-secondary mt-1">Hanya file <strong>.xlsx</strong> yang didukung</p>
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-4 text-sm text-text-secondary">
                  <p className="font-medium text-navy text-xs uppercase tracking-wide mb-2">Format kolom yang diperlukan:</p>
                  <div className="flex flex-wrap gap-2">
                    {IMPORT_HEADERS.map((h) => (
                      <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="gap-2 w-fit text-sky border-sky/30 hover:bg-sky/5" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Download Template Excel
                </Button>
              </div>
            )}

            {/* Step 2: Preview */}
            {importStep === "preview" && (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" />{validImportCount} valid</span>
                    {invalidImportCount > 0 && (
                      <span className="flex items-center gap-1 text-danger font-medium"><AlertCircle className="h-4 w-4" />{invalidImportCount} error</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportStep("upload"); setImportRows([]); setExistingLicenseKeys(new Set()); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  Kombinasi NIK + Nama Lisensi yang sudah terdaftar akan <strong>ditimpa seluruh datanya</strong> sesuai file Excel ini.
                </div>

                <div className="overflow-auto flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Nama Lisensi</TableHead>
                        <TableHead>Kadaluwarsa</TableHead>
                        <TableHead>Aksi</TableHead>
                        <TableHead>Validasi</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, i) => {
                        const key = `${row.nik}|${row.licenseName}`;
                        return (
                          <TableRow key={i} className={row._errors.length > 0 ? "bg-danger/5" : ""}>
                            <TableCell className="text-text-secondary text-xs">{i + 1}</TableCell>
                            <TableCell className="font-mono text-xs">{row.nik || <span className="text-danger italic">kosong</span>}</TableCell>
                            <TableCell>{row.name || <span className="text-danger italic">kosong</span>}</TableCell>
                            <TableCell className="font-medium text-navy">{row.licenseName || <span className="text-danger italic">kosong</span>}</TableCell>
                            <TableCell className="text-xs">{row.expiryDate}</TableCell>
                            <TableCell>
                              {existingLicenseKeys.has(key)
                                ? <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Update</Badge>
                                : <Badge className="bg-sky/10 text-sky border-sky/30 text-xs">Baru</Badge>
                              }
                            </TableCell>
                            <TableCell>
                              {row._errors.length === 0
                                ? <Badge className="bg-success/10 text-success border-success/20 text-xs">Valid</Badge>
                                : <Badge className="bg-danger/10 text-danger border-danger/20 text-xs">Error</Badge>
                              }
                            </TableCell>
                            <TableCell className="text-xs text-danger">{row._errors.join(", ")}</TableCell>
                          </TableRow>
                        );
                      })}
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
                    {importing ? "Mengimport..." : `Import ${validImportCount} Lisensi`}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {importStep === "result" && importResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${importResult.failed.length === 0 ? "bg-success/10" : "bg-warning/10"}`}>
                  <CheckCircle2 className={`h-8 w-8 ${importResult.failed.length === 0 ? "text-success" : "text-warning"}`} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    {importResult.created.length > 0 && (
                      <><strong className="text-success">{importResult.created.length} lisensi baru</strong> ditambahkan</>
                    )}
                    {importResult.created.length > 0 && importResult.updated.length > 0 && <>, </>}
                    {importResult.updated.length > 0 && (
                      <><strong className="text-sky">{importResult.updated.length} lisensi</strong> diperbarui</>
                    )}
                    {importResult.failed.length > 0 && (
                      <>, <strong className="text-danger">{importResult.failed.length} gagal</strong></>
                    )}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  {importResult.created.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-lg px-3 py-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> {importResult.created.length} Baru
                    </div>
                  )}
                  {importResult.updated.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-sky/10 text-sky rounded-lg px-3 py-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> {importResult.updated.length} Diperbarui
                    </div>
                  )}
                  {importResult.failed.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-danger/10 text-danger rounded-lg px-3 py-2 font-medium">
                      <AlertCircle className="h-4 w-4" /> {importResult.failed.length} Gagal
                    </div>
                  )}
                </div>

                {importResult.failed.length > 0 && (
                  <div className="w-full bg-danger/5 border border-danger/20 rounded-lg p-4 text-sm">
                    <p className="font-medium text-danger mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Data yang gagal diimport:
                    </p>
                    <ul className="space-y-1">
                      {importResult.failed.map((f, i) => (
                        <li key={i} className="text-text-secondary">
                          NIK <span className="font-mono text-navy">{f.nik}</span> ({f.licenseName}): {f.reason}
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
