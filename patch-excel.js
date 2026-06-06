const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/(dashboard)/training/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add XLSX import
if (!content.includes('import * as XLSX')) {
  content = content.replace(
    'import React, { useState, useEffect, use, useRef } from "react";',
    'import React, { useState, useEffect, use, useRef } from "react";\nimport * as XLSX from "xlsx";'
  );
}

// 2. Replace parseCSV with parseExcel
const parseExcelRegex = /function parseCSV[\s\S]*?\}\n\nfunction downloadTemplate\(\) \{[\s\S]*?URL\.revokeObjectURL\(url\);\n\}/;
const newParseExcel = `function parseExcel(buffer: ArrayBuffer, allEmployees: any[]): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

  if (rows.length < 2) return [];

  const dataLines = rows.slice(1);

  return dataLines.map((cols: any[]) => {
    const nik = (cols[0] || "").toString().trim();
    const trainingDate = (cols[1] || "").toString().trim();
    const attendedHoursStr = (cols[2] || "0").toString().trim();
    const attendedHours = Number(attendedHoursStr) || 0;

    const errors: string[] = [];
    if (!nik) errors.push("NIK wajib diisi");
    if (!trainingDate) errors.push("Tanggal Training wajib diisi");

    const emp = allEmployees.find(e => e.nik === nik);
    if (!emp) errors.push("Karyawan dengan NIK tersebut tidak ditemukan");

    return { 
      nik, 
      name: emp?.name || "", 
      department: emp?.division || "", 
      trainingDate, 
      attendedHours, 
      _errors: errors 
    };
  }).filter((row) => row.nik);
}

function downloadTemplate() {
  const wsData = [
    CSV_HEADERS,
    ['IAS-2024-0001', '2026-06-10', 0],
    ['IAS-2024-0002', '2026-06-10', 30],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "template_import_peserta.xlsx");
}`;

content = content.replace(parseExcelRegex, newParseExcel);

// 3. Update handleFileSelect
const handleFileSelectRegex = /const handleFileSelect = \(file: File\) => \{[\s\S]*?reader\.readAsText\(file, "UTF-8"\);\n  \};/;
const newHandleFileSelect = `const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Hanya file .xlsx yang didukung. Gunakan template yang disediakan.");
      return;
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rows = parseExcel(buffer, allEmployees);
      setImportRows(rows);
      setImportStep("preview");
    };
    reader.readAsArrayBuffer(file);
  };`;
content = content.replace(handleFileSelectRegex, newHandleFileSelect);

// 4. Update UI labels
content = content.replace(/accept="\.csv"/g, 'accept=".xlsx"');
content = content.replace(/Hanya file <strong.*?>\.csv<\/strong> yang didukung/, 'Hanya file <strong>.xlsx</strong> yang didukung');
content = content.replace(/<FileSpreadsheet className="h-4 w-4" \/> Download Template CSV/, '<FileSpreadsheet className="h-4 w-4" /> Download Template Excel');
content = content.replace(/<FileSpreadsheet className="h-4 w-4" \/> Import Excel/, '<FileSpreadsheet className="h-4 w-4" /> Import Excel'); // this doesn't change actually

fs.writeFileSync(filePath, content, 'utf8');
console.log('Excel patch applied successfully!');
