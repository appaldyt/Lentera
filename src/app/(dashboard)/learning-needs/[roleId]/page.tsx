"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Award,
  X,
  BookOpenCheck,
  AlertTriangle,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const generateId = () => Math.random().toString(36).substring(2, 9);

function SortableFieldItem({ id, item, onUpdate, onRemove, namePlaceholder }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50/50 relative z-10 bg-white">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-100 p-1 rounded text-slate-400">
          <GripVertical className="h-4 w-4" />
        </div>
        <Input 
          placeholder={namePlaceholder}
          value={item.name}
          onChange={(e) => onUpdate(id, 'name', e.target.value)}
          className="flex-1 bg-white"
        />
        <select
          value={item.isRequired ? "Wajib" : "Opsional"}
          onChange={(e) => onUpdate(id, 'isRequired', e.target.value === "Wajib")}
          className="flex h-10 w-[110px] rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <option value="Wajib">Wajib</option>
          <option value="Opsional">Opsional</option>
        </select>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-danger hover:bg-danger/10 shrink-0"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="pl-8">
        <Input 
          placeholder="Catatan / Notes (opsional)" 
          value={item.notes}
          onChange={(e) => onUpdate(id, 'notes', e.target.value)}
          className="w-full text-sm bg-white"
        />
      </div>
    </div>
  );
}

// --- MOCK DATA ---
const mockRoleDetail = {
  id: "OPS-001",
  name: "Ground Handling Staff",
  department: "Ground Operations",
  stats: {
    wajib: 2,
    opsional: 1,
    trainingNeeds: 3,
    certificationNeeds: 2,
    totalCompetencies: 3
  },
  competencies: [
    {
      id: "C01",
      name: "Safety Awareness",
      category: "Functional",
      level: "Level 1 (Knowledgeable)",
      isRequired: true,
      description: "Memahami prinsip-prinsip dasar keselamatan kerja dan mampu mengidentifikasi potensi bahaya di lingkungan operasional.",
      trainings: [
        { name: "K3 Dasar", isRequired: true, notes: "" }, 
        { name: "Safety Briefing", isRequired: false, notes: "" }
      ],
      certifications: [
        { name: "Sertifikasi K3 Umum", isRequired: true, notes: "" }
      ]
    },
    {
      id: "C03",
      name: "Aircraft Ground Handling",
      category: "Functional",
      level: "Level 3 (Analyze)",
      isRequired: true,
      description: "Mampu melakukan dan menganalisis prosedur penanganan pesawat di darat sesuai dengan standar keselamatan dan regulasi penerbangan.",
      trainings: [{ name: "Ground Handling Fundamentals", isRequired: true, notes: "" }],
      certifications: [{ name: "Ground Handling License", isRequired: true, notes: "" }]
    },
    {
      id: "C08",
      name: "Communication",
      category: "Core",
      level: "Level 2 (Apply)",
      isRequired: false,
      description: "Mampu menyampaikan informasi secara jelas dan efektif kepada berbagai pihak terkait dalam operasional sehari-hari.",
      trainings: [{ name: "Effective Communication", isRequired: false, notes: "" }],
      certifications: []
    }
  ]
};

// HELPER FOR BADGE COLORS
const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Core": return "bg-orange-50 text-orange-600 border-orange-200";
    case "Leadership": return "bg-purple-50 text-purple-600 border-purple-200";
    case "Professional": return "bg-blue-50 text-blue-600 border-blue-200";
    default: return "bg-sky-50 text-sky-600 border-sky-200";
  }
};

const getLevelColor = (level: string) => {
  return "bg-emerald-50 text-emerald-600 border-emerald-200"; // Based on mockup, level is green
};

