import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CornerDownRight, CheckSquare, Square, Link as LinkIcon, Pencil, Trash2, Plus, X, MoreHorizontal, Upload, FileSpreadsheet, FileUp, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface ImportTaskRow {
  activityName: string;
  category: string;
  dueDate: string;
  priority: string;
  pic: string;
  team: string;
  linkOutput: string;
  note: string;
  _errors: string[];
}

const TASK_CSV_HEADERS = ["Task Name", "Category", "Due Date", "Priority", "PIC", "Team", "Link Output", "Note"];

function parseTaskExcel(buffer: ArrayBuffer): ImportTaskRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, raw: true });

  if (rows.length < 2) return [];

  const dataLines = rows.slice(1);

  return dataLines.map((cols: any[]) => {
    const activityName = (cols[0] || "").toString().trim();
    const category = (cols[1] || "").toString().trim();
    
    let dueDate = "";
    if (cols[2] instanceof Date) {
      dueDate = cols[2].toISOString().split("T")[0];
    } else if (typeof cols[2] === "number") {
      const d = new Date(Math.round((cols[2] - 25569) * 86400 * 1000));
      dueDate = d.toISOString().split("T")[0];
    } else {
      const str = (cols[2] || "").toString().trim();
      if (str.includes("/") && str.split("/")[2]?.length === 4) {
         const parts = str.split("/");
         dueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
         dueDate = str;
      }
    }

    const priority = (cols[3] || "Normal").toString().trim();
    const pic = (cols[4] || "").toString().trim();
    const team = (cols[5] || "").toString().trim();
    const linkOutput = (cols[6] || "").toString().trim();
    const note = (cols[7] || "").toString().trim();

    const errors: string[] = [];
    if (!activityName) errors.push("Task Name wajib diisi");
    if (!category) errors.push("Category wajib diisi");
    if (!dueDate) errors.push("Due Date wajib diisi");
    if (!pic) errors.push("PIC wajib diisi");
    if (!team) errors.push("Team wajib diisi");

    return { 
      activityName, 
      category, 
      dueDate, 
      priority, 
      pic, 
      team, 
      linkOutput, 
      note, 
      _errors: errors 
    };
  }).filter((row) => row.activityName || row._errors.length > 0);
}

function downloadTaskTemplate() {
  const wsData = [
    TASK_CSV_HEADERS,
    ['Distribusi undangan peserta', 'Administrasi', '2026-06-03', 'Normal', 'Sari Dewi', 'HR', '-', 'Kirim via email'],
    ['Setup ruangan & peralatan', 'Logistik', '2026-06-09', 'Urgent', 'Rendi Pratama', 'GA', '-', ''],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "template_import_task.xlsx");
}

export interface Subtask {
  id: string;
  activityName: string;
  category: string;
  dueDate: string;
  priority: string;
  pic: string;
  team: string;
  isCompleted: boolean;
  progress: string;
  linkOutput: string;
  note?: string;
  order?: number;
}

