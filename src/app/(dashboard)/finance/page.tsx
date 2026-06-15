"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, X, Wallet, ReceiptText, AlertTriangle, ChevronDown, ChevronUp, CornerDownRight, Link, FileText, CalendarDays, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface AnnualBudget {
  id: string;
  year: number;
  approvedDate: string;
  amount: number;
  link: string;
  notes: string;
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
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
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
  const [activeTab, setActiveTab] = useState("TRANSAKSI");
  
  // Data State for Tab 1 (Transaksi)
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data State for Tab 2 (Anggaran Induk - API)
  const [annualBudgets, setAnnualBudgets] = useState<AnnualBudget[]>([]);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
  const [editingAnnualId, setEditingAnnualId] = useState<string | null>(null);
  const [annualFormData, setAnnualFormData] = useState({ year: new Date().getFullYear(), approvedDate: '', amount: 0, link: '', notes: '' });

  const [isAnnualDeleteModalOpen, setIsAnnualDeleteModalOpen] = useState(false);
  const [deletingAnnualItem, setDeletingAnnualItem] = useState<AnnualBudget | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterApprovalStatus, setFilterApprovalStatus] = useState("ALL");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("ALL");
  const currentYearState = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYearState.toString());
  const [filterMonth, setFilterMonth] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterOrganizer, setFilterOrganizer] = useState("ALL");
  
  // Table UI State
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals
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
      
    fetch("/api/finance/annual")
      .then((r) => r.json())
      .then((json) => setAnnualBudgets(json.annualBudgets ?? []))
      .catch(() => setAnnualBudgets([]));
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

  const handleSaveAnnualBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnnualId) {
        const res = await fetch(`/api/finance/annual/${editingAnnualId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(annualFormData),
        });
        const json = await res.json();
        if (!res.ok) {
          alert(`Gagal menyimpan: ${json.error}`);
          return;
        }
        setAnnualBudgets(prev => prev.map(b => b.id === editingAnnualId ? json.budget : b));
      } else {
        const res = await fetch("/api/finance/annual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(annualFormData),
        });
        const json = await res.json();
        if (!res.ok) {
          alert(`Gagal menyimpan: ${json.error}`);
          return;
        }
        setAnnualBudgets(prev => [json.budget, ...prev]);
      }
      setIsAnnualModalOpen(false);
      setEditingAnnualId(null);
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditAnnual = (item: AnnualBudget) => {
    setAnnualFormData({
      year: item.year,
      approvedDate: item.approvedDate,
      amount: item.amount,
      link: item.link,
      notes: item.notes
    });
    setEditingAnnualId(item.id);
    setIsAnnualModalOpen(true);
  };

  const confirmDeleteAnnual = async () => {
    if (!deletingAnnualItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/finance/annual/${deletingAnnualItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        alert(`Gagal menghapus: ${json.error}`);
        return;
      }
      setAnnualBudgets(prev => prev.filter(b => b.id !== deletingAnnualItem.id));
      setIsAnnualDeleteModalOpen(false);
      setDeletingAnnualItem(null);
    } catch (err) {
      alert("Terjadi kesalahan sistem");
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
  const currentYear = new Date().getFullYear();
  const dbYears = budgets.map((b) => b.budgetYear);
  const windowYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const uniqueYears = Array.from(new Set([...dbYears, ...windowYears])).sort((a, b) => b - a);
  const targetYear = filterYear !== "ALL" ? parseInt(filterYear) : currentYear;
  const activeAnnualBudget = annualBudgets.find(b => b.year === targetYear);
  const displayYear = targetYear;
  const displayBudgetAmount = activeAnnualBudget ? activeAnnualBudget.amount : 0;

  const totalRealizationForYear = budgets
    .filter(b => b.budgetYear === displayYear)
    .reduce((sum, item) => sum + item.actualAmount, 0);
  
  const totalPlannedForYear = budgets
    .filter(b => b.budgetYear === displayYear)
    .reduce((sum, item) => sum + item.plannedAmount, 0);
  
  const annualProgressPercent = displayBudgetAmount > 0
    ? Math.min(100, (totalRealizationForYear / displayBudgetAmount) * 100)
    : 0;

  const plannedProgressPercent = displayBudgetAmount > 0
    ? Math.min(100, (totalPlannedForYear / displayBudgetAmount) * 100)
    : 0;

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
          <p className="text-text-secondary mt-1">Kelola anggaran tahunan, perencanaan biaya training, dan realisasi pembayaran.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted mb-4 border-b border-border/50 rounded-none w-full justify-start h-auto p-0">
          <TabsTrigger value="TRANSAKSI" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky data-[state=active]:shadow-none rounded-none py-3 px-6 gap-2">
            <ReceiptText className="h-4 w-4" /> Transaksi Anggaran &amp; Biaya
          </TabsTrigger>
          <TabsTrigger value="INDUK" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky data-[state=active]:shadow-none rounded-none py-3 px-6 gap-2">
            <Building2 className="h-4 w-4" /> Anggaran Induk Perusahaan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="TRANSAKSI" className="space-y-6 mt-0">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" className="gap-2 border-sky/30 text-sky hover:bg-sky/5 bg-white" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          </div>

          {/* Progress Bar Anggaran Induk (Mock) */}
          {true && (
            <Card className="border-border/50 shadow-sm bg-gradient-to-r from-navy to-sky/90 text-white overflow-hidden relative">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Wallet className="w-48 h-48 -mr-8 -mt-8" />
              </div>
              <CardContent className="p-6 relative z-10 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Penggunaan Anggaran Induk ({displayYear})</h3>
                    <p className="text-sky-100 text-sm">Total Anggaran Perusahaan: <strong>{formatCurrency(displayBudgetAmount)}</strong></p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Bar 1: Prognosa */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Prognosa (Rencana)</span>
                      <span className="font-bold">{formatCurrency(totalPlannedForYear)}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-1">
                      <div 
                        className={`h-3 rounded-full ${plannedProgressPercent > 100 ? 'bg-red-500' : plannedProgressPercent > 90 ? 'bg-red-400' : plannedProgressPercent > 75 ? 'bg-yellow-400' : 'bg-sky-300'}`} 
                        style={{ width: `${Math.min(100, plannedProgressPercent)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-sky-100 mt-1">
                      <span>Sisa Anggaran: {formatCurrency(displayBudgetAmount - totalPlannedForYear)}</span>
                      <span>{plannedProgressPercent.toFixed(1)}% dari Anggaran Induk</span>
                    </div>
                  </div>

                  {/* Bar 2: Realisasi */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Realisasi</span>
                      <span className="font-bold">{formatCurrency(totalRealizationForYear)}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-1">
                      <div 
                        className={`h-3 rounded-full ${annualProgressPercent > 90 ? 'bg-red-400' : annualProgressPercent > 75 ? 'bg-yellow-400' : 'bg-green-400'}`} 
                        style={{ width: `${annualProgressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-sky-100 mt-1">
                      <span>Sisa Anggaran: {formatCurrency(displayBudgetAmount - totalRealizationForYear)}</span>
                      <span>{annualProgressPercent.toFixed(1)}% Terpakai</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unified Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                <p className="text-sm font-medium text-text-secondary mb-2">Belum Dibayar</p>
                <h3 className="text-2xl font-bold text-orange-600">{filteredBudgets.filter((i) => i.status === "Belum Dibayar").length} Tagihan</h3>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm bg-white">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-text-secondary mb-2">Jatuh Tempo</p>
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
        </TabsContent>

        {/* TAB 2: ANGGARAN INDUK (MOCK) */}
        <TabsContent value="INDUK" className="space-y-6 mt-0">
          <div className="flex items-center justify-end">
            <Button className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={() => {
              setAnnualFormData({ year: new Date().getFullYear(), approvedDate: '', amount: 0, link: '', notes: '' });
              setEditingAnnualId(null);
              setIsAnnualModalOpen(true);
            }}>
              <Plus className="h-4 w-4" /> Set Anggaran Induk
            </Button>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-text-secondary text-center w-24">Tahun</TableHead>
                      <TableHead className="font-semibold text-text-secondary">Tanggal Disetujui</TableHead>
                      <TableHead className="font-semibold text-text-secondary">Total Anggaran (Rp)</TableHead>
                      <TableHead className="font-semibold text-text-secondary">Link Perhitungan</TableHead>
                      <TableHead className="font-semibold text-text-secondary">Keterangan</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {annualBudgets.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center text-text-secondary">Belum ada data anggaran induk yang diset.</TableCell></TableRow>
                    ) : (
                      annualBudgets.sort((a,b) => b.year - a.year).map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="text-center font-bold text-navy">{item.year}</TableCell>
                          <TableCell className="text-text-secondary">{item.approvedDate || "-"}</TableCell>
                          <TableCell className="font-semibold text-green-600">{formatCurrency(item.amount)}</TableCell>
                          <TableCell>
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline flex items-center gap-1 text-sm">
                                <Link className="h-3 w-3" /> Buka Dokumen
                              </a>
                            ) : (
                              <span className="text-text-secondary text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-text-secondary">{item.notes || "-"}</TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem 
                                  className="w-full flex items-center gap-2 text-navy cursor-pointer"
                                  onClick={() => handleOpenEditAnnual(item)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                                  onClick={() => { setDeletingAnnualItem(item); setIsAnnualDeleteModalOpen(true); }}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Tambah & Edit Transaksi */}
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

      {/* Modal Hapus Transaksi */}
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

      {/* Modal Tambah Anggaran Induk (Mock) */}
      {isAnnualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className={`w-full max-w-md border-none shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10 rounded-t-xl">
              <h3 className="font-bold text-lg text-navy">{editingAnnualId ? "Edit Anggaran Induk" : "Set Anggaran Induk"}</h3>
              <Button variant="ghost" size="icon" onClick={() => { setIsAnnualModalOpen(false); setEditingAnnualId(null); }}><X className="h-4 w-4" /></Button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSaveAnnualBudget} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Tahun Anggaran</label>
                  <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" 
                    value={annualFormData.year} 
                    onChange={(e) => setAnnualFormData({...annualFormData, year: parseInt(e.target.value)})}>
                    {[2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Tanggal Disetujui</label>
                  <Input type="date" required value={annualFormData.approvedDate} onChange={(e) => setAnnualFormData({...annualFormData, approvedDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Total Anggaran (Rp)</label>
                  <Input type="number" required min={0} value={annualFormData.amount || ''} onChange={(e) => setAnnualFormData({...annualFormData, amount: parseInt(e.target.value) || 0})} placeholder="Misal: 4000000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Link Perhitungan Anggaran</label>
                  <Input type="url" placeholder="https://..." value={annualFormData.link} onChange={(e) => setAnnualFormData({...annualFormData, link: e.target.value})} />
                  <p className="text-xs text-text-secondary">Tautan ke dokumen spreadsheet atau PDF pendukung.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Keterangan Tambahan</label>
                  <textarea 
                    className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky min-h-[80px]" 
                    placeholder="Catatan..."
                    value={annualFormData.notes}
                    onChange={(e) => setAnnualFormData({...annualFormData, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border sticky bottom-0 bg-white pb-2">
                  <Button type="button" variant="outline" onClick={() => { setIsAnnualModalOpen(false); setEditingAnnualId(null); }}>Batal</Button>
                  <Button type="submit" className="bg-navy hover:bg-navy/90 text-surface">
                    Simpan Anggaran
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Hapus Anggaran Induk */}
      {isAnnualDeleteModalOpen && deletingAnnualItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className="w-full max-w-md border-none shadow-xl animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-navy">Konfirmasi Hapus</h3>
                <p className="text-text-secondary text-sm">
                  Apakah Anda yakin ingin menghapus data anggaran induk tahun <strong>{deletingAnnualItem.year}</strong>?
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAnnualDeleteModalOpen(false)}>Batal</Button>
                <Button variant="destructive" onClick={confirmDeleteAnnual}>Ya, Hapus</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
