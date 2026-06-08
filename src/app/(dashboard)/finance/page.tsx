"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, X, Wallet, ReceiptText, AlertTriangle, ChevronDown, ChevronUp, CornerDownRight, Link, FileText, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface BudgetProcess {
  id: string;
  stepNo: number;
  tahap: string;
  status: string;
  tanggal: string | null;
  keterangan: string;
  linkBukti: string;
}

interface Budget {
  id: string;
  trainingName: string;
  budgetYear: number;
  budgetMonth: number;
  trainingType: string;
  plannedAmount: number;
  actualAmount: number;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  organizer: string;
  dueDate: string | null;
  status: string;
  approvalStatus: string;
  processes: BudgetProcess[];
}

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DEFAULT_PROCESS_STEPS = [
  "Invoice Sent", "Input Invoice", "Verifikasi Finance 1", "Verifikasi Finance 2", "Payment Status",
];

const makeDefaultProcessDetails = () =>
  DEFAULT_PROCESS_STEPS.map((tahap, i) => ({
    id: `new-${i}-${Date.now()}`,
    tahap,
    status: "Belum",
    tanggal: "",
    keterangan: "",
    linkBukti: "",
  }));

const EMPTY_FORM = {
  trainingName: "", budgetYear: new Date().getFullYear(), budgetMonth: new Date().getMonth() + 1,
  trainingType: "Mandatory", plannedAmount: 0, actualAmount: 0,
  invoiceNumber: "", invoiceDate: "", organizer: "", dueDate: "", status: "Belum Dibayar", approvalStatus: "Menunggu Persetujuan",
  processDetails: [] as { id: string; tahap: string; status: string; tanggal: string; keterangan: string; linkBukti: string }[],
};

type FormData = typeof EMPTY_FORM;

