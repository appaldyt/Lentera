"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getEvaluators, createEvaluator, updateEvaluator, deleteEvaluator } from "@/actions/evaluation-users";
import { useEffect } from "react";

type User = {
  id: string;
  nik?: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function EvaluasiAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    email: "",
    password: "",
    role: "EVALUATOR",
    status: "Aktif"
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getEvaluators();
    // Map data to match User type
    const mappedUsers = data.map(u => ({
      id: u.id,
      nik: (u as any).nik || "-",
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status
    }));
    setUsers(mappedUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ nik: "", name: "", email: "", password: "", role: "EVALUATOR", status: "Aktif" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ nik: user.nik !== "-" ? user.nik || "" : "", name: user.name, email: user.email, password: "", role: user.role, status: user.status });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    setIsSaving(true);

    if (editingId) {
      await updateEvaluator(editingId, formData);
    } else {
      await createEvaluator(formData);
    }
    
    await fetchUsers();
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus akun ini?")) {
      await deleteEvaluator(id);
      await fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Manajemen Akun Atasan</h1>
          <p className="mt-2 text-text-secondary">
            Kelola daftar akun supervisor/manager yang memiliki hak akses untuk mengisi form evaluasi.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-navy hover:bg-navy-dark text-surface gap-2">
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Total {users.length} pengguna terdaftar di Portal Evaluasi.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder="Cari nama atau email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama Pengguna</th>
                  <th className="px-4 py-3 font-medium">NIK</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-medium text-navy">{user.name}</td>
                      <td className="px-4 py-4 text-text-secondary">{user.nik}</td>
                      <td className="px-4 py-4 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={user.role === 'EVALUATION_ADMIN' ? 'bg-sky/10 text-sky border-sky/20' : 'bg-slate-100 text-text-secondary border-border'}>
                          {user.role.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === 'Aktif' ? 'bg-success/10 text-success-dark' : 'bg-danger/10 text-danger-dark'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Aktif' ? 'bg-success' : 'bg-danger'}`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(user)}
                            className="h-8 w-8 text-sky hover:text-sky-dark hover:bg-sky/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 text-danger hover:text-danger-dark hover:bg-danger/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                      Tidak ada pengguna yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-navy">
              {editingId ? "Edit Akun" : "Tambah Akun Baru"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form untuk menambah atau mengubah akun evaluasi.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">NIK</span>
                <Input 
                  value={formData.nik} 
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 102945"
                  className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Nama Pengguna</span>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Handoko"
                  className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Email</span>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@ias.id"
                  className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">
                  Password {editingId && <span className="text-xs text-text-secondary/60">(Opsional)</span>}
                </span>
                <Input 
                  type="password"
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Kosongkan jika tidak diubah" : "Password baru"}
                  className="bg-white text-navy border-slate-300 focus-visible:ring-sky focus-visible:border-sky" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Role</span>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                  <SelectTrigger className="w-full bg-white border-slate-300 text-navy focus:ring-sky focus:border-sky data-[state=open]:border-sky">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVALUATOR">Evaluator</SelectItem>
                    <SelectItem value="EVALUATION_ADMIN">Evaluation Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-secondary">Status</span>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="w-full bg-white border-slate-300 text-navy focus:ring-sky focus:border-sky data-[state=open]:border-sky">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Non-Aktif">Non-Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="text-sky border-sky hover:bg-sky/5 font-medium"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.email || isSaving}
              className="bg-sky hover:bg-[#1565C0] text-white font-medium"
            >
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
