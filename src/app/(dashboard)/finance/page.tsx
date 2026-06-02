"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, X, Wallet, ReceiptText, AlertTriangle, ChevronDown, ChevronUp, CornerDownRight, Link } from "lucide-react";
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

interface Budget {
  id: string;
  trainingName: string;
  budgetYear: number;
  budgetMonth: number;
  trainingType: string;
  plannedAmount: number;
  actualAmount: number;
  invoiceDate: string | null;
  organizer: string;
  dueDate: string | null;
  status: string;
  approvalStatus: string;
}

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const EMPTY_FORM = {
  trainingName: "", budgetYear: new Date().getFullYear(), budgetMonth: new Date().getMonth() + 1,
  trainingType: "Mandatori", plannedAmount: 0, actualAmount: 0,
  invoiceDate: "", organizer: "", dueDate: "", status: "Belum Dibayar", approvalStatus: "Menunggu Persetujuan",
  processDetails: [] as { id: string; tahap: string; status: string; tanggal: string; keterangan: string; linkBukti: string }[],
};

const getProcessDetails = (status: string) => {
  const base = [
    { no: 1, tahap: "Invoice Sent", status: "Selesai", tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
    { no: 2, tahap: "Input Invoice", status: "Selesai", tanggal: "2026-05-02", keterangan: "Diinput ke sistem keuangan" },
    { no: 3, tahap: "Verifikasi Finance 1", status: "Selesai", tanggal: "2026-05-03", keterangan: "Terverifikasi oleh staf" },
    { no: 4, tahap: "Verifikasi Finance 2", status: "Menunggu", tanggal: "-", keterangan: "-" },
    { no: 5, tahap: "Payment Status", status: "Belum", tanggal: "-", keterangan: "-" },
  ];
  if (status === "Lunas") {
    return [
      { no: 1, tahap: "Invoice Sent", status: "Selesai", tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
      { no: 2, tahap: "Input Invoice", status: "Selesai", tanggal: "2026-05-02", keterangan: "Diinput ke sistem keuangan" },
      { no: 3, tahap: "Verifikasi Finance 1", status: "Selesai", tanggal: "2026-05-03", keterangan: "Terverifikasi oleh staf" },
      { no: 4, tahap: "Verifikasi Finance 2", status: "Selesai", tanggal: "2026-05-04", keterangan: "Terverifikasi oleh manajer" },
      { no: 5, tahap: "Payment Status", status: "Selesai", tanggal: "2026-05-05", keterangan: "Pembayaran diterima" },
    ];
  } else if (status === "Belum Dibayar") {
    return base;
  } else {
    return [
      { no: 1, tahap: "Invoice Sent", status: "Selesai", tanggal: "2026-05-01", keterangan: "Dikirim via email ke klien" },
      { no: 2, tahap: "Input Invoice", status: "Diproses", tanggal: "-", keterangan: "Sedang diinput" },
      { no: 3, tahap: "Verifikasi Finance 1", status: "Belum", tanggal: "-", keterangan: "-" },
      { no: 4, tahap: "Verifikasi Finance 2", status: "Belum", tanggal: "-", keterangan: "-" },
      { no: 5, tahap: "Payment Status", status: "Belum", tanggal: "-", keterangan: "-" },
    ];
  }
};

export default function FinancePage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ANGGARAN");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterOrganizer, setFilterOrganizer] = useState("ALL");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-normal">Lunas</Badge>;
      case "Belum Dibayar":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-normal">Belum Dibayar</Badge>;
      case "Jatuh Tempo":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-normal">Jatuh Tempo</Badge>;
      case "Disetujui":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-normal">Disetujui</Badge>;
      case "Menunggu Persetujuan":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-normal">Menunggu Persetujuan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenAdd = () => {
    setFormData(EMPTY_FORM);
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
      invoiceDate: item.invoiceDate ?? "",
      organizer: item.organizer,
      dueDate: item.dueDate ?? "",
      status: item.status,
      approvalStatus: item.approvalStatus,
      processDetails: getProcessDetails(item.status).map((d) => ({
        id: Math.random().toString(36).substr(2, 9),
        tahap: d.tahap,
        status: d.status,
        tanggal: d.tanggal === "-" ? "" : d.tanggal,
        keterangan: d.keterangan === "-" ? "" : d.keterangan,
        linkBukti: "",
      })),
    });
    setIsEditModalOpen(true);
    setOpenActionId(null);
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

    let matchStatus = true;
    if (filterStatus !== "ALL") {
      matchStatus = activeTab === "ANGGARAN" ? item.approvalStatus === filterStatus : item.status === filterStatus;
    }

    const matchYear = filterYear === "ALL" || (
      activeTab === "ANGGARAN"
        ? item.budgetYear.toString() === filterYear
        : item.invoiceDate ? item.invoiceDate.substring(0, 4) === filterYear : false
    );

    const matchMonth = filterMonth === "ALL" || (
      activeTab === "ANGGARAN"
        ? item.budgetMonth.toString() === filterMonth
        : item.invoiceDate ? parseInt(item.invoiceDate.split("-")[1] || "0").toString() === filterMonth : false
    );

    const matchType = activeTab === "BIAYA" || filterType === "ALL" || item.trainingType === filterType;
    const matchOrganizer = activeTab === "ANGGARAN" || filterOrganizer === "ALL" || item.organizer === filterOrganizer;

    return matchSearch && matchStatus && matchYear && matchMonth && matchType && matchOrganizer;
  });

  const uniqueOrganizers = Array.from(new Set(budgets.map((b) => b.organizer).filter(Boolean)));
  const uniqueYears = Array.from(new Set(budgets.map((b) => b.budgetYear))).sort((a, b) => b - a);



  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const FormFields = ({ data, setData, activeTab }: { data: typeof EMPTY_FORM; setData: (d: typeof EMPTY_FORM) => void; activeTab?: string }) => {
    const handleAddDetail = () => {
      setData({
        ...data,
        processDetails: [
          ...data.processDetails,
          { id: Math.random().toString(36).substr(2, 9), tahap: "", status: "Selesai", tanggal: "", keterangan: "", linkBukti: "" }
        ]
      });
    };

    const removeDetail = (index: number) => {
      const newDetails = [...data.processDetails];
      newDetails.splice(index, 1);
      setData({ ...data, processDetails: newDetails });
    };

    const updateDetail = (index: number, field: string, value: string) => {
      const newDetails = [...data.processDetails];
      newDetails[index] = { ...newDetails[index], [field]: value };
      setData({ ...data, processDetails: newDetails });
    };

    return (
    <>
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
            <option value="Mandatori">Mandatori</option>
            <option value="Non-Mandatori">Non-Mandatori</option>
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
          <label className="text-sm font-medium text-text-primary">Tgl. Invoice</label>
          <Input type="date" value={data.invoiceDate} onChange={(e) => setData({ ...data, invoiceDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Tgl. Jatuh Tempo</label>
          <Input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} />
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Status Pembayaran</label>
          <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })}>
            <option value="Lunas">Lunas</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Jatuh Tempo">Jatuh Tempo</option>
          </select>
        </div>
      </div>

      {activeTab === "BIAYA" && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm text-navy">Rincian Proses Pembayaran</h4>
            <Button type="button" variant="outline" size="sm" className="text-sky border-sky/30 hover:bg-sky/5 text-xs h-8" onClick={handleAddDetail}>
              <Plus className="h-3 w-3 mr-1" /> Tambah Baris
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
                      className="h-9 w-9 text-text-secondary hover:text-danger hover:bg-danger/10"
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
      )}
    </>
  );
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Anggaran &amp; Biaya</h2>
          <p className="text-text-secondary mt-1">Kelola perencanaan anggaran training dan pantau tagihan pembayaran.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-sky/30 text-sky hover:bg-sky/5 bg-white">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            {activeTab === "ANGGARAN" ? "Buat Anggaran" : "Buat Tagihan"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setFilterStatus("ALL"); }} className="w-full">
        <TabsList className="bg-muted mb-4">
          <TabsTrigger value="ANGGARAN" className="gap-2">
            <Wallet className="h-4 w-4" /> Perencanaan Anggaran
          </TabsTrigger>
          <TabsTrigger value="BIAYA" className="gap-2">
            <ReceiptText className="h-4 w-4" /> Tagihan &amp; Realisasi
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      {activeTab === "ANGGARAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Total Anggaran (Planned)</p>
              <h3 className="text-3xl font-bold text-navy">{formatCurrency(filteredBudgets.reduce((s, i) => s + i.plannedAmount, 0))}</h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Anggaran Disetujui</p>
              <h3 className="text-3xl font-bold text-blue-600">{filteredBudgets.filter((i) => i.approvalStatus === "Disetujui").length} Training</h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Menunggu Persetujuan</p>
              <h3 className="text-3xl font-bold text-yellow-600">{filteredBudgets.filter((i) => i.approvalStatus === "Menunggu Persetujuan").length} Training</h3>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Total Realisasi (Actual)</p>
              <h3 className="text-3xl font-bold text-green-600">{formatCurrency(filteredBudgets.reduce((s, i) => s + i.actualAmount, 0))}</h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Lunas</p>
              <h3 className="text-3xl font-bold text-green-600">{filteredBudgets.filter((i) => i.status === "Lunas").length} Tagihan</h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Jatuh Tempo</p>
              <h3 className="text-3xl font-bold text-danger">{filteredBudgets.filter((i) => i.status === "Jatuh Tempo").length} Tagihan</h3>
            </CardContent>
          </Card>
        </div>
      )}

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
                <Card className="absolute right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Data</h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}><X className="h-3 w-3" /></Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">{activeTab === "ANGGARAN" ? "Tahun Anggaran" : "Tahun Invoice"}</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                        <option value="ALL">Semua Tahun</option>
                        {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">{activeTab === "ANGGARAN" ? "Bulan" : "Bulan Invoice"}</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                        <option value="ALL">Semua Bulan</option>
                        {monthNames.map((m, i) => <option key={i} value={(i + 1).toString()}>{m}</option>)}
                      </select>
                    </div>
                    {activeTab === "ANGGARAN" ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-secondary">Jenis Anggaran</label>
                        <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                          <option value="ALL">Semua Jenis</option>
                          <option value="Mandatori">Mandatori</option>
                          <option value="Non-Mandatori">Non-Mandatori</option>
                          <option value="Magang">Magang</option>
                          <option value="Honor Pelatih">Honor Pelatih</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-secondary">Penyelenggara</label>
                        <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterOrganizer} onChange={(e) => setFilterOrganizer(e.target.value)}>
                          <option value="ALL">Semua Penyelenggara</option>
                          {uniqueOrganizers.map((org, i) => <option key={i} value={org}>{org}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">{activeTab === "ANGGARAN" ? "Status Persetujuan" : "Status Pembayaran"}</label>
                      <select className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">Semua Status</option>
                        {activeTab === "ANGGARAN" ? (
                          <>
                            <option value="Disetujui">Disetujui</option>
                            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                          </>
                        ) : (
                          <>
                            <option value="Lunas">Lunas</option>
                            <option value="Belum Dibayar">Belum Dibayar</option>
                            <option value="Jatuh Tempo">Jatuh Tempo</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="flex-1 text-xs" onClick={() => { setFilterStatus("ALL"); setFilterYear("ALL"); setFilterMonth("ALL"); setFilterType("ALL"); setFilterOrganizer("ALL"); setIsFilterOpen(false); }}>Clear</Button>
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
                  {activeTab === "BIAYA" && <TableHead className="w-10"></TableHead>}
                  <TableHead className="font-semibold text-text-secondary">Nama Training</TableHead>
                  {activeTab === "ANGGARAN" ? (
                    <>
                      <TableHead className="font-semibold text-text-secondary text-center">Tahun</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Bulan</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Jenis</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Rencana Anggaran</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Status Persetujuan</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="font-semibold text-text-secondary">Penyelenggara</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Tgl. Invoice</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Realisasi Biaya</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Tgl. Jatuh Tempo</TableHead>
                      <TableHead className="font-semibold text-text-secondary text-center">Status Pembayaran</TableHead>
                    </>
                  )}
                  <TableHead className="text-center font-semibold text-text-secondary">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={activeTab === "BIAYA" ? 8 : 7} className="h-24 text-center text-text-secondary">Memuat data...</TableCell></TableRow>
                ) : filteredBudgets.length === 0 ? (
                  <TableRow><TableCell colSpan={activeTab === "BIAYA" ? 8 : 7} className="h-24 text-center text-text-secondary">Tidak ada data ditemukan.</TableCell></TableRow>
                ) : (
                  filteredBudgets.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow className={`hover:bg-muted/30 transition-colors ${activeTab === "BIAYA" ? "cursor-pointer" : ""} ${expandedRowId === item.id ? "bg-sky/5" : ""}`} onClick={() => activeTab === "BIAYA" && toggleRow(item.id)}>
                        {activeTab === "BIAYA" && (
                          <TableCell className="text-center">
                            {expandedRowId === item.id ? <ChevronUp className="h-4 w-4 text-sky" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
                          </TableCell>
                        )}
                        <TableCell className="font-medium text-navy">{item.trainingName}</TableCell>
                        {activeTab === "ANGGARAN" ? (
                          <>
                            <TableCell className="text-center text-text-secondary">{item.budgetYear}</TableCell>
                            <TableCell className="text-center text-text-secondary">{monthNames[item.budgetMonth - 1]}</TableCell>
                            <TableCell className="text-center"><Badge variant="outline" className="bg-background font-normal">{item.trainingType}</Badge></TableCell>
                            <TableCell className="text-center font-medium text-text-secondary">{formatCurrency(item.plannedAmount)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(item.approvalStatus)}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-text-secondary">{item.organizer || "-"}</TableCell>
                            <TableCell className="text-center text-text-secondary">{item.invoiceDate ?? "-"}</TableCell>
                            <TableCell className={`text-center font-medium ${item.actualAmount === 0 ? "text-text-secondary" : "text-green-600"}`}>
                              {item.actualAmount === 0 ? "Rp 0" : formatCurrency(item.actualAmount)}
                            </TableCell>
                            <TableCell className="text-center text-text-secondary">{item.dueDate ?? "-"}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                          </>
                        )}
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary" onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {openActionId === item.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                                <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                                  <button className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2" onClick={() => handleOpenEdit(item)}>
                                    <Edit className="h-4 w-4" /> Edit
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2" onClick={() => { setDeletingItem(item); setIsDeleteModalOpen(true); setOpenActionId(null); }}>
                                    <Trash2 className="h-4 w-4" /> Hapus
                                  </button>
                                </Card>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {activeTab === "BIAYA" && expandedRowId === item.id && (
                        <TableRow className="bg-sky/5 hover:bg-sky/5 border-b border-border/50">
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 m-4 bg-white/50 border border-border/50 rounded-xl shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                                <Table>
                                  <TableHeader className="bg-navy">
                                    <TableRow className="hover:bg-navy">
                                      <TableHead className="text-white w-20">No</TableHead>
                                      <TableHead className="text-white">Tahapan Proses</TableHead>
                                      <TableHead className="text-white">Status</TableHead>
                                      <TableHead className="text-white">Tanggal</TableHead>
                                      <TableHead className="text-white">Keterangan</TableHead>
                                      <TableHead className="text-white text-right">Aksi</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getProcessDetails(item.status).map((detail) => (
                                      <TableRow key={detail.no} className="hover:bg-muted/30">
                                        <TableCell className="font-medium text-text-secondary">
                                          <div className="flex items-center gap-2">
                                            <CornerDownRight className="h-4 w-4 text-text-secondary/40" />
                                            <span>{detail.no}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-navy">{detail.tahap}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className={`font-normal border-none ${
                                            detail.status === "Selesai" ? "bg-green-100 text-green-700" :
                                            detail.status === "Diproses" || detail.status === "Menunggu" ? "bg-sky/10 text-sky" :
                                            "bg-muted text-text-secondary"
                                          }`}>
                                            {detail.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-text-secondary">{detail.tanggal}</TableCell>
                                        <TableCell className="text-text-secondary">{detail.keterangan}</TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="sm" className="text-sky hover:text-sky/80 hover:bg-sky/10 text-xs h-7 gap-1">
                                            <Link className="h-3 w-3" /> Lihat Bukti
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                <div className="p-3 bg-muted/10 border-t border-border flex items-center">
                                  <Button variant="ghost" size="sm" className="text-sky hover:text-sky/80 hover:bg-sky/10 text-xs font-medium gap-1" onClick={() => handleOpenEdit(item)}>
                                    <Plus className="h-3 w-3" /> Update Status Proses
                                  </Button>
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
        </CardContent>
      </Card>

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className={`w-full ${activeTab === "BIAYA" ? "max-w-4xl" : "max-w-lg"} border-none shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold text-lg text-navy">{activeTab === "ANGGARAN" ? "Buat Perencanaan Anggaran" : "Buat Tagihan (Invoice)"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <FormFields data={formData} setData={setFormData} activeTab={activeTab} />
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy/90 text-surface">
                    {saving ? "Menyimpan..." : activeTab === "ANGGARAN" ? "Simpan Anggaran" : "Simpan Tagihan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Edit */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in p-4">
          <Card className={`w-full ${activeTab === "BIAYA" ? "max-w-4xl" : "max-w-lg"} border-none shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold text-lg text-navy">Edit {activeTab === "ANGGARAN" ? "Perencanaan Anggaran" : "Tagihan"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <FormFields data={formData} setData={setFormData} activeTab={activeTab} />
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={saving} className="bg-navy hover:bg-navy/90 text-surface">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
                  Apakah Anda yakin ingin menghapus {activeTab === "ANGGARAN" ? "perencanaan anggaran" : "tagihan"} untuk <strong>{deletingItem.trainingName}</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
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
