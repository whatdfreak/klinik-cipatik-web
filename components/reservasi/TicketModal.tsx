"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X, Clock, RefreshCcw, Loader2, AlertCircle, ArrowLeft, Printer } from "lucide-react";
import type { BookingInfo } from "./types";

interface TicketModalProps {
  open: boolean;
  tickets: BookingInfo[];
  maxTickets: number;
  onClose: () => void;
  onRemoveTicket: (kode: string) => void;
  onPrintTicket: (ticket: BookingInfo) => void;
  onRecoverTickets: (nik: string, noHp: string) => Promise<string | null>;
}

export default function TicketModal({ open, tickets, maxTickets, onClose, onRemoveTicket, onPrintTicket, onRecoverTickets }: TicketModalProps) {
  const [showMultiRecovery, setShowMultiRecovery] = useState(false);
  const [recoveryNik, setRecoveryNik] = useState("");
  const [recoveryNoHp, setRecoveryNoHp] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setRecoveryError(null);
    setShowMultiRecovery(false);
  };

  const handleRecover = async () => {
    if (recoveryNik.length !== 16 || !/^\d+$/.test(recoveryNik)) {
      setRecoveryError("NIK harus 16 digit angka."); return;
    }
    if (!/^08[0-9]{7,11}$/.test(recoveryNoHp)) {
      setRecoveryError("No. HP harus diawali '08' dan terdiri dari 9-13 angka."); return;
    }
    setIsRecovering(true);
    setRecoveryError(null);
    const err = await onRecoverTickets(recoveryNik, recoveryNoHp);
    if (err) {
      setRecoveryError(err);
    } else {
      setShowMultiRecovery(false);
      setRecoveryNik("");
      setRecoveryNoHp("");
    }
    setIsRecovering(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pt-20 pb-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-slate-900 px-6 py-5 flex justify-between items-center">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/20 blur-2xl pointer-events-none"></div>
              <h3 className="font-bold text-white flex items-center gap-2 text-lg relative z-10">
                <Ticket className="w-5 h-5 text-teal-400" />
                {tickets.length > 0 && !showMultiRecovery ? `Tiket Saya (${tickets.length}/${maxTickets})` : 'Cari Tiket'}
              </h3>
              <button onClick={handleClose} aria-label="Tutup modal" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto">
              <AnimatePresence mode="wait">
                {tickets.length > 0 && !showMultiRecovery ? (
                  <motion.div key="has-tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4 bg-slate-50">
                    <AnimatePresence>
                      {tickets.map((ticket) => (
                        <motion.div key={ticket.kode} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
                          <div className="bg-teal-500 h-1.5 w-full absolute top-0 left-0"></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KODE CHECK-IN</p>
                                <p className="text-2xl font-black font-mono text-slate-900 tracking-wider mt-1">{ticket.kode}</p>
                              </div>
                              <button type="button" onClick={() => setTicketToDelete(ticket.kode)} className="text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-3 rounded-xl" aria-label={`Hapus tiket ${ticket.kode}`} title="Hapus Tiket">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                              <p className="flex justify-between items-center"><span className="text-slate-500">Nama:</span> <span className="font-bold text-slate-800 truncate max-w-[140px]">{ticket.nama}</span></p>
                              <p className="flex justify-between items-center"><span className="text-slate-500">Tgl:</span> <span className="font-semibold text-slate-800">{new Date(ticket.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                              <p className="flex justify-between items-center"><span className="text-slate-500">Poli/Sesi:</span> <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs border border-teal-100">{ticket.poli} ({ticket.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span></p>
                              <p className="flex justify-between items-center pt-1"><span className="text-slate-500">Status:</span>
                                <span className={`font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border ${ticket.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ticket.status === 'Batal' ? 'bg-rose-50 text-rose-600 border-rose-200' : ticket.status === 'Hadir' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                  {ticket.status || "Menunggu"}
                                </span>
                              </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                              <button type="button" onClick={() => onPrintTicket(ticket)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                                <Printer className="w-3.5 h-3.5" /> Simpan / Cetak PDF
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mt-2">
                      <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 leading-relaxed font-medium">
                        Tunjukkan kode ini kepada resepsionis Klinik pada sesi kedatangan yang Anda pilih.
                      </p>
                    </div>
                    {tickets.length < maxTickets && (
                      <button onClick={() => setShowMultiRecovery(true)} className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Cari Tiket Lain
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="no-tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                    {tickets.length > 0 && showMultiRecovery && (
                      <button onClick={() => setShowMultiRecovery(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Tiket Saya
                      </button>
                    )}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <RefreshCcw className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2">{tickets.length > 0 ? "Cari Tiket Anggota Keluarga" : "Belum ada tiket"}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {tickets.length > 0
                          ? "Anda dapat mencari dan memulihkan beberapa tiket dari NIK yang berbeda untuk anggota keluarga secara bergantian."
                          : "Tiket tersimpan di perangkat ini. Jika Anda pernah mendaftar, gunakan form di bawah untuk memulihkannya."}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">NIK KTP (16 digit)</label>
                        <input type="text" inputMode="numeric" maxLength={16} value={recoveryNik} onChange={e => setRecoveryNik(e.target.value.replace(/\D/g, ''))} placeholder="Contoh: 3204xxxxxxxxxxxx"
                          className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono text-slate-800"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">No. WhatsApp</label>
                        <input type="tel" inputMode="numeric" maxLength={13} value={recoveryNoHp} onChange={e => setRecoveryNoHp(e.target.value.replace(/\D/g, ''))} placeholder="Contoh: 08xxxxxxxxx"
                          className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono text-slate-800"/>
                      </div>
                      <AnimatePresence>
                        {recoveryError && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <p className="text-xs text-red-600 font-medium flex items-start gap-1.5 bg-red-50 border border-red-100 p-3 rounded-xl mt-1">
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="leading-relaxed">{recoveryError}</span>
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button onClick={handleRecover} disabled={isRecovering}
                        className="w-full mt-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-teal-600/20">
                        {isRecovering ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari...</> : 'Cari & Pulihkan Tiket'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete Confirmation Overlay */}
            <AnimatePresence>
              {ticketToDelete && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 text-lg">Sembunyikan Tiket?</h4>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Tiket ini akan dihapus dari perangkat Anda. Pendaftaran Anda di klinik <strong className="text-slate-700">TETAP BERLAKU</strong> dan tidak dibatalkan.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setTicketToDelete(null)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
                        Batal
                      </button>
                      <button onClick={() => { onRemoveTicket(ticketToDelete); setTicketToDelete(null); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                        Ya, Sembunyikan
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
