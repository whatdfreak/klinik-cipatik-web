"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCcw, Loader2, Search, UserCheck, AlertCircle } from "lucide-react";
import { Appointment, AppointmentStatus, STATUS_STYLE, todayJakarta, fmtDate, fmtTime } from "./types";

interface AdminTableProps {
  filtered: Appointment[];
  loading: boolean;
  fetchError: string | null;
  updatingId: string | null;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus, kode: string) => void;
  onAskConfirm: (title: string, message: string, label: string, color: string, onOk: () => void) => void;
}

export default function AdminTable({ filtered, loading, fetchError, updatingId, onRefresh, onUpdateStatus, onAskConfirm }: AdminTableProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
      {fetchError && (
        <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 bg-rose-50 text-rose-700 border-b border-rose-100">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"/>
          <p className="text-xs sm:text-sm font-bold flex-1">{fetchError}</p>
          <button onClick={onRefresh} className="text-[11px] font-black uppercase tracking-wider underline hover:text-rose-900 shrink-0">Coba Lagi</button>
        </div>
      )}

      {/* Scroll hint for mobile */}
      {!loading && filtered.length > 0 && (
        <div className="sm:hidden px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>← Geser tabel →</span>
        </div>
      )}

      <div className="relative">
        {/* Gradient scroll indicators (mobile) */}
        <div className="sm:hidden absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"/>

        <div className="overflow-x-auto min-h-[300px] sm:min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-slate-400">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mb-3 sm:mb-4"/>
              <p className="font-bold text-xs sm:text-sm">Memuat Data...</p>
            </div>
          ) : filtered.length===0 ? (
            <div className="py-16 sm:py-24 text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-slate-100">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300"/>
              </div>
              <p className="text-slate-600 font-black text-base sm:text-lg">Tidak ada data</p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Data antrean tidak ditemukan untuk filter ini.</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  {["Kode Booking", "Tanggal Hadir", "Nama & No. HP", "Poli & Sesi", "Status", "Waktu Daftar", "Aksi"].map(h => (
                    <th key={h} className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                  {filtered.map(apt => {
                    const [poli,sesi] = apt.poli_tujuan.split(" - ");
                    const isExpired = new Date(apt.tanggal_kunjungan) < new Date(todayJakarta()) && apt.status === "Menunggu";
                    const displayStatus = isExpired ? "Terlewat" : apt.status;
                    const st = isExpired
                      ? { badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", text: "text-rose-700" }
                      : STATUS_STYLE[apt.status] ?? STATUS_STYLE.Menunggu;
                    const busy = updatingId===apt.id;

                    return (
                      <motion.tr key={apt.id} layout initial={{opacity:0}} animate={{opacity:1}}
                        className={`transition-colors hover:bg-slate-50/50 ${isExpired ? 'bg-rose-50/40' : ''}`}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] border font-mono text-[11px] sm:text-xs font-black ${isExpired?'bg-rose-100 border-rose-200 text-rose-800':'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            {apt.kode_booking}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-[12px] sm:text-[13px] font-bold text-slate-700">{fmtDate(apt.tanggal_kunjungan)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <p className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight">{apt.nama_pasien}</p>
                          <p className="text-[11px] sm:text-xs font-bold text-blue-500 mt-0.5 sm:mt-1">{apt.no_hp}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-[12px] sm:text-[13px] font-black text-slate-800">{poli}</p>
                          <span className={`inline-flex mt-1 sm:mt-1.5 items-center px-2 py-0.5 rounded-md text-[10px] font-black ${sesi==="Pagi"?"bg-orange-50 text-orange-600":"bg-indigo-50 text-indigo-600"}`}>
                            {sesi||"Pagi"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-[11px] font-black ${st.badge} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/> {displayStatus}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <p className="text-[11px] sm:text-[12px] font-bold text-slate-500">{fmtTime(apt.created_at)}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {busy ? <div className="w-8 h-8 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-400"/></div> : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {apt.status==="Menunggu" && (
                                <button onClick={()=>onUpdateStatus(apt.id,"Hadir",apt.kode_booking)} title="Tandai Hadir"
                                  className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                  <UserCheck className="w-4 h-4"/>
                                </button>
                              )}
                              {(apt.status==="Menunggu"||apt.status==="Hadir") && (
                                <button onClick={()=>onUpdateStatus(apt.id,"Selesai",apt.kode_booking)} title="Tandai Selesai"
                                  className="w-8 h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                  <CheckCircle2 className="w-4 h-4"/>
                                </button>
                              )}
                              {apt.status!=="Batal"&&apt.status!=="Selesai" && (
                                <button title="Batalkan Reservasi" onClick={()=>onAskConfirm(
                                  "Batalkan Reservasi",
                                  `Batalkan kode ${apt.kode_booking} atas nama ${apt.nama_pasien}?`,
                                  "Ya, Batalkan","bg-rose-600 hover:bg-rose-700",
                                  ()=>onUpdateStatus(apt.id,"Batal",apt.kode_booking)
                                )} className="w-8 h-8 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                  <XCircle className="w-4 h-4"/>
                                </button>
                              )}
                              {(apt.status==="Selesai"||apt.status==="Batal") && (
                                <button onClick={()=>onUpdateStatus(apt.id,"Menunggu",apt.kode_booking)} title="Kembalikan ke Antrian"
                                  className="w-8 h-8 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                  <RefreshCcw className="w-3.5 h-3.5"/>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
