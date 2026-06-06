"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, MapPin, Building2, CheckSquare, Star, FolderOpen, MonitorSmartphone, Monitor, Building, MoreHorizontal, Pencil, Trash2, X, Filter, Loader2, Upload, FileUp, ChevronRight, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

const EXCEL_HEADERS = [
  "Nama Vendor", "Lokasi", "Telepon", "Email", "Topik",
  "Metode", "Status", "Harga Min", "Harga Max", "Rating",
  "Pernah Dipakai", "Catatan", "Link Legalitas",
];

type Vendor = {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  topics: string[];
  method: string;
  status: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  usedBefore: boolean;
  notes: string;
  legalDocUrl: string;
};

type Stats = {
  total: number;
  usedCount: number;
  topicsCount: number;
  avgRating: number;
};

const EMPTY_FORM = {
  name: "",
  location: "",
  phone: "",
  email: "",
  topicsRaw: "",
  method: "Online",
  status: "AKTIF",
  priceMin: "",
  priceMax: "",
  rating: 0,
  usedBefore: false,
  notes: "",
  legalDocUrl: "",
};

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function MethodBadge({ method }: { method: string }) {
  if (method === "Hybrid")
    return (
      <div className="flex flex-col items-center justify-center bg-[#F3E8FF] text-purple-700 w-fit px-3 py-1.5 rounded-lg">
        <MonitorSmartphone className="h-4 w-4 mb-0.5" />
        <span className="text-[10px] font-semibold">Hybrid</span>
      </div>
    );
  if (method === "Online")
    return (
      <div className="flex flex-col items-center justify-center bg-[#E5F6FD] text-sky w-fit px-3 py-1.5 rounded-lg">
        <Monitor className="h-4 w-4 mb-0.5" />
        <span className="text-[10px] font-semibold">Online</span>
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center bg-[#FFF8E6] text-orange-600 w-fit px-3 py-1.5 rounded-lg">
      <Building className="h-4 w-4 mb-0.5" />
      <span className="text-[10px] font-semibold">Offline</span>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, usedCount: 0, topicsCount: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] = useState<{ success: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportStep("upload");
    setImportRows([]);
    setImportFileName("");
    setImportResult(null);
    setImporting(false);
  };

  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterUsed, setFilterUsed] = useState("Semua");
  const [filterRating, setFilterRating] = useState("Semua");

  const [form, setForm] = useState(EMPTY_FORM);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterMethod !== "Semua") params.set("method", filterMethod);
      if (filterStatus !== "Semua") params.set("status", filterStatus);
      if (filterUsed === "Pernah Dipakai") params.set("usedBefore", "true");
      if (filterUsed === "Belum Pernah") params.set("usedBefore", "false");
      if (filterRating === "4 Keatas") params.set("minRating", "4");
      if (filterRating === "3 Keatas") params.set("minRating", "3");

      const res = await fetch(`/api/vendors?${params.toString()}`);
      const data = await res.json();
      setVendors(data.vendors ?? []);
      setStats(data.stats ?? { total: 0, usedCount: 0, topicsCount: 0, avgRating: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, filterMethod, filterStatus, filterUsed, filterRating]);

  useEffect(() => {
    setCurrentPage(1);
    fetchVendors();
  }, [fetchVendors]);

  function openAdd() {
    setEditingVendor(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEdit(v: Vendor) {
    setEditingVendor(v);
    setForm({
      name: v.name,
      location: v.location,
      phone: v.phone,
      email: v.email,
      topicsRaw: v.topics.join(", "),
      method: v.method,
      status: v.status,
      priceMin: String(v.priceMin),
      priceMax: String(v.priceMax),
      rating: v.rating,
      usedBefore: v.usedBefore,
      notes: v.notes,
      legalDocUrl: v.legalDocUrl,
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        location: form.location,
        phone: form.phone,
        email: form.email,
        topics: form.topicsRaw.split(",").map((t) => t.trim()).filter(Boolean),
        method: form.method,
        status: form.status,
        priceMin: parseInt(String(form.priceMin)) || 0,
        priceMax: parseInt(String(form.priceMax)) || 0,
        rating: form.rating,
        usedBefore: form.usedBefore,
        notes: form.notes,
        legalDocUrl: form.legalDocUrl,
      };

      const url = editingVendor ? `/api/vendors/${editingVendor.id}` : "/api/vendors";
      const method = editingVendor ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal menyimpan vendor");

      setIsModalOpen(false);
      fetchVendors();
    } finally {
      setSaving(false);
    }
  }

  function promptDelete(v: Vendor) {
    setVendorToDelete(v);
    setIsDeleteModalOpen(true);
  }

  const handleFileSelect = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert("Hanya file Excel (.xlsx / .xls) yang didukung.");
      return;
    }
    setImportFileName(file.name);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
      const parsed = rows.map((row) => {
        const errors: string[] = [];
        if (!row["Nama Vendor"]) errors.push("Nama Vendor wajib diisi");
        if (!row["Lokasi"]) errors.push("Lokasi wajib diisi");
        if (!row["Telepon"]) errors.push("Telepon wajib diisi");
        if (!row["Email"]) errors.push("Email wajib diisi");
        return { ...row, _errors: errors };
      });
      setImportRows(parsed);
      setImportStep("preview");
    } catch {
      alert("Gagal membaca file Excel.");
    }
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
      const data = validRows.map((row) => ({
        name: row["Nama Vendor"],
        location: row["Lokasi"] || "",
        phone: row["Telepon"] || "",
        email: row["Email"] || "",
        topics: row["Topik"] ? String(row["Topik"]).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        method: row["Metode"] || "Online",
        status: row["Status"] || "AKTIF",
        priceMin: parseInt(String(row["Harga Min"])) || 0,
        priceMax: parseInt(String(row["Harga Max"])) || 0,
        rating: parseFloat(String(row["Rating"])) || 0,
        usedBefore: String(row["Pernah Dipakai"]).toLowerCase() === "ya",
        notes: row["Catatan"] || "",
        legalDocUrl: row["Link Legalitas"] || "",
      }));
      const res = await fetch("/api/vendors/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Gagal mengimport");
      setImportResult({ success: data.length });
      setImportStep("result");
      fetchVendors();
    } catch {
      alert("Terjadi kesalahan saat mengimport.");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    if (vendors.length === 0) {
      alert("Tidak ada data untuk dieksport.");
      return;
    }
    const exportData = vendors.map((v) => ({
      "Nama Vendor": v.name,
      "Lokasi": v.location,
      "Telepon": v.phone,
      "Email": v.email,
      "Topik": v.topics.join(", "),
      "Metode": v.method,
      "Status": v.status === "AKTIF" ? "Aktif" : "Tidak Aktif",
      "Harga Min": v.priceMin,
      "Harga Max": v.priceMax,
      "Rating": v.rating,
      "Pernah Dipakai": v.usedBefore ? "Ya" : "Tidak",
      "Catatan": v.notes,
      "Link Legalitas": v.legalDocUrl,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [28, 16, 18, 28, 30, 10, 12, 14, 14, 8, 14, 35, 30].map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, "Data Vendor");
    XLSX.writeFile(wb, "Data_Vendor.xlsx");
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Nama Vendor": "PT Mitra Pelatihan Indonesia",
        "Lokasi": "Jakarta",
        "Telepon": "0812-3456-7890",
        "Email": "info@mitrapelatihan.com",
        "Topik": "Leadership, Komunikasi, Team Building",
        "Metode": "Hybrid",
        "Status": "AKTIF",
        "Harga Min": 3000000,
        "Harga Max": 5000000,
        "Rating": 4.5,
        "Pernah Dipakai": "Ya",
        "Catatan": "Trainer profesional, perlu konfirmasi H-7",
        "Link Legalitas": "",
      },
      {
        "Nama Vendor": "Experia Training Center",
        "Lokasi": "Surabaya",
        "Telepon": "0856-1122-3344",
        "Email": "hello@experia.id",
        "Topik": "Selling Skills, Komunikasi",
        "Metode": "Online",
        "Status": "AKTIF",
        "Harga Min": 1500000,
        "Harga Max": 2500000,
        "Rating": 4.0,
        "Pernah Dipakai": "Tidak",
        "Catatan": "",
        "Link Legalitas": "",
      },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = EXCEL_HEADERS.map((_, i) => ({ wch: i < 4 ? 28 : 18 }));
    XLSX.utils.book_append_sheet(wb, ws, "Template Vendor");
    XLSX.writeFile(wb, "Template_Import_Vendor.xlsx");
  };

  const totalPages = Math.ceil(vendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = vendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function confirmDelete() {
    if (!vendorToDelete) return;
    try {
      await fetch(`/api/vendors/${vendorToDelete.id}`, { method: "DELETE" });
      fetchVendors();
    } finally {
      setIsDeleteModalOpen(false);
      setVendorToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Vendor</h2>
          <p className="text-text-secondary">Kelola dan cari vendor untuk penyelenggaraan training</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-navy" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" className="gap-2 text-navy" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="gap-2 bg-sky hover:bg-sky/90 text-white" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Tambah Vendor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-4 border border-border shadow-sm">
          <div className="p-3 bg-sky/10 rounded-lg">
            <Building2 className="h-6 w-6 text-sky" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.total}</p>
            <p className="text-sm font-medium text-text-secondary">Total Vendor</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border border-border shadow-sm">
          <div className="p-3 bg-success/10 rounded-lg">
            <CheckSquare className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.usedCount}</p>
            <p className="text-sm font-medium text-text-secondary">Pernah Dipakai</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border border-border shadow-sm">
          <div className="p-3 bg-warning/10 rounded-lg">
            <Star className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.avgRating}</p>
            <p className="text-sm font-medium text-text-secondary">Rata-rata Rating</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border border-border shadow-sm">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.topicsCount}</p>
            <p className="text-sm font-medium text-text-secondary">Topik Tersedia</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sky" />
          <Input
            placeholder="Cari nama vendor, topik, kota..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
            Filter Data
          </Button>

          {isFilterOpen && (
            <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-5 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-navy font-semibold">
                  <Filter className="h-4 w-4" />
                  <span>Filter Data</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Metode</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value)}
                    >
                      <option>Semua</option>
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Status</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option>Semua</option>
                      <option value="AKTIF">Aktif</option>
                      <option value="TIDAK_AKTIF">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Rating</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                    >
                      <option>Semua</option>
                      <option>4 Keatas</option>
                      <option>3 Keatas</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-secondary">Pernah Dipakai?</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={filterUsed}
                      onChange={(e) => setFilterUsed(e.target.value)}
                    >
                      <option>Semua</option>
                      <option>Pernah Dipakai</option>
                      <option>Belum Pernah</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-border mt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFilterMethod("Semua");
                      setFilterStatus("Semua");
                      setFilterUsed("Semua");
                      setFilterRating("Semua");
                      setIsFilterOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button className="w-full bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>
                    Terapkan
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Vendor List */}
      <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-[#FBFBFB] text-xs font-semibold text-text-secondary tracking-wider uppercase">
          <div className="col-span-3">Vendor</div>
          <div className="col-span-3">Kontak</div>
          <div className="col-span-2">Topik</div>
          <div className="col-span-1">Metode</div>
          <div className="col-span-2">Harga/Hari</div>
          <div className="col-span-1 text-center">Aksi</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Memuat data vendor...
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">Tidak ada vendor yang ditemukan.</div>
        ) : (
          paginatedVendors.map((v) => (
            <div key={v.id} className="grid grid-cols-12 gap-4 p-5 border-b border-border items-center hover:bg-slate-50 transition-colors last:border-b-0">
              <div className="col-span-3 space-y-2">
                <h4 className="font-bold text-navy text-[15px] leading-tight">{v.name}</h4>
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="h-3.5 w-3.5 text-danger" /> {v.location}
                </div>
                {v.usedBefore && (
                  <Badge className="bg-success/10 text-success border-transparent text-[10px]">Pernah Dipakai</Badge>
                )}
              </div>
              <div className="col-span-3 space-y-1">
                <p className="text-sm font-medium text-navy">{v.phone}</p>
                <p className="text-sm text-text-secondary">{v.email}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i <= Math.round(v.rating) ? "text-warning fill-warning" : "text-slate-300 fill-slate-300"}`}
                    />
                  ))}
                  <span className="text-xs text-text-secondary ml-1">{v.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-1.5">
                  {v.topics.slice(0, 2).map((t) => (
                    <Badge key={t} variant="outline" className="bg-sky/10 text-sky border-transparent font-medium text-[11px]">{t}</Badge>
                  ))}
                  {v.topics.length > 2 && (
                    <Badge variant="outline" className="bg-muted text-text-secondary border-transparent font-medium text-[11px]">+{v.topics.length - 2}</Badge>
                  )}
                </div>
              </div>
              <div className="col-span-1">
                <MethodBadge method={v.method} />
              </div>
              <div className="col-span-2">
                <p className="font-bold text-navy">{formatRupiah(v.priceMin)}</p>
                <p className="text-xs text-text-secondary">s.d. {formatRupiah(v.priceMax)}</p>
              </div>
              <div className="col-span-1 flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem className="gap-2 cursor-pointer text-navy" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                      onClick={() => promptDelete(v)}
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && vendors.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-sm text-text-secondary">
            Menampilkan{" "}
            <span className="font-medium text-navy">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, vendors.length)}
            </span>{" "}
            dari <span className="font-medium text-navy">{vendors.length}</span> vendor
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

      {/* Modal Tambah / Edit Vendor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">{editingVendor ? "Edit Vendor" : "Tambah Vendor Baru"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Vendor</label>
                  <Input required placeholder="Contoh: PT Mitra Pelatihan Indonesia" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Lokasi (Kota)</label>
                  <Input required placeholder="Contoh: Jakarta" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nomor Telepon</label>
                  <Input required placeholder="Contoh: 0812-3456-7890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Email</label>
                  <Input required type="email" placeholder="Contoh: info@mitrapelatihan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Topik Tersedia (Pisahkan dengan koma)</label>
                  <Input placeholder="Contoh: Leadership, Komunikasi, Sales" value={form.topicsRaw} onChange={(e) => setForm({ ...form, topicsRaw: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Metode Penyelenggaraan</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Status Vendor</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="TIDAK_AKTIF">Tidak Aktif</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Estimasi Harga Minimum (Rp)</label>
                  <Input type="number" placeholder="Contoh: 2000000" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Estimasi Harga Maksimum (Rp)</label>
                  <Input type="number" placeholder="Contoh: 5000000" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
                </div>

                <div className="space-y-2 sm:col-span-2 mt-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Rating Vendor</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 cursor-pointer transition-colors ${i <= form.rating ? "text-warning fill-warning" : "text-slate-300 fill-slate-300 hover:text-warning hover:fill-warning"}`}
                        onClick={() => setForm({ ...form, rating: i })}
                      />
                    ))}
                    <span className="text-sm text-text-secondary ml-1">{form.rating > 0 ? `${form.rating}.0` : "Belum dirating"}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 p-4 bg-[#FAF9F6] border border-border rounded-xl flex items-center justify-between mt-2">
                  <div>
                    <p className="font-bold text-navy text-[15px]">Pernah Dipakai?</p>
                    <p className="text-sm text-text-secondary">Aktifkan jika sudah pernah bekerja sama</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.usedBefore}
                      onChange={(e) => setForm({ ...form, usedBefore: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                </div>

                <div className="space-y-2 sm:col-span-2 mt-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Catatan</label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-[#FAF9F6] px-4 py-3 text-[15px] ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="cth. Trainer sangat interaktif, cocok untuk peserta level supervisor. Perlu konfirmasi H-7 sebelum pelaksanaan."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 mt-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Legalitas Dokumen</label>
                  <Input type="url" placeholder="Masukkan Link URL (contoh: https://drive.google.com/...)" value={form.legalDocUrl} onChange={(e) => setForm({ ...form, legalDocUrl: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Batal
                </Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-white gap-2" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingVendor ? "Simpan Perubahan" : "Simpan Vendor"}
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
              <div className="p-4 bg-danger/10 rounded-full">
                <Trash2 className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy mb-2">Hapus Vendor?</h3>
                <p className="text-sm text-text-secondary">
                  Apakah Anda yakin ingin menghapus vendor{" "}
                  <strong>{vendorToDelete?.name}</strong>? Data ini tidak dapat dikembalikan.
                </p>
              </div>
              <div className="flex justify-center gap-3 w-full mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={confirmDelete}>
                  Hapus Vendor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Data Vendor
              </h3>
              <Button variant="ghost" size="icon" onClick={closeImportModal}><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm">
              {[["upload", "Upload File"], ["preview", "Preview Data"], ["result", "Hasil Import"]].map(([step, label], i, arr) => (
                <Fragment key={step}>
                  <span className={`font-medium ${importStep === step ? "text-sky" : importStep === "result" || (importStep === "preview" && step === "upload") ? "text-text-secondary" : "text-text-secondary/40"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-text-secondary/40" />}
                </Fragment>
              ))}
            </div>

            {/* Step 1: Upload */}
            {importStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }}
                />

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
                    <p className="text-sm text-text-secondary mt-1">Hanya file <strong>.xlsx</strong> yang didukung</p>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-text-secondary space-y-1">
                  <p className="font-medium text-navy text-xs uppercase tracking-wide mb-2">Format kolom yang diperlukan:</p>
                  <div className="flex flex-wrap gap-2">
                    {EXCEL_HEADERS.map((h) => (
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
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium">
                      <CheckCircle2 className="h-4 w-4" />{importRows.filter((r) => r._errors.length === 0).length} valid
                    </span>
                    {importRows.filter((r) => r._errors.length > 0).length > 0 && (
                      <span className="flex items-center gap-1 text-danger font-medium">
                        <AlertCircle className="h-4 w-4" />{importRows.filter((r) => r._errors.length > 0).length} error
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportStep("upload"); setImportRows([]); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="overflow-auto flex-1 border rounded-lg max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-8">#</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Nama Vendor</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Lokasi</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Metode</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, i) => (
                        <tr key={i} className={`border-t border-border ${row._errors.length > 0 ? "bg-danger/5" : ""}`}>
                          <td className="px-3 py-2 text-text-secondary text-xs">{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row["Nama Vendor"] || <span className="text-danger italic">kosong</span>}</td>
                          <td className="px-3 py-2 text-xs">{row["Lokasi"]}</td>
                          <td className="px-3 py-2 text-xs">{row["Email"]}</td>
                          <td className="px-3 py-2 text-xs">{row["Metode"] || "Online"}</td>
                          <td className="px-3 py-2">
                            {row._errors.length === 0
                              ? <Badge className="bg-success/10 text-success border-success/20 text-xs">Valid</Badge>
                              : <Badge className="bg-danger/10 text-danger border-danger/20 text-xs">Error</Badge>
                            }
                          </td>
                          <td className="px-3 py-2 text-xs text-danger">{row._errors.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importRows.filter((r) => r._errors.length > 0).length > 0 && (
                  <p className="text-xs text-text-secondary">Baris dengan error akan dilewati. Hanya baris valid yang akan diimport.</p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={closeImportModal}>Batal</Button>
                  <Button
                    className="bg-sky hover:bg-sky/90 text-white gap-2"
                    disabled={importRows.filter((r) => r._errors.length === 0).length === 0 || importing}
                    onClick={handleConfirmImport}
                  >
                    {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {importing ? "Mengimport..." : `Import ${importRows.filter((r) => r._errors.length === 0).length} Vendor`}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {importStep === "result" && importResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    <strong className="text-success">{importResult.success} vendor</strong> berhasil diimport ke dalam sistem.
                  </p>
                </div>
                <Button className="bg-sky hover:bg-sky/90 text-white" onClick={closeImportModal}>
                  Selesai
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
