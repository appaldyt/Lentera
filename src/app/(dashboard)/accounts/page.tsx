"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, X, Pencil, Trash2, ShieldCheck, User, UserCog, Eye, EyeOff, Lock } from "lucide-react";
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
import { useUser, UserRole, ROLE_LABELS } from "@/context/user-context";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type AccountStatus = "AKTIF" | "NONAKTIF";

interface Account {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  lastLogin: string;
  createdAt: string;
}


const ROLE_BADGE: Record<UserRole, { className: string; icon: React.ReactNode; label: string }> = {
  SUPER_ADMIN: {
    className: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100",
    icon: <ShieldCheck className="h-3 w-3" />,
    label: "Super Admin",
  },
  ADMIN: {
    className: "bg-sky/15 text-sky border-sky/30 hover:bg-sky/20",
    icon: <UserCog className="h-3 w-3" />,
    label: "Admin",
  },
  USER: {
    className: "bg-navy/10 text-navy border-navy/20 hover:bg-navy/15",
    icon: <User className="h-3 w-3" />,
    label: "User",
  },
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "USER" as UserRole,
  status: "AKTIF" as AccountStatus,
};

export default function AccountsPage() {
  const { user: currentUser } = useUser();

  // Access guard — only SUPER_ADMIN can access this page
  if (currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-danger" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-navy">Akses Ditolak</h3>
          <p className="text-text-secondary mt-1 max-w-sm">
            Halaman ini hanya dapat diakses oleh <strong>Super Admin</strong>. Silakan hubungi Super Admin untuk informasi lebih lanjut.
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${ROLE_BADGE[currentUser.role].className}`}>
          {ROLE_BADGE[currentUser.role].icon}
          Login sebagai: {ROLE_LABELS[currentUser.role]}
        </span>
      </div>
    );
  }

  return <AccountsContent />;
}

function AccountsContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((json) => setAccounts(json.accounts ?? []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({ ...emptyForm });
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const handleEdit = (acc: Account) => {
    setFormData({
      name: acc.name,
      email: acc.email,
      password: "",
      confirmPassword: "",
      role: acc.role,
      status: acc.status,
    });
    setEditId(acc.id);
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!editId) {
      if (!formData.password) {
        setFormError("Password wajib diisi untuk akun baru.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Konfirmasi password tidak cocok.");
        return;
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/accounts/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            role: formData.role,
            status: formData.status,
          }),
        });
        const json = await res.json();
        if (!res.ok) { setFormError(json.error ?? "Gagal menyimpan perubahan."); return; }
        setAccounts((prev) => prev.map((acc) => (acc.id === editId ? json.account : acc)));
      } else {
        const res = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            status: formData.status,
          }),
        });
        const json = await res.json();
        if (!res.ok) { setFormError(json.error ?? "Gagal membuat akun."); return; }
        setAccounts((prev) => [json.account, ...prev]);
      }
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (acc: Account) => {
    setAccountToDelete(acc);
    setIsDeleteModalOpen(true);
    setOpenActionId(null);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    setSaving(true);
    try {
      await fetch(`/api/accounts/${accountToDelete.id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountToDelete.id));
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || acc.role === filterRole;
    const matchesStatus = filterStatus === "ALL" || acc.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole, filterStatus]);

  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalSuperAdmin = accounts.filter((a) => a.role === "SUPER_ADMIN").length;
  const totalAdmin = accounts.filter((a) => a.role === "ADMIN").length;
  const totalUser = accounts.filter((a) => a.role === "USER").length;
  const totalAktif = accounts.filter((a) => a.status === "AKTIF").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">Manajemen Akun</h2>
          <p className="text-text-secondary">Kelola akun pengguna dan hak akses sistem LENTERA.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border shadow-sm">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Total Akun</p>
          <p className="text-2xl font-bold text-navy">{accounts.length}</p>
        </Card>
        <Card className="p-4 border-border shadow-sm">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Super Admin</p>
          <p className="text-2xl font-bold text-amber-600">{totalSuperAdmin}</p>
        </Card>
        <Card className="p-4 border-border shadow-sm">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Admin</p>
          <p className="text-2xl font-bold text-sky">{totalAdmin}</p>
        </Card>
        <Card className="p-4 border-border shadow-sm">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">User</p>
          <p className="text-2xl font-bold text-navy">{totalUser}</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Cari nama atau email..."
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
            Filter
          </Button>

          {isFilterOpen && (
            <Card className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-72 z-50 p-4 shadow-xl border-border animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-navy text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Akun
                </h4>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Role</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="ALL">Semua Role</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary">Status</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setFilterRole("ALL"); setFilterStatus("ALL"); }}
                >
                  Reset
                </Button>
                <Button className="flex-1 bg-sky hover:bg-sky/90 text-white" onClick={() => setIsFilterOpen(false)}>
                  Terapkan
                </Button>
              </div>
            </Card>
          )}
        </div>
        <p className="text-sm text-text-secondary sm:ml-auto">
          <strong>{filteredAccounts.length}</strong> dari {accounts.length} akun
          {" · "}
          <span className="text-success font-medium">{totalAktif} aktif</span>
        </p>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Login Terakhir</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-text-secondary">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : filteredAccounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-text-secondary">
                Tidak ada akun yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            paginatedAccounts.map((acc) => {
              const badge = ROLE_BADGE[acc.role];
              return (
                <TableRow key={acc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        acc.role === "SUPER_ADMIN" ? "bg-amber-100 text-amber-700" :
                        acc.role === "ADMIN" ? "bg-sky/15 text-sky" : "bg-navy/10 text-navy"
                      }`}>
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-text-primary">{acc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">{acc.email}</TableCell>
                  <TableCell>
                    <Badge className={`${badge.className} gap-1`}>
                      {badge.icon}
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        acc.status === "AKTIF"
                          ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                          : "bg-border text-text-secondary border-border hover:bg-border/80"
                      }
                    >
                      {acc.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary text-sm">{acc.lastLogin}</TableCell>
                  <TableCell className="text-text-secondary text-sm">{acc.createdAt}</TableCell>
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
                          onClick={() => handleEdit(acc)}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                          onClick={() => promptDelete(acc)}
                        >
                          <Trash2 className="h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-sm text-text-secondary">
            Menampilkan{" "}
            <span className="font-medium text-navy">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAccounts.length)}
            </span>{" "}
            dari <span className="font-medium text-navy">{filteredAccounts.length}</span> akun
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

      {/* Modal Tambah / Edit Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-sky" />
                </div>
                <h3 className="text-xl font-bold text-navy">
                  {editId ? "Edit Akun" : "Tambah Akun Baru"}
                </h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nama Lengkap</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ias.id"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Password {editId && <span className="text-xs text-text-secondary font-normal">(kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editId ? "Password baru (opsional)" : "Masukkan password"}
                    className="pr-10"
                  />
                  <button type="button" className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Konfirmasi Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="pr-10"
                  />
                  <button type="button" className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Role</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Status</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Role description */}
              <div className={`rounded-lg p-3 text-sm border ${
                formData.role === "SUPER_ADMIN" ? "bg-amber-50 border-amber-200 text-amber-800" :
                formData.role === "ADMIN" ? "bg-sky/5 border-sky/20 text-sky" :
                "bg-navy/5 border-navy/10 text-navy"
              }`}>
                {formData.role === "SUPER_ADMIN" && <p><strong>Super Admin:</strong> Akses penuh termasuk manajemen akun pengguna dan seluruh pengaturan sistem.</p>}
                {formData.role === "ADMIN" && <p><strong>Admin:</strong> Akses penuh ke semua data dan fitur, kecuali manajemen akun pengguna.</p>}
                {formData.role === "USER" && <p><strong>User:</strong> Akses terbatas — hanya dapat melihat data dan laporan sesuai izin yang diberikan.</p>}
              </div>

              {formError && (
                <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={saving} className="bg-sky hover:bg-sky/90 text-white">
                  {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Akun"}
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
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy mb-2">Hapus Akun?</h3>
                <p className="text-sm text-text-secondary">
                  Apakah Anda yakin ingin menghapus akun{" "}
                  <strong>{accountToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex justify-center gap-3 w-full mt-4">
                <Button variant="outline" className="flex-1" disabled={saving} onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" disabled={saving} onClick={confirmDelete}>
                  {saving ? "Menghapus..." : "Hapus Akun"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
