"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RefreshCcw, LogOut, Users, CalendarDays,
  Loader2, Search, UserCheck, Clock, Settings, Trash2,
  AlertCircle, ChevronDown, Download, Hospital
} from "lucide-react";

// ── TYPES & CONSTANTS ──────────────────────────────────────────────────────
type AppointmentStatus = "Menunggu" | "Hadir" | "Selesai" | "Batal";
type ToastType = { id: string; type: "success" | "error" | "info"; title: string; msg: string };

interface Appointment {
  id: string; kode_booking: string; nama_pasien: string; no_hp: string;
  poli_tujuan: string; tanggal_kunjungan: string; status: AppointmentStatus; created_at: string;
}

const STATUS_STYLE: Record<AppointmentStatus, { badge: string; dot: string; text: string }> = {
  Menunggu: { badge: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
  Hadir:    { badge: "bg-blue-50 border-blue-200",   dot: "bg-blue-500",  text: "text-blue-700" },
  Selesai:  { badge: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
  Batal:    { badge: "bg-slate-50 border-slate-200", dot: "bg-slate-400", text: "text-slate-600" },
};

const todayJakarta = () => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const fmtDate = (s: string) =>
  new Date(s+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
const fmtTime = (s: string) =>
  new Date(s).toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

// ── STAT CARD ──────────────────────────────────────────────────────────────
function StatCard({label,value,icon:Icon,color}:{label:string;value:number;icon:React.ElementType;color:string}) {
  return (
    <div className="bg-white rounded-[1.25rem] p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5"/>
      </div>
      <div>
        <p className="text-[22px] font-black text-slate-900 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function ToastStack({toasts,dismiss}:{toasts:ToastType[];dismiss:(id:string)=>void}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[340px] pointer-events-none">
      <AnimatePresence>
        {toasts.map(t=>{
          const cfg = t.type==="success"
            ? {bar:"bg-emerald-500",icon:"✅",title:"text-emerald-700",ring:"ring-emerald-100"}
            : t.type==="error"
            ? {bar:"bg-rose-500",icon:"❌",title:"text-rose-700",ring:"ring-rose-100"}
            : {bar:"bg-blue-500",icon:"ℹ️",title:"text-blue-700",ring:"ring-blue-100"};
          return (
            <motion.div key={t.id}
              initial={{opacity:0,x:80,scale:0.95}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:80,scale:0.95}}
              transition={{type:"spring",stiffness:300,damping:28}}
              className={`pointer-events-auto bg-white rounded-2xl shadow-xl ring-1 ${cfg.ring} overflow-hidden`}>
              <div className={`h-1 w-full ${cfg.bar}`}/>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${cfg.title}`}>{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.msg}</p>
                </div>
                <button onClick={()=>dismiss(t.id)} className="text-slate-300 hover:text-slate-500 shrink-0 mt-0.5 transition-colors" aria-label="Tutup notifikasi"><XCircle className="w-4 h-4"/></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── CONFIRM MODAL ──────────────────────────────────────────────────────────
function ConfirmModal({open,title,message,label,color,onOk,onCancel}:{
  open:boolean;title:string;message:string;label:string;color:string;onOk:()=>void;onCancel:()=>void;
}) {
  const [busy,setBusy] = useState(false);
  useEffect(()=>{ if(!open) setBusy(false); },[open]);
  if (!open) return null;
  const isDanger = color.includes("red") || color.includes("rose");
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={()=>!busy&&onCancel()}/>
      <motion.div
        initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        transition={{type:"spring",stiffness:300,damping:30}}
        className="relative z-10 bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden">
        <div className={`h-1.5 w-full ${isDanger?"bg-rose-500":"bg-teal-500"}`}/>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDanger?"bg-rose-50 text-rose-500":"bg-teal-50 text-teal-600"}`}>
              {isDanger ? <AlertCircle className="w-6 h-6"/> : <CheckCircle2 className="w-6 h-6"/>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-1.5">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pt-5 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50">
            Batal
          </button>
          <button onClick={async()=>{ setBusy(true); await Promise.resolve(onOk()); onCancel(); }} disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${color}`}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : label}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string|null>(null);
  const [fetchError, setFetchError] = useState<string|null>(null);
  
  const [startDate, setStartDate] = useState(todayJakarta());
  const [endDate, setEndDate] = useState(todayJakarta());
  
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message:string;label:string;color:string;onOk:()=>void}>({
    open:false,title:"",message:"",label:"Ya",color:"bg-rose-600 hover:bg-rose-700",onOk:()=>{}
  });
  const [currentTime, setCurrentTime] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [newBDate, setNewBDate] = useState("");
  const [newBEndDate, setNewBEndDate] = useState("");
  const [newBDesc, setNewBDesc] = useState("");
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toast = useCallback((type:ToastType["type"],title:string,msg:string)=>{
    const id = Math.random().toString(36).slice(2);
    setToasts(p=>[...p,{id,type,title,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4500);
  },[]);

  const dismiss = useCallback((id:string)=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  const askConfirm = useCallback((title:string,message:string,label:string,color:string,onOk:()=>void)=>{
    setConfirm({open:true,title,message,label,color,onOk});
  },[]);

  const fetchData = useCallback(async()=>{
    setLoading(true); setFetchError(null);
    try {
      const p = new URLSearchParams();
      if (startDate) p.set("startDate",startDate);
      if (endDate) p.set("endDate",endDate);
      const res = await fetch(`/api/admin/appointments?${p}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAppointments(json.data??[]); setLastRefresh(new Date());
    } catch(e:any) {
      setFetchError(e.message); toast("error","Gagal Memuat",e.message);
    } finally { setLoading(false); }
  },[startDate, endDate, statusFilter, toast]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await fetch('/api/blocked-dates');
      const json = await res.json();
      if (res.ok) setBlockedDates(json.data || []);
    } catch(e) {}
  }, []);

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

  useEffect(() => {
    if (showSettings) fetchBlockedDates();
  }, [showSettings, fetchBlockedDates]);

  useEffect(()=>{fetchData();},[fetchData]);

  const updateStatus = useCallback(async(id:string,status:AppointmentStatus,kode:string)=>{
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/update-status",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAppointments(p=>p.map(a=>a.id===id?{...a,status}:a));
      const label:Record<string,string>={Hadir:"Ditandai Hadir",Selesai:"Ditandai Selesai",Batal:"Dibatalkan",Menunggu:"Dikembalikan ke Antrian"};
      toast("success",label[status]??"Berhasil",`${kode} → ${status}`);
    } catch(e:any) { toast("error","Gagal",e.message); }
    finally { setUpdatingId(null); }
  },[toast]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      toast("error", "Gagal Logout", "Terjadi kesalahan koneksi.");
    }
  };

  const filtered = appointments.filter(a=>{
    const matchStatus = statusFilter === "Semua" || a.status === statusFilter;
    const sq = q.toLowerCase();
    const matchSearch = a.nama_pasien.toLowerCase().includes(sq) || 
                        a.kode_booking.toLowerCase().includes(sq) || 
                        a.no_hp.includes(sq);
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.tanggal_kunjungan).getTime();
    const dateB = new Date(b.tanggal_kunjungan).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const exportCSV = useCallback(() => {
    if (filtered.length === 0) {
      toast("info", "Tidak ada data", "Tidak ada data untuk diekspor pada filter ini.");
      return;
    }
    const headers = ["Kode Booking", "Tanggal", "Poli & Sesi", "Nama Pasien", "No HP", "Status", "Waktu Daftar"];
    const rows = filtered.map(a => [
      a.kode_booking, a.tanggal_kunjungan, a.poli_tujuan, `"${a.nama_pasien}"`, `"${a.no_hp}"`, a.status, `"${fmtTime(a.created_at)}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Antrean_Klinik_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filtered, startDate, endDate, toast]);

  const counts = {
    total:appointments.length, 
    menunggu:appointments.filter(a=>a.status==="Menunggu").length,
    hadir:appointments.filter(a=>a.status==="Hadir").length, 
    selesai:appointments.filter(a=>a.status==="Selesai").length,
    batal:appointments.filter(a=>a.status==="Batal").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ToastStack toasts={toasts} dismiss={dismiss}/>
      <ConfirmModal {...confirm} onCancel={()=>setConfirm(p=>({...p,open:false}))}/>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={()=>setShowSettings(false)}/>
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}}
              className="relative z-10 bg-white w-full max-w-lg rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-base flex items-center gap-2"><Settings className="w-4 h-4 text-teal-400"/> Pengaturan Hari Libur</h3>
                <button onClick={()=>setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors" aria-label="Tutup pengaturan"><XCircle className="w-5 h-5"/></button>
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

      {/* TOP HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">Dashboard Admin</h1>
                <p className="text-[11px] font-medium text-teal-400">Klinik Pratama Cipatik</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-semibold">
                 {currentTime}
              </div>
              <button onClick={fetchData} className="text-slate-400 hover:text-white transition-colors" title="Muat Ulang Data" aria-label="Muat Ulang Data">
                 <RefreshCcw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-all">
                 <LogOut className="w-4 h-4"/> <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Antrean" value={counts.total} icon={Users} color="text-slate-600 bg-slate-100"/>
          <StatCard label="Menunggu" value={counts.menunggu} icon={Clock} color="text-amber-500 bg-amber-50"/>
          <StatCard label="Hadir" value={counts.hadir} icon={UserCheck} color="text-blue-500 bg-blue-50"/>
          <StatCard label="Selesai" value={counts.selesai} icon={CheckCircle2} color="text-emerald-500 bg-emerald-50"/>
          <StatCard label="Batal" value={counts.batal} icon={XCircle} color="text-rose-500 bg-rose-50"/>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-[1.5rem] p-3.5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-auto hover:border-teal-300 transition-colors">
            <CalendarDays className="w-4 h-4 text-slate-400"/>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-slate-700 outline-none w-[110px] cursor-pointer"/>
            <span className="text-slate-300 font-bold">-</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-transparent text-[13px] font-bold text-slate-700 outline-none w-[110px] cursor-pointer"/>
          </div>
          
          <div className="relative w-full md:w-auto">
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
              className="w-full md:w-36 pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:border-teal-300 transition-colors">
               <option value="Semua">Semua Status</option>
               <option value="Menunggu">Menunggu</option>
               <option value="Hadir">Hadir</option>
               <option value="Selesai">Selesai</option>
               <option value="Batal">Batal</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-[11px] pointer-events-none"/>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[11px] pointer-events-none"/>
            <input type="text" placeholder="Cari nama, kode, atau HP..." value={q} onChange={e=>setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none hover:border-teal-300 transition-colors placeholder:font-medium placeholder:text-slate-400"/>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button onClick={()=>setShowSettings(true)} className="flex items-center justify-center p-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all" title="Libur/Cuti" aria-label="Pengaturan Libur Cuti">
              <Settings className="w-5 h-5"/>
            </button>
            <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex-1 md:flex-none">
               <Download className="w-4 h-4"/> Export CSV
            </button>
            <span className="text-[12px] font-bold text-slate-400 whitespace-nowrap hidden lg:block mr-2">{filtered.length} data</span>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          
          {fetchError && (
            <div className="p-4 flex items-center gap-3 bg-rose-50 text-rose-700 border-b border-rose-100">
              <AlertCircle className="w-5 h-5 shrink-0"/>
              <p className="text-sm font-bold flex-1">{fetchError}</p>
              <button onClick={fetchData} className="text-[11px] font-black uppercase tracking-wider underline hover:text-rose-900">Coba Lagi</button>
            </div>
          )}

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4"/>
                <p className="font-bold text-sm">Memuat Data...</p>
              </div>
            ) : filtered.length===0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="w-6 h-6 text-slate-300"/>
                </div>
                <p className="text-slate-600 font-black text-lg">Tidak ada data</p>
                <p className="text-slate-400 text-sm mt-1 font-medium">Data antrean tidak ditemukan untuk filter ini.</p>
              </div>
            ) : (
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    {["Kode Booking", "Tanggal Hadir", "Nama & No. HP", "Poli & Sesi", "Status", "Waktu Daftar", "Aksi"].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {filtered.map(apt=>{
                      const [poli,sesi] = apt.poli_tujuan.split(" - ");
                      const isExpired = new Date(apt.tanggal_kunjungan) < new Date(todayJakarta()) && apt.status === "Menunggu";
                      
                      const displayStatus = isExpired ? "Terlewat" : apt.status;
                      const st = isExpired 
                        ? { badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" } 
                        : STATUS_STYLE[apt.status] ?? STATUS_STYLE.Menunggu;
                      
                      const busy = updatingId===apt.id;

                      return (
                        <motion.tr key={apt.id} layout initial={{opacity:0}} animate={{opacity:1}} 
                          className={`transition-colors hover:bg-slate-50/50 ${isExpired ? 'bg-rose-50/40' : ''}`}>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-[10px] border font-mono text-xs font-black ${isExpired?'bg-rose-100 border-rose-200 text-rose-800':'bg-slate-50 border-slate-200 text-slate-800'}`}>
                              {apt.kode_booking}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-[13px] font-bold text-slate-700">{fmtDate(apt.tanggal_kunjungan)}</p>
                          </td>
                          
                          <td className="px-6 py-4">
                            <p className="text-[14px] font-black text-slate-900 leading-tight">{apt.nama_pasien}</p>
                            <p className="text-xs font-bold text-blue-500 mt-1">{apt.no_hp}</p>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-[13px] font-black text-slate-800">{poli}</p>
                            <span className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-[10px] font-black ${sesi==="Pagi"?"bg-orange-50 text-orange-600":"bg-indigo-50 text-indigo-600"}`}>
                              {sesi||"Pagi"}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black ${st.badge} ${st.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/> {displayStatus}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-[12px] font-bold text-slate-500">{fmtTime(apt.created_at)}</p>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {busy ? <div className="w-8 h-8 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-400"/></div> : (
                              <div className="flex items-center gap-2">
                                    {apt.status==="Menunggu" && (
                                      <button onClick={()=>updateStatus(apt.id,"Hadir",apt.kode_booking)} title="Tandai Hadir"
                                        className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                        <UserCheck className="w-4 h-4"/>
                                      </button>
                                    )}
                                    {(apt.status==="Menunggu"||apt.status==="Hadir") && (
                                      <button onClick={()=>updateStatus(apt.id,"Selesai",apt.kode_booking)} title="Tandai Selesai"
                                        className="w-8 h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                        <CheckCircle2 className="w-4 h-4"/>
                                      </button>
                                    )}
                                    {apt.status!=="Batal"&&apt.status!=="Selesai" && (
                                      <button title="Batalkan Reservasi" onClick={()=>askConfirm(
                                        "Batalkan Reservasi",
                                        `Batalkan kode ${apt.kode_booking} atas nama ${apt.nama_pasien}?`,
                                        "Ya, Batalkan","bg-rose-600 hover:bg-rose-700",
                                        ()=>updateStatus(apt.id,"Batal",apt.kode_booking)
                                      )} className="w-8 h-8 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-[10px] flex items-center justify-center transition-colors active:scale-95">
                                        <XCircle className="w-4 h-4"/>
                                      </button>
                                    )}
                                    {(apt.status==="Selesai"||apt.status==="Batal") && (
                                      <button onClick={()=>updateStatus(apt.id,"Menunggu",apt.kode_booking)} title="Kembalikan ke Antrian"
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
    </div>
  );
}
