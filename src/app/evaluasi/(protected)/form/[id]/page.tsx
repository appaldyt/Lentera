"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, CheckCircle2, Star } from "lucide-react";

import { getEvaluationFormData, submitEvaluationResponse } from "@/actions/evaluation-form";
import { Loader2 } from "lucide-react";

export default function EvaluationFormPage() {
  const params = useParams() as { id: string };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!params?.id) return;
      const res = await getEvaluationFormData(params.id);
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      setFormData(res);
      if (res.existingResponse) {
        const initialScores: Record<string, number> = {};
        res.existingResponse.answers.forEach((ans: any) => {
          initialScores[ans.questionId] = ans.score;
        });
        setScores(initialScores);
        if (res.existingResponse.answers.length > 0) {
          setFeedback(res.existingResponse.answers[0].notes || "");
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Check if all questions are answered
    if (Object.keys(scores).length < formData.questions.length) {
      alert("Mohon isi semua penilaian kriteria.");
      return;
    }

    setSubmitting(true);

    const answers = Object.entries(scores).map(([qId, score]) => ({
      questionId: qId,
      score: score
    }));

    const res = await submitEvaluationResponse({
      participantId: params.id,
      evaluatorId: formData.evaluatorId,
      answers: answers,
      feedback: feedback
    });

    setSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
    } else {
      alert(res.error || "Gagal mengirim evaluasi");
    }
  };

  const calculateAverageRating = () => {
    if (Object.keys(scores).length === 0) return "0.0";
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    return (total / formData.questions.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= Math.round(rating) ? "fill-warning text-warning" : "text-slate-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-navy">Evaluasi Berhasil Dikirim!</h2>
          <p className="text-text-secondary max-w-md">
            Terima kasih atas penilaian Anda untuk {formData?.participant?.name}. Evaluasi ini sangat berarti untuk pengembangan karir karyawan dan mutu training perusahaan.
          </p>
        </div>
        <Link href="/evaluasi/dashboard">
          <Button className="mt-4 bg-navy hover:bg-navy-dark text-surface">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sky" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-danger">Tidak Dapat Memuat Form</h2>
        <p className="text-text-secondary text-center max-w-md">{errorMsg}</p>
        <Link href="/evaluasi/dashboard">
          <Button variant="outline" className="mt-4">
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tombol Kembali */}
      <Link href="/evaluasi/dashboard" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-navy transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-navy">Form Evaluasi Pasca-Pelatihan</h1>
        <p className="text-text-secondary">
          Mohon isi evaluasi ini dengan objektif berdasarkan pengamatan kinerja karyawan selama 3 bulan terakhir.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b border-border/40">
          <CardTitle className="text-lg">Informasi Karyawan & Pelatihan</CardTitle>
          <CardDescription>
            ID Evaluasi: {params.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-text-secondary">Nama Karyawan</span>
              <span className="font-semibold text-navy">{formData.participant.name}</span>
            </div>
            <div>
              <span className="block text-text-secondary">Departemen / Divisi</span>
              <span className="font-semibold text-navy">{formData.participant.department}</span>
            </div>
            <div>
              <span className="block text-text-secondary">Nama Pelatihan</span>
              <span className="font-semibold text-navy">{formData.participant.training?.name}</span>
            </div>
            <div>
              <span className="block text-text-secondary">Tanggal Pelaksanaan</span>
              <span className="font-semibold text-navy">{formData.participant.training?.startDate ? new Date(formData.participant.training.startDate).toLocaleDateString('id-ID') : '-'} s/d {formData.participant.training?.endDate ? new Date(formData.participant.training.endDate).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Penilaian Efektivitas</CardTitle>
            <CardDescription>
              Skala 1 (Sangat Kurang) hingga 5 (Sangat Baik). Wajib diisi semua.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {formData.questions.length === 0 ? (
              <div className="text-center p-8 border rounded-lg border-dashed bg-slate-50 text-text-secondary">
                Belum ada kriteria pertanyaan yang didaftarkan oleh admin. Hubungi Admin/HR.
              </div>
            ) : (
              formData.questions.map((q: any, idx: number) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base text-navy font-semibold">{idx + 1}. {q.title}</Label>
                  <p className="text-sm text-text-secondary mb-3">{q.text}</p>
                  <div className="flex justify-center gap-6 sm:gap-8 py-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label key={`q-${q.id}-${val}`} className="flex flex-col items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={val}
                          required
                          checked={scores[q.id] === val}
                          className="h-5 w-5 text-sky focus:ring-sky"
                          onChange={() => setScores({ ...scores, [q.id]: val })}
                        />
                        <span className="text-sm font-medium">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Total Score -> Rating */}
            <div className="flex items-center justify-between p-4 bg-sky/5 rounded-lg border border-sky/20 mt-8">
              <div>
                <Label className="text-base text-navy font-semibold">Rating Akhir Evaluasi</Label>
                <p className="text-sm text-text-secondary">Rata-rata dari kelima kriteria di atas (Skala 1-5)</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-sky">
                  {calculateAverageRating()} <span className="text-lg text-text-secondary font-medium">/ 5.0</span>
                </div>
                {renderStars(parseFloat(calculateAverageRating()))}
              </div>
            </div>

            {/* Feedback Bebas */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <Label htmlFor="feedback" className="text-base text-navy font-semibold">Komentar & Saran (Opsional)</Label>
              <p className="text-sm text-text-secondary">Adakah catatan khusus terkait performa karyawan atau saran untuk program pelatihan ini di masa depan?</p>
              <Textarea
                id="feedback"
                placeholder="Tuliskan komentar Anda di sini..."
                className="min-h-[120px] resize-y"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border/40 pt-6">
            <Link href="/evaluasi/dashboard">
              <Button type="button" variant="outline" className="border-border">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={submitting || formData.questions.length === 0} className="bg-navy hover:bg-navy-dark text-surface gap-2">
              {submitting ? "Menyimpan..." : (
                <>
                  <Send className="h-4 w-4" />
                  Kirim Evaluasi
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