function FormFields({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
  const updateDetail = (index: number, field: string, value: string) => {
    const newDetails = [...data.processDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setData({ ...data, processDetails: newDetails });
  };

  const removeDetail = (index: number) => {
    const newDetails = [...data.processDetails];
    newDetails.splice(index, 1);
    setData({ ...data, processDetails: newDetails });
  };

  const addDetail = () => {
    const newDetails = [
      ...data.processDetails,
      { id: `new-${Date.now()}`, tahap: "", status: "Belum", tanggal: "", keterangan: "", linkBukti: "" },
    ];
    setData({ ...data, processDetails: newDetails });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Section 1: Perencanaan */}
        <div>
          <h4 className="text-sm font-semibold text-navy flex items-center gap-2 mb-4 border-b pb-2">
            <Wallet className="h-4 w-4" /> Informasi Perencanaan
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Nama Training</label>
              <Input required value={data.trainingName} onChange={(e) => setData({ ...data, trainingName: e.target.value })} placeholder="Nama program training" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tahun Anggaran</label>
                <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.budgetYear} onChange={(e) => setData({ ...data, budgetYear: parseInt(e.target.value) })}>
                  {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Bulan</label>
                <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.budgetMonth} onChange={(e) => setData({ ...data, budgetMonth: parseInt(e.target.value) })}>
                  {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Jenis Anggaran</label>
                <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.trainingType} onChange={(e) => setData({ ...data, trainingType: e.target.value })}>
                  <option value="Mandatory">Mandatory</option>
                  <option value="Non-Mandatory">Non-Mandatory</option>
                  <option value="Magang">Magang</option>
                  <option value="Honor Pelatih">Honor Pelatih</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Rencana Anggaran (Rp)</label>
                <Input type="number" min={0} value={data.plannedAmount} onChange={(e) => setData({ ...data, plannedAmount: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Status Persetujuan</label>
                <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.approvalStatus} onChange={(e) => setData({ ...data, approvalStatus: e.target.value })}>
                  <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                  <option value="Disetujui">Disetujui</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Realisasi & Tagihan */}
        <div>
          <h4 className="text-sm font-semibold text-navy flex items-center gap-2 mb-4 border-b pb-2">
            <ReceiptText className="h-4 w-4" /> Informasi Realisasi &amp; Tagihan
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Penyelenggara</label>
                <Input value={data.organizer} onChange={(e) => setData({ ...data, organizer: e.target.value })} placeholder="Nama penyelenggara" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Realisasi Biaya (Rp)</label>
                <Input type="number" min={0} value={data.actualAmount} onChange={(e) => setData({ ...data, actualAmount: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">No. Invoice</label>
                <Input value={data.invoiceNumber} onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })} placeholder="Contoh: INV-2026-0001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tgl. Invoice</label>
                <Input type="date" value={data.invoiceDate} onChange={(e) => setData({ ...data, invoiceDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tgl. Jatuh Tempo</label>
                <Input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Status Pembayaran</label>
                <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })}>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Dibayar">Belum Dibayar</option>
                  <option value="Jatuh Tempo">Jatuh Tempo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-navy">Rincian Proses Pembayaran</h4>
                <Button type="button" variant="outline" size="sm" className="gap-2 text-sky border-sky/30 hover:bg-sky/5" onClick={addDetail}>
                  <Plus className="h-4 w-4" /> Tambah Baris
                </Button>
              </div>
              <div className="border border-border rounded-lg p-4 space-y-4">
                {data.processDetails.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-4">Belum ada rincian ditambahkan.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_auto] gap-2 px-1">
                      <span className="text-xs font-medium text-text-secondary">Tahapan Proses</span>
                      <span className="text-xs font-medium text-text-secondary">Status</span>
                      <span className="text-xs font-medium text-text-secondary">Tanggal</span>
                      <span className="text-xs font-medium text-text-secondary">Keterangan</span>
                      <span className="text-xs font-medium text-text-secondary">Link Bukti</span>
                      <span className="w-8"></span>
                    </div>
                    {data.processDetails.map((detail, index) => (
                      <div key={detail.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_auto] gap-2 items-start">
                        <Input
                          placeholder="Tahapan"
                          value={detail.tahap}
                          onChange={(e) => updateDetail(index, "tahap", e.target.value)}
                        />
                        <select
                          className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                          value={detail.status}
                          onChange={(e) => updateDetail(index, "status", e.target.value)}
                        >
                          <option value="Selesai">Selesai</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Menunggu">Menunggu</option>
                          <option value="Belum">Belum</option>
                        </select>
                        <Input
                          type="date"
                          value={detail.tanggal}
                          onChange={(e) => updateDetail(index, "tanggal", e.target.value)}
                        />
                        <Input
                          placeholder="Keterangan"
                          value={detail.keterangan}
                          onChange={(e) => updateDetail(index, "keterangan", e.target.value)}
                        />
                        <Input
                          placeholder="https://..."
                          value={detail.linkBukti}
                          onChange={(e) => updateDetail(index, "linkBukti", e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-text-secondary hover:text-navy hover:bg-muted"
                          onClick={() => removeDetail(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function FinancePage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterApprovalStatus, setFilterApprovalStatus] = useState("ALL");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterOrganizer, setFilterOrganizer] = useState("ALL");
  
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Budget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Budget | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((json) => setBudgets(json.budgets ?? []))
      .catch(() => setBudgets([]))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-normal whitespace-nowrap">Lunas</Badge>;
      case "Belum Dibayar":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-normal whitespace-nowrap">Belum Dibayar</Badge>;
      case "Jatuh Tempo":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-normal whitespace-nowrap">Jatuh Tempo</Badge>;
      case "Disetujui":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-normal whitespace-nowrap">Disetujui</Badge>;
      case "Menunggu Persetujuan":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-normal whitespace-nowrap">Menunggu</Badge>;
      default:
        return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>;
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      ...EMPTY_FORM,
      processDetails: makeDefaultProcessDetails(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Budget) => {
    setEditingItem(item);
    setFormData({
      trainingName: item.trainingName,
      budgetYear: item.budgetYear,
      budgetMonth: item.budgetMonth,
      trainingType: item.trainingType,
      plannedAmount: item.plannedAmount,
      actualAmount: item.actualAmount,
      invoiceNumber: item.invoiceNumber ?? "",
      invoiceDate: item.invoiceDate ?? "",
      organizer: item.organizer,
      dueDate: item.dueDate ?? "",
      status: item.status,
      approvalStatus: item.approvalStatus,
      processDetails: item.processes.length > 0
        ? item.processes.map((p) => ({
            id: p.id,
            tahap: p.tahap,
            status: p.status,
            tanggal: p.tanggal ?? "",
            keterangan: p.keterangan,
            linkBukti: p.linkBukti,
          }))
        : makeDefaultProcessDetails(),
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...formData,
        invoiceDate: formData.invoiceDate || null,
        dueDate: formData.dueDate || null,
      };
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(`Gagal menyimpan: ${json.error ?? "Terjadi kesalahan"}`);
        return;
      }
      setBudgets((prev) => [json.budget, ...prev]);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const body = {
        ...formData,
        invoiceDate: formData.invoiceDate || null,
        dueDate: formData.dueDate || null,
      };
      const res = await fetch(`/api/finance/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(`Gagal menyimpan: ${json.error ?? "Terjadi kesalahan"}`);
        return;
      }
      setBudgets((prev) => prev.map((b) => (b.id === editingItem.id ? json.budget : b)));
      setIsEditModalOpen(false);
      setEditingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await fetch(`/api/finance/${deletingItem.id}`, { method: "DELETE" });
      setBudgets((prev) => prev.filter((b) => b.id !== deletingItem.id));
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredBudgets = budgets.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = item.trainingName.toLowerCase().includes(q);

    const matchApprovalStatus = filterApprovalStatus === "ALL" || item.approvalStatus === filterApprovalStatus;
    const matchPaymentStatus = filterPaymentStatus === "ALL" || item.status === filterPaymentStatus;
    
    const matchYear = filterYear === "ALL" || item.budgetYear.toString() === filterYear;
    const matchMonth = filterMonth === "ALL" || item.budgetMonth.toString() === filterMonth;
    const matchType = filterType === "ALL" || item.trainingType === filterType;
    const matchOrganizer = filterOrganizer === "ALL" || item.organizer === filterOrganizer;

    return matchSearch && matchApprovalStatus && matchPaymentStatus && matchYear && matchMonth && matchType && matchOrganizer;
  });

  React.useEffect(() => { setCurrentPage(1); setExpandedRowId(null); }, [searchTerm, filterApprovalStatus, filterPaymentStatus, filterYear, filterMonth, filterType, filterOrganizer]);

  const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
  const paginatedBudgets = filteredBudgets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const uniqueOrganizers = Array.from(new Set(budgets.map((b) => b.organizer).filter(Boolean)));
  const uniqueYears = Array.from(new Set(budgets.map((b) => b.budgetYear))).sort((a, b) => b - a);

  const handleExport = () => {
    if (filteredBudgets.length === 0) {
      alert("Tidak ada data untuk dieksport");
      return;
    }

    const exportData = filteredBudgets.map((item, idx) => ({
      "No": idx + 1,
      "Tahun": item.budgetYear,
      "Bulan": monthNames[item.budgetMonth - 1],
      "Nama Training": item.trainingName,
      "Jenis": item.trainingType,
      "Penyelenggara": item.organizer || "-",
      "Rencana Anggaran": item.plannedAmount,
      "Realisasi Biaya": item.actualAmount,
      "Status Persetujuan": item.approvalStatus,
      "No. Invoice": item.invoiceNumber || "-",
      "Tgl. Invoice": item.invoiceDate || "-",
      "Tgl. Jatuh Tempo": item.dueDate || "-",
      "Status Pembayaran": item.status,
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Anggaran & Biaya");

    const processData = filteredBudgets.flatMap((item) => 
      item.processes.map((p) => ({
        "Nama Training": item.trainingName,
        "No Tahapan": p.stepNo,
        "Tahapan Proses": p.tahap,
        "Status": p.status,
        "Tanggal": p.tanggal || "-",
        "Keterangan": p.keterangan || "-",
        "Link Bukti": p.linkBukti || "-"
      }))
    );
    if (processData.length > 0) {
      const wsProcess = XLSX.utils.json_to_sheet(processData);
      XLSX.utils.book_append_sheet(wb, wsProcess, "Tahapan Proses");
    }

    XLSX.writeFile(wb, "Data_Anggaran_dan_Biaya.xlsx");
  };

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Anggaran &amp; Biaya</h2>
          <p className="text-text-secondary mt-1">Kelola perencanaan anggaran training dan pantau tagihan pembayaran secara terpadu.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-sky/30 text-sky hover:bg-sky/5 bg-white" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Tambah Data
          </Button>
        </div>
      </div>

      {/* Unified Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-2">Total Prognosa Anggaran</p>
            <h3 className="text-2xl font-bold text-navy truncate">{formatCurrency(filteredBudgets.reduce((s, i) => s + i.plannedAmount, 0))}</h3>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-2">Total Realisasi</p>
            <h3 className="text-2xl font-bold text-green-600 truncate">{formatCurrency(filteredBudgets.reduce((s, i) => s + i.actualAmount, 0))}</h3>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Lunas</p>
            <h3 className="text-2xl font-bold text-blue-600">{filteredBudgets.filter((i) => i.status === "Lunas").length} Tagihan</h3>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Jatuh Tempo</p>
            <h3 className="text-2xl font-bold text-danger">{filteredBudgets.filter((i) => i.status === "Jatuh Tempo").length} Tagihan</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input placeholder="Cari nama training..." className="pl-9 bg-background/50 border-border/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 border-sky/30 text-sky bg-white hover:bg-sky/5 w-full sm:w-auto" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter className="h-4 w-4" /> Filter
              </Button>

              {isFilterOpen && (
                <Card className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Data</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Tahun</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                        <option value="ALL">Semua</option>
                        {uniqueYears.map((y) => <option key={y} value={y.toString()}>{y}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Bulan</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                        <option value="ALL">Semua</option>
                        {monthNames.map((m, i) => <option key={i} value={(i + 1).toString()}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Jenis Anggaran</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="ALL">Semua Jenis</option>
                        <option value="Mandatory">Mandatory</option>
                        <option value="Non-Mandatory">Non-Mandatory</option>
                        <option value="Magang">Magang</option>
                        <option value="Honor Pelatih">Honor Pelatih</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Penyelenggara</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterOrganizer} onChange={(e) => setFilterOrganizer(e.target.value)}>
                        <option value="ALL">Semua Penyelenggara</option>
                        {uniqueOrganizers.map((org, i) => <option key={i} value={org}>{org}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Status Persetujuan</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterApprovalStatus} onChange={(e) => setFilterApprovalStatus(e.target.value)}>
                        <option value="ALL">Semua</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">Status Pembayaran</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}>
                        <option value="ALL">Semua</option>
                        <option value="Lunas">Lunas</option>
                        <option value="Belum Dibayar">Belum Dibayar</option>
                        <option value="Jatuh Tempo">Jatuh Tempo</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="flex-1 text-xs" onClick={() => { setFilterApprovalStatus("ALL"); setFilterPaymentStatus("ALL"); setFilterYear("ALL"); setFilterMonth("ALL"); setFilterType("ALL"); setFilterOrganizer("ALL"); setIsFilterOpen(false); }}>Clear</Button>
                    <Button className="flex-1 bg-sky hover:bg-sky/90 text-white text-xs" onClick={() => setIsFilterOpen(false)}>Terapkan</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="font-semibold text-text-secondary">Informasi Training</TableHead>
                  <TableHead className="font-semibold text-text-secondary">Periode</TableHead>
                  <TableHead className="font-semibold text-text-secondary">Biaya (Planned vs Actual)</TableHead>
                  <TableHead className="font-semibold text-text-secondary text-center">Status Persetujuan</TableHead>
                  <TableHead className="font-semibold text-text-secondary text-center">Status Pembayaran</TableHead>
                  <TableHead className="text-center font-semibold text-text-secondary">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-text-secondary">Memuat data...</TableCell></TableRow>
                ) : filteredBudgets.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-text-secondary">Tidak ada data ditemukan.</TableCell></TableRow>
                ) : (
                  paginatedBudgets.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow className={`hover:bg-muted/30 transition-colors cursor-pointer ${expandedRowId === item.id ? "bg-sky/5" : ""}`} onClick={() => toggleRow(item.id)}>
                        <TableCell className="text-center">
                          {expandedRowId === item.id ? <ChevronUp className="h-4 w-4 text-sky" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-navy">{item.trainingName}</div>
                          <div className="text-xs text-text-secondary mt-1">{item.trainingType}</div>
                        </TableCell>
                        <TableCell className="text-text-secondary whitespace-nowrap">
                          {monthNames[item.budgetMonth - 1]} {item.budgetYear}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-green-600" title="Realisasi Biaya">
                            {item.actualAmount > 0 ? formatCurrency(item.actualAmount) : "-"}
                          </div>
                          <div className="text-xs text-text-secondary mt-1" title="Rencana Anggaran">
                            Rencana: {formatCurrency(item.plannedAmount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(item.approvalStatus)}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                className="w-full flex items-center gap-2 text-navy cursor-pointer"
                                onClick={() => handleOpenEdit(item)}
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                                onClick={() => { setDeletingItem(item); setIsDeleteModalOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expandedRowId === item.id && (
                        <TableRow className="bg-sky/5 hover:bg-sky/5 border-b border-border/50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-4 bg-white/50 border-t border-border/50 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Side: Invoice Details */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-sm text-navy flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-text-secondary" /> Detail Invoice
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-border shadow-sm space-y-3">
                                    <div>
                                      <p className="text-xs text-text-secondary">Penyelenggara</p>
                                      <p className="text-sm font-medium text-navy">{item.organizer || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-text-secondary">No. Invoice</p>
                                      <p className="text-sm font-medium text-navy font-mono">{item.invoiceNumber || "-"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <p className="text-xs text-text-secondary">Tgl. Invoice</p>
                                        <p className="text-sm font-medium text-navy">{item.invoiceDate || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-text-secondary">Jatuh Tempo</p>
                                        <p className="text-sm font-medium text-navy flex items-center gap-1">
                                          <CalendarDays className="h-3 w-3 text-danger" /> {item.dueDate || "-"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side: Process Table */}
                                <div className="lg:col-span-2 space-y-4">
                                  <h4 className="font-semibold text-sm text-navy flex items-center gap-2">
                                    <ReceiptText className="h-4 w-4 text-text-secondary" /> Rincian Proses Pembayaran
                                  </h4>
                                  <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                                    <Table>
                                      <TableHeader className="bg-navy">
                                        <TableRow className="hover:bg-navy">
                                          <TableHead className="text-white w-12 text-center">No</TableHead>
                                          <TableHead className="text-white">Tahapan</TableHead>
                                          <TableHead className="text-white">Status</TableHead>
                                          <TableHead className="text-white">Tanggal</TableHead>
                                          <TableHead className="text-white">Keterangan</TableHead>
                                          <TableHead className="text-white text-right">Bukti</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {item.processes.length === 0 ? (
                                          <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-text-secondary text-sm">
                                              Belum ada data tahapan proses.
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          item.processes.map((detail) => (
                                            <TableRow key={detail.id} className="hover:bg-muted/30">
                                              <TableCell className="text-center font-medium text-text-secondary">
                                                {detail.stepNo}
                                              </TableCell>
                                              <TableCell className="font-medium text-navy">{detail.tahap}</TableCell>
                                              <TableCell>
                                                <Badge variant="outline" className={`font-normal border-none whitespace-nowrap ${
                                                  detail.status === "Selesai" ? "bg-green-100 text-green-700" :
                                                  detail.status === "Diproses" || detail.status === "Menunggu" ? "bg-sky/10 text-sky" :
                                                  "bg-muted text-text-secondary"
                                                }`}>
                                                  {detail.status}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="text-text-secondary whitespace-nowrap">{detail.tanggal ?? "-"}</TableCell>
                                              <TableCell className="text-text-secondary text-xs">{detail.keterangan || "-"}</TableCell>
                                              <TableCell className="text-right">
                                                {detail.linkBukti ? (
                                                  <a href={detail.linkBukti} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm" className="text-sky hover:text-sky/80 hover:bg-sky/10 text-xs h-7 px-2">
                                                      <Link className="h-3 w-3" />
                                                    </Button>
                                                  </a>
                                                ) : (
                                                  <span className="text-text-secondary text-xs">-</span>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        )}
                                      </TableBody>
                                    </Table>
                                    <div className="p-3 bg-muted/10 border-t border-border flex items-center">
                                      <Button variant="ghost" size="sm" className="text-sky hover:text-sky/80 hover:bg-sky/10 text-xs font-medium gap-1" onClick={() => handleOpenEdit(item)}>
                                        <Plus className="h-3 w-3" /> Update Data
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredBudgets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
              <p className="text-sm text-text-secondary">
                Menampilkan{" "}
                <span className="font-medium text-navy">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBudgets.length)}
                </span>{" "}
                dari <span className="font-medium text-navy">{filteredBudgets.length}</span>{" "}
                data
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

      {/* Modal Tambah & Edit */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className={`w-full max-w-4xl border-none shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10 rounded-t-xl">
              <h3 className="font-bold text-lg text-navy">{isModalOpen ? "Buat Data Anggaran & Biaya" : "Edit Data Anggaran & Biaya"}</h3>
              <Button variant="ghost" size="icon" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}><X className="h-4 w-4" /></Button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={isModalOpen ? handleSave : handleUpdate} className="space-y-4">
                <FormFields data={formData} setData={setFormData} />
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border sticky bottom-0 bg-white pb-2">
                  <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}>Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy/90 text-surface">
                    {saving ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className="w-full max-w-md border-none shadow-xl animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-navy">Konfirmasi Hapus</h3>
                <p className="text-text-secondary text-sm">
                  Apakah Anda yakin ingin menghapus data anggaran &amp; biaya untuk <strong>{deletingItem.trainingName}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                <Button variant="destructive" disabled={saving} onClick={confirmDelete}>
                  {saving ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
