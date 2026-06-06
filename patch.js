const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(dashboard)/training/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
content = content.replace(
  'import React, { useState, useEffect, use } from "react";',
  'import React, { useState, useEffect, use, useRef } from "react";'
);
content = content.replace(
  'import { ArrowLeft, Plus, FileSpreadsheet, MapPin, Calendar as CalendarIcon, Clock, Users, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";',
  'import { ArrowLeft, Plus, FileSpreadsheet, MapPin, Calendar as CalendarIcon, Clock, Users, MoreHorizontal, Pencil, Trash2, X, Upload, FileUp, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";'
);

// 2. Add Interfaces and CSV logic before TrainingDetailPage
const csvLogic = `
interface ImportRow {
  nik: string;
  name: string;
  department: string;
  trainingDate: string;
  attendedHours: number;
  _errors: string[];
}

const CSV_HEADERS = ["NIK", "Nama Karyawan", "Divisi", "Tanggal Training", "Jam Kehadiran"];

function parseCSV(text: string): ImportRow[] {
  const lines = text.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n").trim().split("\\n");
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const cols: string[] = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const [nik = "", name = "", department = "", trainingDate = "", attendedHoursStr = "0"] = cols;
    const attendedHours = Number(attendedHoursStr) || 0;

    const errors: string[] = [];
    if (!nik) errors.push("NIK wajib diisi");
    if (!name) errors.push("Nama wajib diisi");
    if (!department) errors.push("Divisi wajib diisi");
    if (!trainingDate) errors.push("Tanggal Training wajib diisi");

    return { nik, name, department, trainingDate, attendedHours, _errors: errors };
  }).filter((row) => row.nik || row.name);
}

function downloadTemplate() {
  const rows = [
    CSV_HEADERS.join(","),
    'IAS-2024-0001,Budi Santoso,Operations,2026-06-10,0',
    'IAS-2024-0002,Karyawan Dua,Finance,2026-06-10,30',
  ].join("\\n");

  const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_import_peserta.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TrainingDetailPage`;

content = content.replace('export default function TrainingDetailPage', csvLogic);

// 3. Add Import State inside TrainingDetailPage
const stateLogic = `  // Add form state
  const [searchNik, setSearchNik] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{ nik: string; name: string; department: string } | null>(null);
  const [trainingDateInput, setTrainingDateInput] = useState("");
  const [editAttendedHours, setEditAttendedHours] = useState<number | string>(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload");
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] = useState<{ success: any[]; failed: { nik: string; reason: string }[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
`;

content = content.replace(/  \/\/ Add form state([\s\S]*?)  const \[errorMsg, setErrorMsg\] = useState\(""\);/, stateLogic.trimEnd());

// 4. Add Import Handlers before return
const handlerLogic = `
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Hanya file .csv yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setImportRows(rows);
      setImportStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r._errors.length === 0);
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch(\`/api/trainings/\${id}/participants/bulk\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: validRows }),
      });
      const result = await res.json();
      setImportResult(result);
      setImportStep("result");
      const refreshed = await fetch(\`/api/trainings/\${id}\`).then((r) => r.json());
      if (refreshed.training) {
        setParticipants(refreshed.training.participants ?? []);
      }
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportStep("upload");
    setImportRows([]);
    setImportFileName("");
    setImportResult(null);
  };

  const validImportCount = importRows.filter((r) => r._errors.length === 0).length;
  const invalidImportCount = importRows.filter((r) => r._errors.length > 0).length;

  if (loading) {`;

content = content.replace('  if (loading) {', handlerLogic.trimStart());


// 5. Update the button
content = content.replace(
  '<Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success">',
  '<Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10 hover:text-success" onClick={() => setIsImportModalOpen(true)}>'
);


