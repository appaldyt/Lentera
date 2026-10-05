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

  // Group answers by evaluator
  const groupedAnswers = result.answers.reduce((acc: any, curr: any) => {
    const key = `${curr.evaluatorNik}_${curr.evaluatorName}_${curr.role}`;
    if (!acc[key]) acc[key] = { evaluatorName: curr.evaluatorName, evaluatorNik: curr.evaluatorNik, role: curr.role, answers: [] };
    acc[key].answers.push(curr);
    return acc;
  }, {});

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
               <p className="text-sm text-gray-600">
                 {result.is360 ? "Rata-rata berbobot dari seluruh penilai" : "Rata-rata dari kriteria penilaian (Skala 1-5)"}
               </p>
             </div>
             <div className="text-right">
               <span className="text-3xl font-bold text-sky-700">{result.score.toFixed(1)}</span>
               <span className="text-gray-500"> / 5.0</span>
             </div>
           </div>
           
           {result.is360 && result.breakdown && (
             <div className="mt-4 pt-4 border-t border-gray-200">
               <p className="font-medium text-sm mb-2 text-gray-600">Rincian Penilaian (360°):</p>
               <div className="grid grid-cols-1 gap-2">
                 {result.breakdown.map((b, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white p-2 border border-gray-200 rounded text-sm">
                     <div>
                       <span className="font-semibold">{b.role === "ATASAN" ? "Atasan" : b.role === "REKAN" ? "Rekan Kerja" : "Bawahan"}</span>
                       <span className="text-gray-500 text-xs ml-2">(Bobot: {b.weight}%) - {b.evaluatorName || "-"}</span>
                     </div>
                     <div>
                       <span className="font-bold">{b.score.toFixed(1)}</span>
                       <span className="text-xs text-gray-500 ml-2">Kontribusi: +{b.weightedScore.toFixed(2)}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
             <p className="font-semibold">Status Penilaian</p>
             <p className="font-bold text-lg">{result.status}</p>
           </div>
        </div>

        {result.answers && result.answers.length > 0 && (
          <div>
            <h3 className="font-bold text-lg border-b border-gray-200 pb-2 mb-4">Detail Penilaian per Evaluator</h3>
            <div className="space-y-8 mb-8">
              {Object.values(groupedAnswers).map((group: any, gIdx) => {
                const evaluatorFeedback = group.answers.find((a: any) => a.questionType === 'RATING')?.notes;
                return (
                  <div key={gIdx} className="space-y-3">
                    <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-2 mb-4">
                      <span className="font-bold text-lg text-gray-800">
                        {group.evaluatorNik && group.evaluatorNik !== "-" ? `${group.evaluatorNik} - ` : ""}{group.evaluatorName}
                      </span>
                      {result.is360 && group.role && (
                        <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded border border-sky-200 font-semibold">
                          {group.role === "ATASAN" ? "Atasan" : group.role === "REKAN" ? "Rekan Kerja" : "Bawahan"}
                        </span>
                      )}
                    </div>

                    {group.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 p-4 rounded bg-white border-l-4 border-l-sky-500">
                        <div className={`flex ${ans.questionType === 'ESSAY' ? 'flex-col' : 'justify-between items-start'} gap-4`}>
                          <div>
                            <p className="font-medium text-gray-900">{ans.questionTitle}</p>
                            <p className="text-sm text-gray-600 mt-1">{ans.questionText}</p>
                          </div>
                          {ans.questionType === 'ESSAY' ? (
                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 w-full border border-gray-200 mt-2">
                              {ans.notes || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
                            </div>
                          ) : (
                            <div className="font-bold bg-sky-50 text-sky-800 px-3 py-1 rounded border border-sky-100 whitespace-nowrap">
                              Skor: {ans.score}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-4 border border-gray-200 bg-gray-50 rounded">
                      <p className="text-sm font-bold mb-2">Feedback & Rekomendasi Keseluruhan</p>
                      <div className="text-sm text-gray-700">
                        {evaluatorFeedback ? (
                          evaluatorFeedback.split('\n').map((line: string, i: number) => (
                            <span key={i}>{line}<br /></span>
                          ))
                        ) : (
                          <span className="italic text-gray-400">"Tidak ada catatan."</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-16 pt-8 text-center text-sm text-gray-400">
          <p>Dokumen ini dihasilkan secara otomatis oleh Sistem Lentera.</p>
        </div>
      </div>
    </div>
  );
}
