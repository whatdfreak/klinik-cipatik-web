"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { BookingInfo } from "./types";

interface SuccessTicketProps {
  bookingInfo: BookingInfo | null;
  onReset: () => void;
}

export default function SuccessTicket({ bookingInfo, onReset }: SuccessTicketProps) {
  return (
    <motion.div
      key="success-ticket"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center text-center py-4"
    >
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservasi Berhasil!</h2>
      <p className="text-slate-600 mb-6 text-sm max-w-xs mx-auto">
        <strong className="text-slate-900">{bookingInfo?.nama}</strong>, tiket otomatis tersimpan di perangkat ini.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-sm p-6 mb-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-500"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kode Check-in</p>
        <div className="bg-white border border-slate-200 py-4 px-6 rounded-xl inline-block mb-5 shadow-inner">
          <p className="text-4xl font-mono font-black text-slate-900 tracking-[0.15em]">{bookingInfo?.kode}</p>
        </div>
        <div className="space-y-3 text-left border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Tanggal:</span>
            <span className="font-bold text-slate-800">{bookingInfo?.tanggal ? new Date(bookingInfo.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Poli / Sesi:</span>
            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">{bookingInfo?.poli} ({bookingInfo?.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button onClick={onReset} className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors focus:ring-4 focus:ring-slate-200">
          Daftar Lagi
        </button>
        <Link href="/" className="flex-1 flex items-center justify-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-500 transition-colors shadow-md">
          Selesai
        </Link>
      </div>
    </motion.div>
  );
}