export default function RoleLearningNeedsPage() {
  const params = useParams();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editComp, setEditComp] = useState<any>(null);
  const [deleteComp, setDeleteComp] = useState<any>(null);
  const [trainings, setTrainings] = useState<any[]>([{ id: generateId(), name: "", isRequired: true, notes: "" }]);
  const [certifications, setCertifications] = useState<any[]>([{ id: generateId(), name: "", isRequired: true, notes: "" }]);
  // In real app, fetch based on params.roleId
  const [role, setRole] = useState(mockRoleDetail); 

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndTraining = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTrainings((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndCert = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCertifications((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateTraining = (id: string, field: string, value: any) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTraining = (id: string) => {
    setTrainings(prev => {
      const next = prev.filter(t => t.id !== id);
      return next.length ? next : [{ id: generateId(), name: "", isRequired: true, notes: "" }];
    });
  };

  const updateCert = (id: string, field: string, value: any) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCert = (id: string) => {
    setCertifications(prev => {
      const next = prev.filter(c => c.id !== id);
      return next.length ? next : [{ id: generateId(), name: "", isRequired: true, notes: "" }];
    });
  };

  // Derived stats
  let totalCompWajib = 0;
  let totalCompOpsional = 0;
  let trainingWajib = 0;
  let trainingOpsional = 0;
  let certWajib = 0;
  let certOpsional = 0;
  
  role.competencies.forEach(comp => {
    if (comp.isRequired) totalCompWajib++;
    else totalCompOpsional++;
    
    comp.trainings?.forEach((t: any) => {
      if (t.isRequired) trainingWajib++;
      else trainingOpsional++;
    });
    
    comp.certifications?.forEach((c: any) => {
      if (c.isRequired) certWajib++;
      else certOpsional++;
    });
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-5xl mx-auto pb-10">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="gap-2 text-text-secondary hover:text-navy -ml-2"
        onClick={() => router.push("/learning-needs")}
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Jabatan
      </Button>

      {/* Header Card */}
      <Card className="p-6 border-border shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{role.id}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">{role.name}</h2>
            <div className="flex items-center text-text-secondary text-sm">
              <MapPin className="h-4 w-4 mr-1 text-rose-500" /> {role.department}
            </div>
          </div>
          <div className="text-center flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-sky leading-none">{role.competencies.length}</span>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Kompetensi</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-rose-50/50 rounded-xl p-4 flex flex-col items-center justify-center border border-rose-100">
            <span className="text-2xl font-bold text-rose-600">{totalCompWajib}</span>
            <span className="text-xs font-medium text-rose-500 mt-1 mb-2">Kompetensi Wajib</span>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-4 flex flex-col items-center justify-center border border-emerald-100">
            <span className="text-2xl font-bold text-emerald-600">{totalCompOpsional}</span>
            <span className="text-xs font-medium text-emerald-500 mt-1 mb-2">Komp. Opsional</span>
          </div>
          <div className="bg-sky-50/50 rounded-xl p-4 flex flex-col items-center justify-center border border-sky-100">
            <span className="text-2xl font-bold text-sky-600">{trainingWajib + trainingOpsional}</span>
            <span className="text-xs font-medium text-sky-500 mt-1 mb-2">Total Training</span>
            <div className="flex gap-1.5 text-[9px] font-bold uppercase">
              <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{trainingWajib} Wajib</span>
              <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{trainingOpsional} Ops.</span>
            </div>
          </div>
          <div className="bg-purple-50/50 rounded-xl p-4 flex flex-col items-center justify-center border border-purple-100">
            <span className="text-2xl font-bold text-purple-600">{certWajib + certOpsional}</span>
            <span className="text-xs font-medium text-purple-500 mt-1 mb-2">Total Sertifikasi</span>
            <div className="flex gap-1.5 text-[9px] font-bold uppercase">
              <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{certWajib} Wajib</span>
              <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{certOpsional} Ops.</span>
            </div>
          </div>
        </div>
      </Card>

      {/* List Section */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg font-bold text-navy">Daftar Kompetensi & Pemenuhan</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" /> Tambah Kompetensi
        </Button>
      </div>

      <div className="space-y-4">
        {role.competencies.map((comp) => (
          <Card key={comp.id} className="border-border shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className="bg-sky-50 text-sky-700 font-bold text-sm h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-sky-100">
                    {comp.id}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-navy mb-1">{comp.name}</h4>
                    {comp.description && <p className="text-sm text-text-secondary mb-3 leading-relaxed max-w-3xl">{comp.description}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`font-medium ${getCategoryColor(comp.category)}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {comp.category}
                      </Badge>
                      <Badge variant="outline" className={`font-medium ${getLevelColor(comp.level)}`}>
                        {comp.level}
                      </Badge>
                      {comp.isRequired && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 px-1.5 py-0.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button variant="outline" size="sm" className="h-9 gap-2 text-text-secondary border-border/60 hover:bg-slate-50" onClick={() => {
                    setEditComp(comp);
                    setTrainings(comp.trainings?.length ? comp.trainings.map((t: any) => typeof t === "string" ? { id: generateId(), name: t, isRequired: true, notes: "" } : { id: generateId(), ...t }) : [{ id: generateId(), name: "", isRequired: true, notes: "" }]);
                    setCertifications(comp.certifications?.length ? comp.certifications.map((c: any) => typeof c === "string" ? { id: generateId(), name: c, isRequired: true, notes: "" } : { id: generateId(), ...c }) : [{ id: generateId(), name: "", isRequired: true, notes: "" }]);
                  }}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-rose-500 border-rose-100 hover:bg-rose-50 hover:border-rose-200" onClick={() => setDeleteComp(comp)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Bottom: Needs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-100 bg-slate-50/30 -mx-5 -mb-5 px-5 py-4">
                <div className="space-y-3 md:border-r border-slate-100 md:pr-5 mb-4 md:mb-0">
                  <p className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-widest">Training</p>
                  {comp.trainings && comp.trainings.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {comp.trainings.map((t: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-sky-50/50 hover:bg-sky-50 text-sky-700 font-medium py-1.5 px-3 border border-sky-100/50 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-rose-400" /> 
                          {typeof t === "string" ? t : t.name}
                          {typeof t === "object" && t.isRequired && (
                            <AlertTriangle className="ml-0.5 h-3.5 w-3.5 text-rose-500" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary/60 italic">— tidak ada —</p>
                  )}
                </div>
                <div className="space-y-3 md:pl-5">
                  <p className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-widest">Sertifikasi</p>
                  {comp.certifications && comp.certifications.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {comp.certifications.map((c: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-purple-50/50 hover:bg-purple-50 text-purple-700 font-medium py-1.5 px-3 border border-purple-100/50 flex items-center gap-2">
                          <Award className="h-3.5 w-3.5 text-orange-400" /> 
                          {typeof c === "string" ? c : c.name}
                          {typeof c === "object" && c.isRequired && (
                            <AlertTriangle className="ml-0.5 h-3.5 w-3.5 text-rose-500" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary/60 italic">— tidak ada —</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Tambah Kompetensi (Mapping) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-sky" /> Tambah Pemenuhan Kompetensi
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="flex flex-col overflow-hidden" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
              <div className="p-5 space-y-4 overflow-y-auto">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Pilih Kompetensi dari Kamus</label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                  <option value="">-- Cari / Pilih Kompetensi --</option>
                  <option value="C01">C01 - Safety Awareness (Functional)</option>
                  <option value="C08">C08 - Communication (Core)</option>
                  <option value="L01">L01 - Team Leadership (Leadership)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Sifat Kompetensi</label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                  <option value="Wajib">Wajib (Mandatory)</option>
                  <option value="Opsional">Opsional (Nice to have)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-navy mb-3">Cara Pemenuhan (Opsional)</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3 w-3 text-sky" /> Nama Training Internal/Eksternal
                    </label>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTraining}>
                      <SortableContext items={trainings.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {trainings.map((t) => (
                            <SortableFieldItem key={t.id} id={t.id} item={t} onUpdate={updateTraining} onRemove={removeTraining} namePlaceholder="Ex: Basic Safety Training" />
                          ))}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-sky hover:text-sky hover:bg-sky/10 gap-1 px-2 h-8"
                            onClick={() => setTrainings([...trainings, { id: generateId(), name: "", isRequired: true, notes: "" }])}
                          >
                            <Plus className="h-3 w-3" /> Tambah Training
                          </Button>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple-500" /> Sertifikasi Kompetensi
                    </label>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCert}>
                      <SortableContext items={certifications.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {certifications.map((c) => (
                            <SortableFieldItem key={c.id} id={c.id} item={c} onUpdate={updateCert} onRemove={removeCert} namePlaceholder="Ex: Sertifikasi K3" />
                          ))}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 gap-1 px-2 h-8"
                            onClick={() => setCertifications([...certifications, { id: generateId(), name: "", isRequired: true, notes: "" }])}
                          >
                            <Plus className="h-3 w-3" /> Tambah Sertifikasi
                          </Button>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              </div>

              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-border bg-slate-50/50 shrink-0 mt-auto">
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Pemenuhan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kompetensi */}
      {editComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Pencil className="h-5 w-5 text-sky" /> Edit Pemenuhan Kompetensi
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setEditComp(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form className="flex flex-col overflow-hidden" onSubmit={(e) => { 
              e.preventDefault(); 
              const newCompetencies = role.competencies.map((comp) => {
                if (comp.id === editComp.id) {
                  return { ...comp, trainings, certifications };
                }
                return comp;
              });
              setRole({ ...role, competencies: newCompetencies });
              setEditComp(null); 
            }}>
              <div className="p-5 space-y-4 overflow-y-auto">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Kompetensi dari Kamus</label>
                <Input required defaultValue={`${editComp.id} - ${editComp.name} (${editComp.category})`} disabled className="bg-slate-50" />
                {editComp.description && <p className="text-xs text-text-secondary mt-1 italic">{editComp.description}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Sifat Kompetensi</label>
                <select required defaultValue={editComp.isRequired ? "Wajib" : "Opsional"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                  <option value="Wajib">Wajib (Mandatory)</option>
                  <option value="Opsional">Opsional (Nice to have)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-navy mb-3">Cara Pemenuhan (Opsional)</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3 w-3 text-sky" /> Nama Training Internal/Eksternal
                    </label>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTraining}>
                      <SortableContext items={trainings.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {trainings.map((t) => (
                            <SortableFieldItem key={t.id} id={t.id} item={t} onUpdate={updateTraining} onRemove={removeTraining} namePlaceholder="Ex: Basic Safety Training" />
                          ))}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-sky hover:text-sky hover:bg-sky/10 gap-1 px-2 h-8"
                            onClick={() => setTrainings([...trainings, { id: generateId(), name: "", isRequired: true, notes: "" }])}
                          >
                            <Plus className="h-3 w-3" /> Tambah Training
                          </Button>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple-500" /> Sertifikasi Kompetensi
                    </label>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCert}>
                      <SortableContext items={certifications.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {certifications.map((c) => (
                            <SortableFieldItem key={c.id} id={c.id} item={c} onUpdate={updateCert} onRemove={removeCert} namePlaceholder="Ex: Sertifikasi K3" />
                          ))}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 gap-1 px-2 h-8"
                            onClick={() => setCertifications([...certifications, { id: generateId(), name: "", isRequired: true, notes: "" }])}
                          >
                            <Plus className="h-3 w-3" /> Tambah Sertifikasi
                          </Button>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              </div>

              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-border bg-slate-50/50 shrink-0 mt-auto">
                <Button variant="outline" type="button" onClick={() => setEditComp(null)}>Batal</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Perubahan</Button>
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
                Apakah Anda yakin ingin menghapus kompetensi <span className="font-bold text-navy">"{deleteComp.name}"</span> dari pemenuhan jabatan ini?
              </p>
              
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeleteComp(null)}>Batal</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setDeleteComp(null)}>Ya, Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
