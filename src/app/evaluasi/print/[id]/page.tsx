import { getEvaluationResultById } from "@/actions/evaluation-results";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import PrintComponent from "./print-component";

export default async function PrintEvaluationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const session = await getSession();
  if (!session) {
    redirect("/evaluasi/login");
  }

  const result = await getEvaluationResultById(params.id);
  
  if (!result) {
    return <div className="p-8 font-sans">Data evaluasi tidak ditemukan.</div>;
  }

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <PrintComponent />
      
      {/* Hide print button when printing using standard CSS, but this page is meant only for print anyway */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-4xl mx-auto p-8" id="print-area">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
           <div>
             <h1 className="text-2xl font-bold">Laporan Evaluasi Pelatihan</h1>
             <p className="text-gray-600">Evaluasi Pasca-Pelatihan (Implementasi 3 Bulan)</p>
           </div>
           <div className="text-right">
             <h2 className="text-xl font-bold tracking-wider">LENTERA</h2>
             <p className="text-sm text-gray-500">Dicetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 font-medium">Nama Karyawan</p>
            <p className="font-semibold text-lg">{result.employeeName}</p>
            <p className="text-sm text-gray-600">NIK: {result.employeeNik}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Atasan Penilai</p>
            <p className="font-semibold text-lg">{result.evaluatorName}</p>
            <p className="text-sm text-gray-600">NIK: {result.evaluatorNik}</p>
          </div>
          <div className="col-span-2 mt-2">
            <p className="text-sm text-gray-500 font-medium">Pelatihan</p>
            <p className="font-semibold">{result.trainingName}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-200 rounded mb-8">
           <div className="flex justify-between items-center">
             <div>
               <p className="font-semibold">Skor Evaluasi Akhir</p>
               <p className="text-sm text-gray-600">Rata-rata dari kriteria penilaian (Skala 1-5)</p>
             </div>
             <div className="text-right">
               <span className="text-3xl font-bold text-sky-700">{result.score.toFixed(1)}</span>
               <span className="text-gray-500"> / 5.0</span>
             </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
             <p className="font-semibold">Status Penilaian</p>
             <p className="font-bold text-lg">{result.status}</p>
           </div>
        </div>

        <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4">Detail Penilaian per Pertanyaan</h3>
        <div className="space-y-4 mb-8">
          {result.answers?.map((ans, idx) => (
            <div key={idx} className="border border-gray-200 p-4 rounded bg-white">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-gray-900">{ans.questionTitle}</p>
                  <p className="text-sm text-gray-600 mt-1">{ans.questionText}</p>
                </div>
                <div className="font-bold bg-sky-50 text-sky-800 px-3 py-1 rounded border border-sky-100 whitespace-nowrap">
                  Skor: {ans.score}
                </div>
              </div>
              {ans.notes && (
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 border border-gray-100 rounded">
                  <span className="font-medium">Catatan:</span> {ans.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4">Feedback & Rekomendasi Keseluruhan</h3>
        <div className="p-4 border border-gray-200 rounded text-gray-800 bg-white">
          "{result.feedback}"
        </div>
        
        <div className="mt-16 pt-8 text-center text-sm text-gray-400">
          <p>Dokumen ini dihasilkan secara otomatis oleh Sistem Lentera.</p>
        </div>
      </div>
    </div>
  );
}
