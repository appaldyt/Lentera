"use client";

import React, { useState } from "react";
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

const mockAccounts: Account[] = [
  {
    id: "ACC-001",
    name: "Super Admin",
    email: "superadmin@ias.id",
    role: "SUPER_ADMIN",
    status: "AKTIF",
    lastLogin: "2026-06-01 09:00",
    createdAt: "2026-01-01",
  },
  {
    id: "ACC-002",
    name: "Admin HR LENTERA",
    email: "admin@ias.id",
    role: "ADMIN",
    status: "AKTIF",
    lastLogin: "2026-06-01 08:32",
    createdAt: "2026-01-01",
  },
  {
    id: "ACC-003",
    name: "Budi Santoso",
    email: "budi.s@ias.id",
    role: "USER",
    status: "AKTIF",
    lastLogin: "2026-05-31 14:10",
    createdAt: "2026-01-15",
  },
  {
    id: "ACC-004",
    name: "Rina Wijaya",
    email: "rina.w@ias.id",
    role: "USER",
    status: "AKTIF",
    lastLogin: "2026-05-30 09:45",
    createdAt: "2026-02-01",
  },
  {
    id: "ACC-005",
    name: "Hendra Gunawan",
    email: "hendra.g@ias.id",
    role: "USER",
    status: "NONAKTIF",
    lastLogin: "2026-04-20 11:00",
    createdAt: "2026-02-10",
  },
  {
    id: "ACC-006",
    name: "Siti Rahma",
    email: "siti.r@ias.id",
    role: "USER",
    status: "AKTIF",
    lastLogin: "2026-06-01 07:55",
    createdAt: "2026-03-01",
  },
];

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
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ ...emptyForm });

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

  const handleSave = (e: React.FormEvent) => {
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

    if (editId) {
      setAccounts(accounts.map((acc) =>
        acc.id === editId
          ? { ...acc, name: formData.name, email: formData.email, role: formData.role, status: formData.status }
          : acc
      ));
    } else {
      const newAccount: Account = {
        id: `ACC-00${accounts.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        lastLogin: "-",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAccounts([newAccount, ...accounts]);
    }

    setIsModalOpen(false);
    setFormData({ ...emptyForm });
  };

  const promptDelete = (acc: Account) => {
    setAccountToDelete(acc);
    setIsDeleteModalOpen(true);
    setOpenActionId(null);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      setAccounts(accounts.filter((acc) => acc.id !== accountToDelete.id));
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
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
          Menampilkan <strong>{filteredAccounts.length}</strong> dari {accounts.length} akun
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
          {filteredAccounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-text-secondary">
                Tidak ada akun yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            filteredAccounts.map((acc) => {
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
                    <div className="relative inline-block text-left">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-text-secondary"
                        onClick={() => setOpenActionId(openActionId === acc.id ? null : acc.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openActionId === acc.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                          <Card className="absolute right-0 top-full mt-1 w-36 z-50 py-1 shadow-md border-border animate-in fade-in zoom-in-95 duration-100">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-muted/50 flex items-center gap-2"
                              onClick={() => handleEdit(acc)}
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                              onClick={() => promptDelete(acc)}
                            >
                              <Trash2 className="h-4 w-4" /> Hapus
                            </button>
                          </Card>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

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
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky/90 text-white">
                  {editId ? "Simpan Perubahan" : "Buat Akun"}
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
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={confirmDelete}>
                  Hapus Akun
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