// 6. Add the Modal JSX at the end, right before the last closing </div> tag
const modalJSX = `
      {/* ── Import Modal ──────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileUp className="h-5 w-5 text-sky" /> Import Data Peserta
              </h3>
              <Button variant="ghost" size="icon" onClick={closeImportModal}><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm">
              {[["upload", "Upload File"], ["preview", "Preview Data"], ["result", "Hasil Import"]].map(([step, label], i, arr) => (
                <React.Fragment key={step}>
                  <span className={\`font-medium \${importStep === step ? "text-sky" : importStep === "result" || (importStep === "preview" && step === "upload") ? "text-text-secondary" : "text-text-secondary/40"}\`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-text-secondary/40" />}
                </React.Fragment>
              ))}
            </div>

            {importStep === "upload" && (
              <div className="flex-1 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }} />

                <div
                  className={\`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors \${isDragging ? "border-sky bg-sky/5" : "border-border hover:border-sky/50 hover:bg-muted/30"}\`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-full bg-sky/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-sky" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-navy">Klik untuk upload atau drag & drop</p>
                    <p className="text-sm text-text-secondary mt-1">Hanya file <strong>.csv</strong> yang didukung</p>
                  </div>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-text-secondary space-y-1">
                  <p className="font-medium text-navy text-xs uppercase tracking-wide mb-2">Format kolom yang diperlukan:</p>
                  <div className="flex flex-wrap gap-2">
                    {CSV_HEADERS.map((h) => (
                      <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="gap-2 w-fit text-sky border-sky/30 hover:bg-sky/5" onClick={downloadTemplate}>
                  <FileSpreadsheet className="h-4 w-4" /> Download Template CSV
                </Button>
              </div>
            )}

            {importStep === "preview" && (
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-text-secondary">File: <strong className="text-navy">{importFileName}</strong></span>
                    <span className="flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" />{validImportCount} valid</span>
                    {invalidImportCount > 0 && (
                      <span className="flex items-center gap-1 text-danger font-medium"><AlertCircle className="h-4 w-4" />{invalidImportCount} error</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-sky text-xs" onClick={() => { setImportStep("upload"); setImportRows([]); }}>
                    Ganti File
                  </Button>
                </div>

                <div className="overflow-auto flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jam</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, i) => (
                        <TableRow key={i} className={row._errors.length > 0 ? "bg-danger/5" : ""}>
                          <TableCell className="text-text-secondary text-xs">{i + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{row.nik || <span className="text-danger italic">kosong</span>}</TableCell>
                          <TableCell>{row.name || <span className="text-danger italic">kosong</span>}</TableCell>
                          <TableCell>{row.department}</TableCell>
                          <TableCell>{row.trainingDate}</TableCell>
                          <TableCell>{row.attendedHours}</TableCell>
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

                {invalidImportCount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Baris dengan error akan dilewati. Hanya <strong>{validImportCount} baris valid</strong> yang akan diimport.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" onClick={closeImportModal}>Batal</Button>
                  <Button
                    className="bg-sky hover:bg-sky/90 text-white gap-2"
                    disabled={validImportCount === 0 || importing}
                    onClick={handleConfirmImport}
                  >
                    {importing ? "Mengimport..." : \`Import \${validImportCount} Peserta\`}
                  </Button>
                </div>
              </div>
            )}

            {importStep === "result" && importResult && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className={\`w-16 h-16 rounded-full flex items-center justify-center \${importResult.failed.length === 0 ? "bg-success/10" : "bg-warning/10"}\`}>
                  <CheckCircle2 className={\`h-8 w-8 \${importResult.failed.length === 0 ? "text-success" : "text-warning"}\`} />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-navy mb-1">Import Selesai</h4>
                  <p className="text-text-secondary text-sm">
                    <strong className="text-success">{importResult.success.length} peserta</strong> berhasil diimport
                    {importResult.failed.length > 0 && (
                      <>, <strong className="text-danger">{importResult.failed.length} gagal</strong></>
                    )}
                  </p>
                </div>

                {importResult.failed.length > 0 && (
                  <div className="w-full bg-danger/5 border border-danger/20 rounded-lg p-4 text-sm">
                    <p className="font-medium text-danger mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Data yang gagal diimport:
                    </p>
                    <ul className="space-y-1">
                      {importResult.failed.map((f, i) => (
                        <li key={i} className="text-text-secondary">
                          NIK <span className="font-mono text-navy">{f.nik}</span>: {f.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="bg-sky hover:bg-sky/90 text-white" onClick={closeImportModal}>
                  Selesai
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\s*  \);\s*}\s*$/, modalJSX);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch applied successfully!');
