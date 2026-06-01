"use client";

import React, { useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal, Edit, Trash2, X, Wallet, ReceiptText, AlertTriangle } from "lucide-react";
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

// Mock Data
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const mockBudgets = [
  {
    id: "BGT-001",
    trainingName: "Aviation Safety Leadership",
    budgetYear: 2026,
    budgetMonth: 5,
    trainingType: "Mandatori",
    plannedAmount: 15000000,
    actualAmount: 15000000,
    invoiceDate: "2026-05-02",
    organizer: "GMF AeroAsia",
    dueDate: "2026-05-15",
    status: "Lunas",
    approvalStatus: "Disetujui",
  },
  {
    id: "BGT-002",
    trainingName: "Customer Service Excellence",
    budgetYear: 2026,
    budgetMonth: 6,
    trainingType: "Non-Mandatori",
    plannedAmount: 5000000,
    actualAmount: 0,
    invoiceDate: "-",
    organizer: "Internal Trainer",
    dueDate: "2026-06-01",
    status: "Belum Dibayar",
    approvalStatus: "Menunggu Persetujuan",
  },
  {
    id: "BGT-003",
    trainingName: "Basic Fire Fighting & Safety",
    budgetYear: 2026,
    budgetMonth: 4,
    trainingType: "Mandatori",
    plannedAmount: 7500000,
    actualAmount: 7500000,
    invoiceDate: "2026-04-05",
    organizer: "Angkasa Pura II",
    dueDate: "2026-04-20",
    status: "Lunas",
    approvalStatus: "Disetujui",
  },
  {
    id: "BGT-004",
    trainingName: "Ground Handling Operations",
    budgetYear: 2026,
    budgetMonth: 5,
    trainingType: "Mandatori",
    plannedAmount: 25000000,
    actualAmount: 10000000,
    invoiceDate: "2026-05-10",
    organizer: "JAS Airport Services",
    dueDate: "2026-05-25",
    status: "Jatuh Tempo",
    approvalStatus: "Disetujui",
  },
];

