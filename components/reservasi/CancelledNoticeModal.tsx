"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { BookingInfo } from "./types";

interface CancelledNoticeModalProps {
  notices: BookingInfo[];
  onDismiss: () => void;
}

export default function CancelledNoticeModal({ notices, onDismiss }: CancelledNoticeModalProps) {
  return (
    <AnimatePresence>
      {notices.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="px-6 pt-5 pb-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="font-bold text-slate-900 text-base leading-tight">Pemberitahuan Reservasi</p>
                <p className="text-amber-600 text-xs font-semibold mt-0.5">Dari Klinik Pratama Cipatik</p>
              </div>
              <button onClick={onDismiss} aria-label="Tutup pemberitahuan" className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors -mr-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <p className="text-slate-600 text-sm leading-relaxed">
                Mohon maaf atas ketidaknyamanannya. Reservasi berikut telah <span className="font-semibold text-slate-800">dibatalkan oleh pihak klinik</span>. Anda dapat melakukan pendaftaran ulang kapan saja.
              </p>
              <div className="space-y-2.5 mt-4">
                {notices.map(ticket => (
                  <div key={ticket.kode} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                        {ticket.kode}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Dibatalkan
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{ticket.poli}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{ticket.sesi}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{ticket.tanggal}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Jika ada pertanyaan, silakan hubungi klinik langsung melalui WhatsApp atau telepon.
              </p>
            </div>
            <div className="px-6 pt-4 pb-6 flex gap-3">
              <button onClick={onDismiss} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all">
                Tutup
              </button>
              <button onClick={onDismiss} className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-lg shadow-teal-600/20">
                Daftar Ulang
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
