"use client";

import React, { useState, useEffect } from "react";
import { 
  Target, 
  Search, 
  Plus, 
  BookOpenCheck,
  Building2,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Filter,
  X,
  AlertTriangle,
  Upload,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

// --- MOCK DATA ---

interface MasterCompetency {
  id: string;
  code: string;
  name: string;
  definition: string;
  category: string;
  level: string;
}



interface JobRole {
  id: string;
  name: string;
  department: string;
  totalCompetencies: number;
  trainingNeeds: number;
  certificationNeeds: number;
}

const mockRoles: JobRole[] = [
  {
    id: "OPS-001",
    name: "Ground Handling Staff",
    department: "Ground Operations",
    totalCompetencies: 3,
    trainingNeeds: 3,
    certificationNeeds: 2,
  },
  {
    id: "OPS-002",
    name: "Aviobridge Operator",
    department: "Ground Operations",
    totalCompetencies: 4,
    trainingNeeds: 4,
    certificationNeeds: 1,
  },
  {
    id: "SVC-001",
    name: "Customer Service Officer",
    department: "Passenger Service",
    totalCompetencies: 5,
    trainingNeeds: 2,
    certificationNeeds: 0,
  },
  {
    id: "MGT-001",
    name: "Station Manager",
    department: "Management",
    totalCompetencies: 8,
    trainingNeeds: 5,
    certificationNeeds: 3,
  }
];

// --- COMPONENTS ---

export default function LearningNeedsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"roles" | "dictionary">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCompModalOpen, setIsAddCompModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isImportRoleModalOpen, setIsImportRoleModalOpen] = useState(false);
  const [isImportCompModalOpen, setIsImportCompModalOpen] = useState(false);
  const [editComp, setEditComp] = useState<MasterCompetency | null>(null);
  const [deleteComp, setDeleteComp] = useState<MasterCompetency | null>(null);
  const [editRole, setEditRole] = useState<JobRole | null>(null);
  const [deleteRole, setDeleteRole] = useState<JobRole | null>(null);

  const [competencies, setCompetencies] = useState<MasterCompetency[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCompetencies();
  }, []);

  const fetchCompetencies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/competencies");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompetencies(data);
      } else {
        console.error("API returned non-array data:", data);
        setCompetencies([]);
      }
    } catch (error) {
      console.error("Failed to fetch competencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = mockRoles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDict = competencies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy flex items-center gap-2">
          <Target className="h-6 w-6 text-sky" />
          Kebutuhan Belajar & Kompetensi
        </h2>
        <p className="text-text-secondary mt-1">
          Analisis kebutuhan training dan sertifikasi berdasarkan standar kompetensi masing-masing jabatan.
        </p>
      </div>

      {/* Custom Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "roles"
              ? "border-sky text-sky"
              : "border-transparent text-text-secondary hover:text-navy hover:border-border"
          }`}
          onClick={() => setActiveTab("roles")}
        >
          <Building2 className="h-4 w-4" />
          Daftar Jabatan
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "dictionary"
              ? "border-sky text-sky"
              : "border-transparent text-text-secondary hover:text-navy hover:border-border"
          }`}
          onClick={() => setActiveTab("dictionary")}
        >
          <BookOpenCheck className="h-4 w-4" />
          Kamus Kompetensi
        </button>
      </div>

      {/* Tab Content: Daftar Jabatan */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input 
                placeholder="Cari jabatan atau divisi..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9 text-text-secondary" onClick={() => setIsImportRoleModalOpen(true)}>
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9 text-text-secondary" onClick={() => alert("Fitur Export Jabatan akan segera hadir!")}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button className="gap-2 w-full sm:w-auto h-9" onClick={() => setIsAddRoleModalOpen(true)}>
                <Plus className="h-4 w-4" /> Tambah Jabatan
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama Jabatan</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead className="text-center">Total Kompetensi</TableHead>
                  <TableHead className="text-center">Butuh Training</TableHead>
                  <TableHead className="text-center">Butuh Sertifikasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs text-text-secondary">{role.id}</TableCell>
                    <TableCell className="font-medium text-navy">{role.name}</TableCell>
                    <TableCell className="text-text-secondary">{role.department}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-slate-100">{role.totalCompetencies}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-sky/10 text-sky border-sky/20">{role.trainingNeeds}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">{role.certificationNeeds}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sky hover:text-sky-light hover:bg-sky/10 px-2"
                          onClick={() => router.push(`/learning-needs/${role.id}`)}
                        >
                          Detail <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem className="cursor-pointer gap-2 text-navy" onClick={() => setEditRole(role)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2 text-danger focus:text-danger focus:bg-danger/10" onClick={() => setDeleteRole(role)}>
                              <Trash2 className="h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-text-secondary">
                      Tidak ada jabatan ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab Content: Kamus Kompetensi */}
      {activeTab === "dictionary" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input 
                placeholder="Cari ID, nama, atau kategori kompetensi..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9 text-text-secondary" onClick={() => setIsImportCompModalOpen(true)}>
                <Upload className="h-4 w-4" /> Import
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9 text-text-secondary" onClick={() => alert("Fitur Export Kompetensi akan segera hadir!")}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto h-9">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button className="gap-2 w-full sm:w-auto h-9 bg-navy hover:bg-navy-light text-white" onClick={() => setIsAddCompModalOpen(true)}>
                <Plus className="h-4 w-4" /> Tambah Kompetensi
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[200px]">Nama Kompetensi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="min-w-[300px]">Definisi</TableHead>
                  <TableHead className="text-right w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDict.map((comp) => (
                  <TableRow key={comp.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono text-xs">{comp.code}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-navy">{comp.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal ${
                        comp.category === 'Core' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        comp.category === 'Leadership' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        comp.category === 'Professional' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-sky-100 text-sky-700 border-sky-200'
                      }`}>
                        {comp.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-normal">
                        {comp.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary leading-relaxed">
                      {comp.definition}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem className="cursor-pointer gap-2 text-navy" onClick={() => setEditComp(comp)}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-danger focus:text-danger focus:bg-danger/10" onClick={() => setDeleteComp(comp)}>
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDict.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-text-secondary">
                      Tidak ada kamus kompetensi ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    {/* Modal Tambah Kompetensi */}
      {isAddCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-sky" /> Tambah Kompetensi Baru
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddCompModalOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={async (e: any) => { 
              e.preventDefault(); 
              const formData = new FormData(e.target);
              const data = {
                code: formData.get("code"),
                name: formData.get("name"),
                category: formData.get("category"),
                level: formData.get("level"),
                definition: formData.get("definition"),
              };
              try {
                await fetch("/api/competencies", {
                  method: "POST",
                  body: JSON.stringify(data),
                  headers: { "Content-Type": "application/json" }
                });
                fetchCompetencies();
                setIsAddCompModalOpen(false);
              } catch (err) {
                console.error(err);
              }
            }}>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</label>
                  <Input required name="code" placeholder="Ex: C01" className="font-mono" />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Kompetensi</label>
                  <Input required name="name" placeholder="Ex: Safety Awareness" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Kategori</label>
                  <select required name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                    <option value="">-- Pilih Kategori --</option>
                    <option value="Core">Core</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Professional">Professional</option>
                    <option value="Functional">Functional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Level</label>
                  <select required name="level" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                    <option value="">-- Pilih Level --</option>
                    <option value="Level 1 (Knowledgeable)">Level 1 (Knowledgeable)</option>
                    <option value="Level 2 (Apply)">Level 2 (Apply)</option>
                    <option value="Level 3 (Analyze)">Level 3 (Analyze)</option>
                    <option value="Level 4 (Evaluate)">Level 4 (Evaluate)</option>
                    <option value="Level 5 (Create)">Level 5 (Create)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Definisi Kompetensi</label>
                <textarea 
                  required 
                  name="definition"
                  rows={4}
                  placeholder="Jelaskan definisi dan indikator perilaku dari kompetensi ini..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setIsAddCompModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky-light text-white">Simpan Kompetensi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kompetensi */}
      {editComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Pencil className="h-5 w-5 text-sky" /> Edit Kompetensi
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setEditComp(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={async (e: any) => { 
              e.preventDefault(); 
              const formData = new FormData(e.target);
              const data = {
                code: editComp.code,
                name: formData.get("name"),
                category: formData.get("category"),
                level: formData.get("level"),
                definition: formData.get("definition"),
              };
              try {
                await fetch(`/api/competencies/${editComp.id}`, {
                  method: "PUT",
                  body: JSON.stringify(data),
                  headers: { "Content-Type": "application/json" }
                });
                fetchCompetencies();
                setEditComp(null);
              } catch (err) {
                console.error(err);
              }
            }}>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</label>
                  <Input required name="code" defaultValue={editComp.code} className="font-mono" disabled />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Kompetensi</label>
                  <Input required name="name" defaultValue={editComp.name} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Kategori</label>
                  <select required name="category" defaultValue={editComp.category} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                    <option value="Core">Core</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Professional">Professional</option>
                    <option value="Functional">Functional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Level</label>
                  <select required name="level" defaultValue={editComp.level} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                    <option value="Level 1 (Knowledgeable)">Level 1 (Knowledgeable)</option>
                    <option value="Level 2 (Apply)">Level 2 (Apply)</option>
                    <option value="Level 3 (Analyze)">Level 3 (Analyze)</option>
                    <option value="Level 4 (Evaluate)">Level 4 (Evaluate)</option>
                    <option value="Level 5 (Create)">Level 5 (Create)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Definisi Kompetensi</label>
                <textarea 
                  required 
                  name="definition"
                  rows={4}
                  defaultValue={editComp.definition}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setEditComp(null)}>Batal</Button>
                <Button type="submit" className="bg-sky hover:bg-sky-light text-white">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Kompetensi */}
      {deleteComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-navy">Hapus Kompetensi?</h3>
              <p className="text-sm text-text-secondary">
                Apakah Anda yakin ingin menghapus kompetensi <span className="font-bold text-navy">"{deleteComp.name}"</span>? Data ini mungkin terkait dengan jabatan tertentu.
              </p>
              
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeleteComp(null)}>Batal</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={async () => {
                  try {
                    await fetch(`/api/competencies/${deleteComp.id}`, { method: "DELETE" });
                    fetchCompetencies();
                    setDeleteComp(null);
                  } catch(e) {
                    console.error(e);
                  }
                }}>Ya, Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Jabatan */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky" /> Tambah Jabatan Baru
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddRoleModalOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddRoleModalOpen(false); }}>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Kode</label>
                  <Input required placeholder="Ex: OPS-003" className="font-mono" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Jabatan</label>
                  <Input required placeholder="Ex: Flight Dispatcher" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Divisi</label>
                <Input required placeholder="Ex: Ground Operations" />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setIsAddRoleModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-navy hover:bg-navy-light text-white">Simpan Jabatan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Jabatan */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Pencil className="h-5 w-5 text-sky" /> Edit Jabatan
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setEditRole(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); setEditRole(null); }}>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Kode</label>
                  <Input required defaultValue={editRole.id} className="font-mono" disabled />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Jabatan</label>
                  <Input required defaultValue={editRole.name} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Divisi</label>
                <Input required defaultValue={editRole.department} />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setEditRole(null)}>Batal</Button>
                <Button type="submit" className="bg-navy hover:bg-navy-light text-white">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Jabatan */}
      {deleteRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-navy">Hapus Jabatan?</h3>
              <p className="text-sm text-text-secondary">
                Apakah Anda yakin ingin menghapus jabatan <span className="font-bold text-navy">"{deleteRole.name}"</span>? Anda juga akan kehilangan seluruh pemetaan kompetensi di dalamnya.
              </p>
              
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeleteRole(null)}>Batal</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setDeleteRole(null)}>Ya, Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Jabatan */}
      {isImportRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border bg-white">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <Upload className="h-5 w-5 text-sky" /> Import Data Jabatan
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsImportRoleModalOpen(false)} className="h-8 w-8 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="font-semibold text-sky">Upload File</span>
                <ChevronRight className="h-4 w-4" />
                <span>Preview Data</span>
                <ChevronRight className="h-4 w-4" />
                <span>Hasil Import</span>
              </div>

              <div className="border-2 border-dashed border-sky-200 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white hover:bg-sky-50/50 transition-colors cursor-pointer">
                <div className="h-14 w-14 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-sky-600" />
                </div>
                <h4 className="text-base font-bold text-navy mb-1">Klik untuk upload atau drag & drop</h4>
                <p className="text-sm text-text-secondary">Hanya file <span className="font-semibold">.xlsx</span> yang didukung</p>
              </div>

              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Format Kolom Yang Diperlukan:</p>
                <div className="flex flex-wrap gap-2">
                  {['Kode Jabatan', 'Nama Jabatan', 'Divisi', 'ID Kompetensi', 'Sifat Kompetensi', 'List Training', 'List Sertifikasi'].map(col => (
                    <Badge key={col} variant="outline" className="bg-white text-slate-600 border-slate-200 font-medium py-1 px-3">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="text-sky border-sky-200 hover:bg-sky-50 gap-2 h-10 px-4">
                  <Download className="h-4 w-4" /> Download Template Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Kamus Kompetensi */}
      {isImportCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border bg-white">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <Upload className="h-5 w-5 text-sky" /> Import Kamus Kompetensi
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsImportCompModalOpen(false)} className="h-8 w-8 rounded-full hover:bg-slate-100">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="font-semibold text-sky">Upload File</span>
                <ChevronRight className="h-4 w-4" />
                <span>Preview Data</span>
                <ChevronRight className="h-4 w-4" />
                <span>Hasil Import</span>
              </div>

              <div className="border-2 border-dashed border-sky-200 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white hover:bg-sky-50/50 transition-colors cursor-pointer">
                <div className="h-14 w-14 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-sky-600" />
                </div>
                <h4 className="text-base font-bold text-navy mb-1">Klik untuk upload atau drag & drop</h4>
                <p className="text-sm text-text-secondary">Hanya file <span className="font-semibold">.xlsx</span> yang didukung</p>
              </div>

              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Format Kolom Yang Diperlukan:</p>
                <div className="flex flex-wrap gap-2">
                  {['ID Kompetensi', 'Nama Kompetensi', 'Kategori', 'Level', 'Definisi'].map(col => (
                    <Badge key={col} variant="outline" className="bg-white text-slate-600 border-slate-200 font-medium py-1 px-3">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="text-sky border-sky-200 hover:bg-sky-50 gap-2 h-10 px-4">
                  <Download className="h-4 w-4" /> Download Template Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