export default function FinancePage() {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterOrganizer, setFilterOrganizer] = useState("ALL");
  const [activeTab, setActiveTab] = useState("ANGGARAN");
  
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-normal">Lunas</Badge>;
      case "Belum Dibayar":
        return <Badge variant="warning" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-normal">Belum Dibayar</Badge>;
      case "Jatuh Tempo":
        return <Badge variant="danger" className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-normal">Jatuh Tempo</Badge>;
      case "Disetujui":
        return <Badge variant="success" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-normal">Disetujui</Badge>;
      case "Menunggu Persetujuan":
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-normal">Menunggu Persetujuan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBudgets = budgets.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = item.trainingName.toLowerCase().includes(searchLower);
    
    // Filter matching logic depends on active tab
    let matchStatus = true;
    if (filterStatus !== "ALL") {
      if (activeTab === "ANGGARAN") {
        matchStatus = item.approvalStatus === filterStatus;
      } else {
        matchStatus = item.status === filterStatus;
      }
    }
    
    const matchYear = filterYear === "ALL" || 
      (activeTab === "ANGGARAN" 
        ? item.budgetYear.toString() === filterYear 
        : item.invoiceDate ? item.invoiceDate.substring(0, 4) === filterYear : false);
        
    const matchMonth = filterMonth === "ALL" || 
      (activeTab === "ANGGARAN" 
        ? item.budgetMonth.toString() === filterMonth 
        : item.invoiceDate ? parseInt(item.invoiceDate.split("-")[1] || "0").toString() === filterMonth : false);
        
    const matchType = activeTab === "BIAYA" || filterType === "ALL" || item.trainingType === filterType;
    const matchOrganizer = activeTab === "ANGGARAN" || filterOrganizer === "ALL" || item.organizer === filterOrganizer;

    return matchSearch && matchStatus && matchYear && matchMonth && matchType && matchOrganizer;
  });

  const uniqueOrganizers = Array.from(new Set(budgets.map(b => b.organizer).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Anggaran & Biaya
          </h2>
          <p className="text-text-secondary mt-1">
            Kelola perencanaan anggaran training dan pantau tagihan pembayaran.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-sky/30 text-sky hover:bg-sky/5 bg-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="bg-navy hover:bg-navy/90 text-surface gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {activeTab === "ANGGARAN" ? "Buat Anggaran" : "Buat Tagihan"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setFilterStatus("ALL"); }} className="w-full">
        <TabsList className="bg-muted mb-4">
          <TabsTrigger value="ANGGARAN" className="gap-2">
            <Wallet className="h-4 w-4" />
            Perencanaan Anggaran
          </TabsTrigger>
          <TabsTrigger value="BIAYA" className="gap-2">
            <ReceiptText className="h-4 w-4" />
            Tagihan & Realisasi
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      {activeTab === "ANGGARAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Total Anggaran (Planned)</p>
              <h3 className="text-3xl font-bold text-navy">
                {formatCurrency(filteredBudgets.reduce((sum, item) => sum + item.plannedAmount, 0))}
              </h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Anggaran Disetujui</p>
              <h3 className="text-3xl font-bold text-blue-600">
                {filteredBudgets.filter(item => item.approvalStatus === "Disetujui").length} Training
              </h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Menunggu Persetujuan</p>
              <h3 className="text-3xl font-bold text-yellow-600">
                {filteredBudgets.filter(item => item.approvalStatus === "Menunggu Persetujuan").length} Training
              </h3>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Total Realisasi (Actual)</p>
              <h3 className="text-3xl font-bold text-green-600">
                {formatCurrency(filteredBudgets.reduce((sum, item) => sum + item.actualAmount, 0))}
              </h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Lunas</p>
              <h3 className="text-3xl font-bold text-green-600">
                {filteredBudgets.filter(item => item.status === "Lunas").length} Tagihan
              </h3>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-secondary mb-2">Tagihan Jatuh Tempo (Overdue)</p>
              <h3 className="text-3xl font-bold text-danger">
                {filteredBudgets.filter(item => item.status === "Jatuh Tempo").length} Tagihan
              </h3>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Cari nama training..."
                className="pl-9 bg-background/50 border-border/50 focus-visible:ring-sky/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="gap-2 border-sky/30 text-sky bg-white hover:bg-sky/5 w-full sm:w-auto"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              {isFilterOpen && (
                <Card className="absolute right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Data
                    </h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">
                        {activeTab === "ANGGARAN" ? "Tahun Anggaran" : "Tahun Invoice"}
                      </label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                      >
                        <option value="ALL">Semua Tahun</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">
                        {activeTab === "ANGGARAN" ? "Bulan" : "Bulan Invoice"}
                      </label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                      >
                        <option value="ALL">Semua Bulan</option>
                        {monthNames.map((month, index) => (
                          <option key={index} value={(index + 1).toString()}>{month}</option>
                        ))}
                      </select>
                    </div>

                    {activeTab === "ANGGARAN" ? (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-secondary">Jenis Anggaran</label>
                        <select 
                          className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
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
                        <select 
                          className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                          value={filterOrganizer}
                          onChange={(e) => setFilterOrganizer(e.target.value)}
                        >
                          <option value="ALL">Semua Penyelenggara</option>
                          {uniqueOrganizers.map((org, idx) => (
                            <option key={idx} value={org}>{org}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary">
                        {activeTab === "ANGGARAN" ? "Status Persetujuan" : "Status Pembayaran"}
                      </label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
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
                    <Button 
                      variant="outline" 
                      className="flex-1 text-xs" 
                      onClick={() => {
                        setFilterStatus("ALL");
                        setFilterYear("ALL");
                        setFilterMonth("ALL");
                        setFilterType("ALL");
                        setFilterOrganizer("ALL");
                        setIsFilterOpen(false);
                      }}
                    >
                      Clear
                    </Button>
                    <Button className="flex-1 bg-sky hover:bg-sky/90 text-white text-xs" onClick={() => setIsFilterOpen(false)}>
                      Terapkan
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
                {filteredBudgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-text-secondary">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBudgets.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-navy">{item.trainingName}</TableCell>
                      
                      {activeTab === "ANGGARAN" ? (
                        <>
                          <TableCell className="text-center text-text-secondary">{item.budgetYear}</TableCell>
                          <TableCell className="text-center text-text-secondary">{monthNames[item.budgetMonth - 1]}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className="bg-background font-normal">{item.trainingType}</Badge></TableCell>
                          <TableCell className="text-text-secondary text-center font-medium">{formatCurrency(item.plannedAmount)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.approvalStatus)}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-text-secondary">{item.organizer}</TableCell>
                          <TableCell className="text-center text-text-secondary">{item.invoiceDate}</TableCell>
                          <TableCell className={`text-center font-medium ${item.actualAmount === 0 ? 'text-text-secondary' : 'text-green-600'}`}>
                            {item.actualAmount === 0 ? "Rp 0" : formatCurrency(item.actualAmount)}
                          </TableCell>
                          <TableCell className="text-center text-text-secondary">{item.dueDate}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                        </>
                      )}
                      
                      <TableCell className="text-center">
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
                                    setEditingItem(item);
                                    setIsEditModalOpen(true);
                                    setOpenActionId(null);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                                  onClick={() => {
                                    setDeletingItem(item);
                                    setIsDeleteModalOpen(true);
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

      {/* Modal Buat Anggaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <Card className="w-full max-w-lg border-none shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold text-lg text-navy">
                {activeTab === "ANGGARAN" ? "Buat Perencanaan Anggaran" : "Buat Tagihan (Invoice)"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              {activeTab === "ANGGARAN" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Nama Training</label>
                    <Input defaultValue="Basic Fire Fighting & Safety" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tahun Anggaran</label>
                      <select defaultValue="2026" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Bulan</label>
                      <select defaultValue="5" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Jenis Anggaran</label>
                      <select defaultValue="Mandatori" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="Mandatori">Mandatori</option>
                        <option value="Non-Mandatori">Non-Mandatori</option>
                        <option value="Magang">Magang</option>
                        <option value="Honor Pelatih">Honor Pelatih</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Rencana Anggaran (Rp)</label>
                      <Input type="number" defaultValue="15000000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Status Persetujuan</label>
                    <select defaultValue="Menunggu Persetujuan" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                      <option value="Disetujui">Disetujui</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Pilih Anggaran / Training</label>
                    <select defaultValue="BGT-001" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="BGT-001">Aviation Safety Leadership</option>
                      <option value="BGT-002">Customer Service Excellence</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Nama Penyelenggara</label>
                      <Input defaultValue="GMF AeroAsia" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tgl. Invoice</label>
                      <Input type="date" defaultValue="2026-05-02" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Realisasi Biaya (Rp)</label>
                      <Input type="number" defaultValue="15000000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tgl. Jatuh Tempo</label>
                      <Input type="date" defaultValue="2026-05-15" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Status Pembayaran</label>
                    <select defaultValue="Belum Dibayar" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Dibayar">Belum Dibayar</option>
                      <option value="Jatuh Tempo">Jatuh Tempo</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button className="bg-navy hover:bg-navy/90 text-surface" onClick={() => setIsModalOpen(false)}>
                  {activeTab === "ANGGARAN" ? "Simpan Anggaran" : "Simpan Tagihan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Edit */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
          <Card className="w-full max-w-lg border-none shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-bold text-lg text-navy">
                {activeTab === "ANGGARAN" ? "Edit Perencanaan Anggaran" : "Edit Tagihan (Invoice)"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-6 space-y-4">
              {activeTab === "ANGGARAN" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Nama Training</label>
                    <Input defaultValue={editingItem.trainingName} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tahun Anggaran</label>
                      <select defaultValue={editingItem.budgetYear.toString()} className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Bulan</label>
                      <select defaultValue={editingItem.budgetMonth.toString()} className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Jenis Anggaran</label>
                      <select defaultValue={editingItem.trainingType} className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                        <option value="Mandatori">Mandatori</option>
                        <option value="Non-Mandatori">Non-Mandatori</option>
                        <option value="Magang">Magang</option>
                        <option value="Honor Pelatih">Honor Pelatih</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Rencana Anggaran (Rp)</label>
                      <Input type="number" defaultValue={editingItem.plannedAmount} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Status Persetujuan</label>
                    <select defaultValue={editingItem.approvalStatus} className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                      <option value="Disetujui">Disetujui</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Pilih Anggaran / Training</label>
                    <select defaultValue="BGT-001" className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="BGT-001">{editingItem.trainingName}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Nama Penyelenggara</label>
                      <Input defaultValue={editingItem.organizer} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tgl. Invoice</label>
                      <Input type="date" defaultValue={editingItem.invoiceDate} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Realisasi Biaya (Rp)</label>
                      <Input type="number" defaultValue={editingItem.actualAmount} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Tgl. Jatuh Tempo</label>
                      <Input type="date" defaultValue={editingItem.dueDate} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Status Pembayaran</label>
                    <select defaultValue={editingItem.status} className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky">
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Dibayar">Belum Dibayar</option>
                      <option value="Jatuh Tempo">Jatuh Tempo</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                <Button className="bg-navy hover:bg-navy/90 text-surface" onClick={() => setIsEditModalOpen(false)}>
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
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
                <Button variant="destructive" onClick={() => setIsDeleteModalOpen(false)}>Ya, Hapus</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