function SortableRow({ prep, index, isNestedView, toggleSubtaskCompletion, updateSubtaskProgress, handleOpenSubtaskModal }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: prep.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? ("relative" as const) : undefined,
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: isDragging ? "var(--muted)" : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-muted/30">
      <TableCell className="text-center text-text-secondary">
        <div className="flex items-center justify-center gap-1">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted rounded p-1">
            <GripVertical className="h-4 w-4 text-text-secondary/50" />
          </div>
          {isNestedView ? <CornerDownRight className="h-4 w-4" /> : index + 1}
        </div>
      </TableCell>
      <TableCell className={cn("font-medium", prep.isCompleted ? "text-text-secondary line-through" : "text-navy")}>
        {prep.activityName}
      </TableCell>
      <TableCell className="text-text-secondary text-sm">{prep.category}</TableCell>
      <TableCell className="text-text-secondary text-sm">{prep.dueDate}</TableCell>
      <TableCell>{getPriorityBadge(prep.priority)}</TableCell>
      <TableCell className="text-sm font-medium">{prep.pic}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px] py-0 bg-background">{prep.team}</Badge>
      </TableCell>
      <TableCell className="text-center">
        <button 
          onClick={() => toggleSubtaskCompletion(prep.id)}
          className="hover:bg-muted p-1 rounded-md transition-colors"
          type="button"
        >
          {prep.isCompleted ? (
            <CheckSquare className="h-5 w-5 text-success mx-auto" />
          ) : (
            <Square className="h-5 w-5 text-text-secondary mx-auto" />
          )}
        </button>
      </TableCell>
      <TableCell className="text-sm">
        <select
          className="bg-transparent border border-transparent hover:border-border rounded-md px-1 py-0.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky cursor-pointer"
          value={prep.progress}
          onChange={(e) => updateSubtaskProgress(prep.id, e.target.value)}
        >
          <option value="0%">0%</option>
          <option value="25%">25%</option>
          <option value="50%">50%</option>
          <option value="75%">75%</option>
          <option value="100%">100%</option>
        </select>
      </TableCell>
      <TableCell>
        {prep.linkOutput !== "-" ? (
          <a href={prep.linkOutput.startsWith('http') ? prep.linkOutput : '#'} target={prep.linkOutput.startsWith('http') ? "_blank" : "_self"} className="flex items-center gap-1 text-sky hover:underline text-xs" rel="noreferrer">
            <LinkIcon className="h-3 w-3" /> Output
          </a>
        ) : (
          <span className="text-text-secondary">-</span>
        )}
      </TableCell>
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
              onClick={() => handleOpenSubtaskModal("edit", prep)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="w-full flex items-center gap-2 text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
              onClick={() => handleOpenSubtaskModal("delete", prep)}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}



interface TrainingPreparationsTableProps {
  trainingId: string;
  preparations: Subtask[];
  onChange: (newPreparations: Subtask[]) => void;
  // If true, it renders without the top "CornerDownRight" visual indent since it's used in the detail page.
  isNestedView?: boolean;
}

export function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Urgent":
      return <Badge variant="danger" className="text-[10px] py-0">{priority}</Badge>;
    case "Important":
      return <Badge variant="warning" className="text-[10px] py-0">{priority}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] py-0 text-text-secondary">{priority}</Badge>;
  }
}

