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
  CardFooter,
} from "@/components/ui/card";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCriteria, saveCriteria } from "@/actions/evaluation-criteria";
import { useEffect } from "react";

type Criterion = {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
};

const initialCriteria: Criterion[] = [
  { id: "c-1", label: "Lulus", minScore: 4.0, maxScore: 5.0, color: "success" },
  { id: "c-2", label: "Perlu Peningkatan", minScore: 3.0, maxScore: 3.9, color: "warning" },
  { id: "c-3", label: "Tidak Lulus", minScore: 0.0, maxScore: 2.9, color: "danger" },
];

export default function CriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getCriteria();
      // data might be from DB without an id if we just use input format for mock, 
      // but Prisma returns id. So we safely cast it.
      setCriteria(data as Criterion[]);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleAddCriterion = () => {
    const newId = `c-${Date.now()}`;
    setCriteria([
      ...criteria,
      { id: newId, label: "Kategori Baru", minScore: 0, maxScore: 0, color: "slate" },
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleChange = (id: string, field: keyof Criterion, value: string | number) => {
    setCriteria(
      criteria.map((c) => {
        if (c.id === id) {
          if (field === "minScore" || field === "maxScore") {
            const numValue = parseFloat(value as string);
            return { ...c, [field]: isNaN(numValue) ? 0 : numValue };
          }
          return { ...c, [field]: value };
        }
        return c;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCriteria(criteria);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save criteria", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getColorBadge = (color: string, label: string) => {
    switch (color) {
      case "success":
        return <Badge className="bg-success/10 text-success-dark border-success/20">{label}</Badge>;
      case "warning":
        return <Badge className="bg-warning/10 text-warning-dark border-warning/20">{label}</Badge>;
      case "danger":
        return <Badge className="bg-danger/10 text-danger-dark border-danger/20">{label}</Badge>;
      case "sky":
        return <Badge className="bg-sky/10 text-sky-dark border-sky/20">{label}</Badge>;
      case "navy":
        return <Badge className="bg-navy/10 text-navy border-navy/20">{label}</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 bg-slate-100">{label}</Badge>;
    }
  };

  // Simple validation for overlaps
  const checkOverlaps = () => {
    // A robust overlap check would be more complex, this is a basic warning trigger
    // Just checking if any min is greater than max for now
    return criteria.some((c) => c.minScore > c.maxScore);
  };

  const hasErrors = checkOverlaps();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Kriteria Kelulusan</h1>
        <p className="mt-2 text-text-secondary">
          Atur rentang nilai dan kategori kelulusan untuk hasil evaluasi pasca-pelatihan. Rentang nilai (skor) adalah 1.0 - 5.0.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Kelulusan</CardTitle>
          <CardDescription>
            Tambahkan atau ubah label kategori kelulusan beserta rentang nilai batas bawah (Min) dan batas atas (Max).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasErrors && (
            <div className="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-danger-dark">Perhatian</h4>
                <p className="text-xs text-danger-dark/80 mt-1">
                  Terdapat kesalahan pada input rentang nilai (Min melebihi Max). Harap periksa kembali.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-text-secondary uppercase tracking-wider pb-2 border-b border-border px-2">
              <div className="col-span-5 md:col-span-4">Label Kategori</div>
              <div className="col-span-3 md:col-span-2 text-center">Min Score</div>
              <div className="col-span-3 md:col-span-2 text-center">Max Score</div>
              <div className="hidden md:block col-span-3">Warna / Tampilan</div>
              <div className="col-span-1 text-right">Hapus</div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                Memuat kriteria kelulusan...
              </div>
            ) : criteria.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="col-span-5 md:col-span-4">
                  <Input
                    value={c.label}
                    onChange={(e) => handleChange(c.id, "label", e.target.value)}
                    placeholder="Nama Kategori..."
                    className="bg-white"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={c.minScore}
                    onChange={(e) => handleChange(c.id, "minScore", e.target.value)}
                    className="bg-white text-center"
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={c.maxScore}
                    onChange={(e) => handleChange(c.id, "maxScore", e.target.value)}
                    className="bg-white text-center"
                  />
                </div>
                <div className="hidden md:flex col-span-3 items-center gap-3">
                  <Select
                    value={c.color}
                    onValueChange={(value) => handleChange(c.id, "color", value)}
                  >
                    <SelectTrigger className="w-[130px] bg-white">
                      <SelectValue placeholder="Warna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Hijau (Success)</SelectItem>
                      <SelectItem value="warning">Kuning (Warning)</SelectItem>
                      <SelectItem value="danger">Merah (Danger)</SelectItem>
                      <SelectItem value="sky">Biru Muda (Sky)</SelectItem>
                      <SelectItem value="navy">Biru Gelap (Navy)</SelectItem>
                      <SelectItem value="slate">Abu-abu (Slate)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-w-[100px]">
                    {getColorBadge(c.color, c.label)}
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary hover:text-danger hover:bg-danger/10"
                    onClick={() => handleRemoveCriterion(c.id)}
                    disabled={criteria.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 border-dashed border-2 border-slate-300 text-text-secondary hover:text-navy hover:border-navy hover:bg-slate-50 w-full"
            onClick={handleAddCriterion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori Kelulusan
          </Button>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-border flex justify-between items-center py-4">
          <p className="text-xs text-text-secondary">
            Perubahan ini akan langsung mempengaruhi pelabelan status pada menu Hasil Evaluasi.
          </p>
          <Button
            onClick={handleSave}
            disabled={isSaving || hasErrors}
            className={`min-w-[140px] transition-all ${
              saveSuccess ? "bg-success hover:bg-success-dark text-white" : "bg-navy hover:bg-navy-dark text-white"
            }`}
          >
            {isSaving ? "Menyimpan..." : saveSuccess ? "Tersimpan!" : (
              <>
                <Save className="h-4 w-4 mr-2" /> Simpan Kriteria
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
