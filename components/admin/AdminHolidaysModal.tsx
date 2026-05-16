"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, CalendarDays, Settings, Loader2, Trash2 } from "lucide-react";
import { todayJakarta, fmtDate } from "./types";

interface AdminHolidaysModalProps {
  open: boolean;
  onClose: () => void;
  toast: (type: "success" | "error" | "info", title: string, msg: string) => void;
}

export default function AdminHolidaysModal({ open, onClose, toast }: AdminHolidaysModalProps) {
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [newBDate, setNewBDate] = useState("");
  const [newBEndDate, setNewBEndDate] = useState("");
  const [newBDesc, setNewBDesc] = useState("");
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await fetch('/api/blocked-dates');
      const json = await res.json();
      if (res.ok) setBlockedDates(json.data || []);
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (open) fetchBlockedDates();
  }, [open, fetchBlockedDates]);

  const addBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newBDate) return;
    setLoadingBlocked(true);
    try {
      const dates: string[] = [];
      const start = new Date(newBDate);
      const end = newBEndDate ? new Date(newBEndDate) : new Date(newBDate);
      
      if (end < start) throw new Error("Tanggal akhir tidak boleh sebelum tanggal mulai");

      let current = new Date(start);
      while (current <= end) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        current.setDate(current.getDate() + 1);
      }

      const res = await fetch('/api/blocked-dates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, keterangan: newBDesc || 'Libur' })
      });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error);
      toast("success", "Berhasil", "Hari libur ditambahkan");
      setNewBDate(""); setNewBEndDate(""); setNewBDesc("");
      fetchBlockedDates();
    } catch(err: any) {
      toast("error", "Gagal", err.message);
    } finally { setLoadingBlocked(false); }
  };

  const syncHolidays = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/blocked-dates?action=sync', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast("success", "Tersinkron", `${json.synced} hari libur nasional ditambahkan.`);
      fetchBlockedDates();
    } catch(err: any) {
      toast("error", "Gagal Sinkron", err.message);
    } finally { setSyncing(false); }
  };

  const removeBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/blocked-dates?id=${id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error("Gagal menghapus");
      toast("success", "Berhasil", "Hari libur dihapus");
      fetchBlockedDates();
    } catch(err: any) {
      toast("error", "Gagal", err.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={onClose}/>
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}
            className="relative z-10 bg-white w-full max-w-lg rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2"><Settings className="w-4 h-4 text-teal-400"/> Pengaturan Hari Libur</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Tutup pengaturan"><XCircle className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              <div className="flex gap-2 mb-6">
                <button onClick={syncHolidays} disabled={syncing} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-70 shadow-md">
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin"/> : <CalendarDays className="w-4 h-4"/>}
                  Tarik Libur Nasional
                </button>
              </div>

              <form onSubmit={addBlockedDate} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Input Manual Libur/Cuti</h4>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <input type="date" value={newBDate} onChange={e=>setNewBDate(e.target.value)} required min={todayJakarta()} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-teal-400" title="Tanggal Mulai"/>
                    <span className="text-slate-400 text-sm font-bold">-</span>
                    <input type="date" value={newBEndDate} onChange={e=>setNewBEndDate(e.target.value)} min={newBDate || todayJakarta()} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-teal-400" title="Tanggal Selesai (Opsional)"/>
                  </div>
                  <input type="text" value={newBDesc} onChange={e=>setNewBDesc(e.target.value)} placeholder="Keterangan (misal: Dokter Cuti)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 outline-none focus:border-teal-400"/>
                </div>
                <button type="submit" disabled={loadingBlocked} className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-70">
                  {loadingBlocked ? <Loader2 className="w-4 h-4 animate-spin"/> : "Tambahkan"}
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50"><h4 className="text-sm font-bold text-slate-800">Daftar Tanggal Terblokir</h4></div>
                {blockedDates.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm font-medium">Belum ada hari libur tersimpan.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {blockedDates.map(bd => (
                      <div key={bd.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{fmtDate(bd.tanggal)}</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{bd.keterangan}</p>
                        </div>
                        <button onClick={()=>removeBlockedDate(bd.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus" aria-label="Hapus libur"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