export default function TrainingPreparationsTable({ trainingId, preparations, onChange, isNestedView = true }: TrainingPreparationsTableProps) {
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [subtaskModalMode, setSubtaskModalMode] = useState<"add" | "edit" | "delete">("add");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  const [subtaskFormData, setSubtaskFormData] = useState({
    activityName: "",
    category: "",
    dueDate: "",
    priority: "Normal",
    pic: "",
    team: "",
    linkOutput: "",
    note: "",
  });

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportTaskModalOpen, setIsImportTaskModalOpen] = useState(false);
  const [importTaskStep, setImportTaskStep] = useState<"upload" | "preview" | "result">("upload");
  const [importTaskRows, setImportTaskRows] = useState<ImportTaskRow[]>([]);
  const [importTaskFileName, setImportTaskFileName] = useState("");
  const [importTaskResult, setImportTaskResult] = useState<{ successCount: number; failed: { name: string; reason: string }[] } | null>(null);
  const [importingTask, setImportingTask] = useState(false);
  const [isDraggingTask, setIsDraggingTask] = useState(false);

  const handleTaskFileSelect = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Hanya file .xlsx yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportTaskFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rows = parseTaskExcel(buffer);
      setImportTaskRows(rows);
      setImportTaskStep("preview");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTaskDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTask(false);
    const file = e.dataTransfer.files[0];
    if (file) handleTaskFileSelect(file);
  };

  const handleConfirmImportTask = () => {
    const validRows = importTaskRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) return;
    setImportingTask(true);
    
    setTimeout(() => {
      const newTasks: Subtask[] = validRows.map((r, index) => ({
        id: `P-IMP-${Date.now()}-${index}`,
        activityName: r.activityName,
        category: r.category,
        dueDate: r.dueDate,
        priority: r.priority,
        pic: r.pic,
        team: r.team,
        isCompleted: false,
        progress: "0%",
        linkOutput: r.linkOutput || "-",
        note: r.note || "",
      }));
      
      onChange([...preparations, ...newTasks]);
      
      setImportTaskResult({
        successCount: validRows.length,
        failed: importTaskRows.filter(r => r._errors.length > 0).map(r => ({
          name: r.activityName,
          reason: r._errors.join(", ")
        }))
      });
      setImportTaskStep("result");
      setImportingTask(false);
    }, 500);
  };

  const closeImportTaskModal = () => {
    setIsImportTaskModalOpen(false);
    setImportTaskStep("upload");
    setImportTaskRows([]);
    setImportTaskFileName("");
    setImportTaskResult(null);
  };

  const validTaskImportCount = importTaskRows.filter((r) => r._errors.length === 0).length;
  const invalidTaskImportCount = importTaskRows.filter((r) => r._errors.length > 0).length;

  const handleOpenSubtaskModal = (mode: "add" | "edit" | "delete", subtask: Subtask | null = null) => {
    setSubtaskModalMode(mode);
    if (subtask) {
      setEditingSubtaskId(subtask.id);
      setSubtaskFormData({
        activityName: subtask.activityName,
        category: subtask.category,
        dueDate: subtask.dueDate,
        priority: subtask.priority,
        pic: subtask.pic,
        team: subtask.team,
        linkOutput: subtask.linkOutput || "",
        note: subtask.note || "",
      });
    } else {
      setEditingSubtaskId(null);
      setSubtaskFormData({
        activityName: "",
        category: "",
        dueDate: "",
        priority: "Normal",
        pic: "",
        team: "",
        linkOutput: "",
        note: "",
      });
    }
    setIsSubtaskModalOpen(true);
  };

  const handleSaveSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskModalMode === "add") {
      const newSubtask: Subtask = {
        id: `P-${preparations.length + 1}0${Math.floor(Math.random() * 10)}`,
        activityName: subtaskFormData.activityName,
        category: subtaskFormData.category,
        dueDate: subtaskFormData.dueDate,
        priority: subtaskFormData.priority,
        pic: subtaskFormData.pic,
        team: subtaskFormData.team,
        isCompleted: false,
        progress: "0%",
        linkOutput: subtaskFormData.linkOutput || "-",
        note: subtaskFormData.note
      };
      onChange([...preparations, newSubtask]);
    } else if (subtaskModalMode === "edit" && editingSubtaskId) {
      onChange(preparations.map(p => p.id === editingSubtaskId ? {
        ...p,
        activityName: subtaskFormData.activityName,
        category: subtaskFormData.category,
        dueDate: subtaskFormData.dueDate,
        priority: subtaskFormData.priority,
        pic: subtaskFormData.pic,
        team: subtaskFormData.team,
        linkOutput: subtaskFormData.linkOutput || "-",
        note: subtaskFormData.note
      } : p));
    }
    setIsSubtaskModalOpen(false);
  };

  const confirmDeleteSubtask = () => {
    if (editingSubtaskId) {
      onChange(preparations.filter(p => p.id !== editingSubtaskId));
      setIsSubtaskModalOpen(false);
      setEditingSubtaskId(null);
    }
  };

  const toggleSubtaskCompletion = (subtaskId: string) => {
    onChange(preparations.map(p => {
      if (p.id === subtaskId) {
        const newIsCompleted = !p.isCompleted;
        return {
          ...p,
          isCompleted: newIsCompleted,
          progress: newIsCompleted ? "100%" : (p.progress === "100%" ? "0%" : p.progress)
        };
      }
      return p;
    }));
  };

  const updateSubtaskProgress = (subtaskId: string, progress: string) => {
    onChange(preparations.map(p => {
      if (p.id === subtaskId) {
        return {
          ...p,
          progress: progress,
          isCompleted: progress === "100%"
        };
      }
      return p;
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = preparations.findIndex((p) => p.id === active.id);
      const newIndex = preparations.findIndex((p) => p.id === over.id);
      const newPreparations = arrayMove(preparations, oldIndex, newIndex);
      // Optional: Update local order field if we were using it in frontend logic, but index handles it.
      onChange(newPreparations);
    }
  };

  return (
    <div className={cn("border rounded-md overflow-hidden bg-background", isNestedView ? "ml-14 mt-2 mb-2" : "")}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          <TableHeader className="bg-navy text-surface">
            <TableRow className="hover:bg-navy">
              {isNestedView && <TableHead className="w-16 text-surface text-center">No</TableHead>}
              {!isNestedView && <TableHead className="w-16 text-surface text-center">No</TableHead>}
              <TableHead className="text-surface font-semibold">Task / Sub-task Name</TableHead>
              <TableHead className="text-surface font-semibold">Category</TableHead>
              <TableHead className="text-surface font-semibold">Due Date</TableHead>
              <TableHead className="text-surface font-semibold">Priority</TableHead>
              <TableHead className="text-surface font-semibold">PIC</TableHead>
              <TableHead className="text-surface font-semibold">Team</TableHead>
              <TableHead className="text-surface font-semibold text-center">✓</TableHead>
              <TableHead className="text-surface font-semibold">Progress</TableHead>
              <TableHead className="text-surface font-semibold">Link Output</TableHead>
              <TableHead className="text-surface font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={preparations.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {preparations.map((prep, index) => (
                <SortableRow
                  key={prep.id}
                  prep={prep}
                  index={index}
                  isNestedView={isNestedView}
                  toggleSubtaskCompletion={toggleSubtaskCompletion}
                  updateSubtaskProgress={updateSubtaskProgress}
                  handleOpenSubtaskModal={handleOpenSubtaskModal}
                />
              ))}
            </SortableContext>
          {preparations.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4 text-text-secondary">
                Belum ada aktivitas persiapan.
              </TableCell>
            </TableRow>
          )}
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={11} className="p-2">
              <div className="flex gap-2 w-full">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-sky hover:text-sky hover:bg-sky-light/10 justify-center border border-dashed border-sky-light/30"
                  onClick={() => handleOpenSubtaskModal("add")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Sub-task Baru
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-sky hover:text-sky hover:bg-sky-light/10 justify-center border border-dashed border-sky-light/30"
                  onClick={() => setIsImportTaskModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Task
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      </DndContext>

      {/* Subtask Modal Dialog */}
      {isSubtaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-lg rounded-xl shadow-lg border border-border p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy">
                {subtaskModalMode === "add" ? "Tambah Sub-task Baru" : subtaskModalMode === "edit" ? "Edit Sub-task" : "Hapus Sub-task"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsSubtaskModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {subtaskModalMode === "delete" ? (
              <div className="space-y-6">
                <p className="text-text-secondary">
                  Apakah Anda yakin ingin menghapus sub-task <strong>{subtaskFormData.activityName}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsSubtaskModalOpen(false)}>Batal</Button>
                  <Button type="button" onClick={confirmDeleteSubtask} className="bg-danger hover:bg-danger/90 text-white">
                    Hapus Data
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSubtask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nama Sub-task / Aktivitas</label>
                  <Input required value={subtaskFormData.activityName} onChange={(e) => setSubtaskFormData({...subtaskFormData, activityName: e.target.value})} placeholder="Contoh: Pemesanan Konsumsi" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Kategori</label>
                    <Input required value={subtaskFormData.category} onChange={(e) => setSubtaskFormData({...subtaskFormData, category: e.target.value})} placeholder="Contoh: Logistik" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tenggat Waktu (Due Date)</label>
                    <Input required type="date" value={subtaskFormData.dueDate} onChange={(e) => setSubtaskFormData({...subtaskFormData, dueDate: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">PIC</label>
                    <Input required value={subtaskFormData.pic} onChange={(e) => setSubtaskFormData({...subtaskFormData, pic: e.target.value})} placeholder="Nama Penanggung Jawab" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Tim</label>
                    <Input required value={subtaskFormData.team} onChange={(e) => setSubtaskFormData({...subtaskFormData, team: e.target.value})} placeholder="Contoh: HR, GA, Safety" />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Prioritas</label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={subtaskFormData.priority} 
                      onChange={(e) => setSubtaskFormData({...subtaskFormData, priority: e.target.value})}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Link Output</label>
                    <Input value={subtaskFormData.linkOutput} onChange={(e) => setSubtaskFormData({...subtaskFormData, linkOutput: e.target.value})} placeholder="Contoh: https://link-dokumen.com" />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-text-secondary">Catatan (Note)</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky"
                      value={subtaskFormData.note} 
                      onChange={(e) => setSubtaskFormData({...subtaskFormData, note: e.target.value})} 
                      placeholder="Tambahkan catatan khusus di sini..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsSubtaskModalOpen(false)}>Batal</Button>
                  <Button type="submit" className="bg-sky hover:bg-sky/90 text-surface">Simpan Sub-task</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Task / Aktivitas Persiapan
              </h3>
              <Button variant="ghost" size="icon" onClick={closeImportTaskModal}><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm">
              {[["upload", "Upload File"], ["preview", "Preview Data"], ["result", "Hasil Import"]].map(([step, label], i, arr) => (
                <React.Fragment key={step}>
                  <span className={`font-medium ${importTaskStep === step ? "text-sky" : importTaskStep === "result" || (importTaskStep === "preview" && step === "upload") ? "text-text-secondary" : "text-text-secondary/40"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-text-secondary/40" />}
                </React.Fragment>
              ))}
            </div>

            {importTaskStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTaskFileSelect(f); e.target.value = ""; }} />

                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors ${isDraggingTask ? "border-sky bg-sky/5" : "border-border hover:border-sky/50 hover:bg-muted/30"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingTask(true); }}
                  onDragLeave={() => setIsDraggingTask(false)}
                  onDrop={handleTaskDrop}
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
                    {TASK_CSV_HEADERS.map((h) => (
                      <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="gap-2 w-fit text-sky border-sky/30 hover:bg-sky/5" onClick={downloadTaskTemplate}>
                  <FileSpreadsheet className="h-4 w-4" /> Download Template Excel
                </Button>
              </div>
            )}

            {importTaskStep === "preview" && (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importTaskFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" />{validTaskImportCount} valid</span>
                    {invalidTaskImportCount > 0 && (
                      <span className="flex items-center gap-1 text-danger font-medium"><AlertCircle className="h-4 w-4" />{invalidTaskImportCount} error</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportTaskStep("upload"); setImportTaskRows([]); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="overflow-auto flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>PIC</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importTaskRows.map((row, i) => (
                        <TableRow key={i} className={row._errors.length > 0 ? "bg-danger/5" : ""}>
                          <TableCell className="text-text-secondary text-xs">{i + 1}</TableCell>
                          <TableCell className="font-medium text-xs">{row.activityName || <span className="text-danger italic">kosong</span>}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.dueDate}</TableCell>
                          <TableCell>{getPriorityBadge(row.priority)}</TableCell>
                          <TableCell>{row.pic}</TableCell>
                          <TableCell>{row.team}</TableCell>
                          <TableCell>
                            {row._errors.length === 0
                              ? <Badge className="bg-success/10 text-success border-success/20 text-xs">Valid</Badge>
                              : <Badge className="bg-danger/10 text-danger border-danger/20 text-xs">Error</Badge>
                            }
                          </TableCell>
                          <TableCell className="text-xs text-danger">{row._errors.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {invalidTaskImportCount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Baris dengan error akan dilewati. Hanya <strong>{validTaskImportCount} baris valid</strong> yang akan diimport.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t mt-2">
                  <Button variant="outline" onClick={closeImportTaskModal}>Batal</Button>
                  <Button
                    className="bg-sky hover:bg-sky/90 text-white gap-2"
                    disabled={validTaskImportCount === 0 || importingTask}
                    onClick={handleConfirmImportTask}
                  >
                    {importingTask ? "Mengimport..." : `Import ${validTaskImportCount} Task`}
                  </Button>
                </div>
              </div>
            )}

            {importTaskStep === "result" && importTaskResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${importTaskResult.failed.length === 0 ? "bg-success/10" : "bg-warning/10"}`}>
                  <CheckCircle2 className={`h-8 w-8 ${importTaskResult.failed.length === 0 ? "text-success" : "text-warning"}`} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    <strong className="text-success">{importTaskResult.successCount} task</strong> berhasil ditambahkan
                    {importTaskResult.failed.length > 0 && (
                      <>, <strong className="text-danger">{importTaskResult.failed.length} baris dilewati</strong></>
                    )}
                  </p>
                </div>

                {importTaskResult.failed.length > 0 && (
                  <div className="w-full bg-danger/5 border border-danger/20 rounded-lg p-4 text-sm mt-4">
                    <p className="font-medium text-danger mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Data yang dilewati:
                    </p>
                    <ul className="space-y-1 max-h-[150px] overflow-auto">
                      {importTaskResult.failed.map((f, i) => (
                        <li key={i} className="text-text-secondary">
                          <span className="font-medium text-navy">{f.name || "(Kosong)"}</span>: {f.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="bg-sky hover:bg-sky/90 text-white mt-4" onClick={closeImportTaskModal}>
                  Tutup & Kembali
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
