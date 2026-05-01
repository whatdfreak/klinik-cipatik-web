"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RefreshCcw, LogOut, Users, CalendarDays,
  Shield, Loader2, Search, Eye, EyeOff, UserCheck, Clock,
  AlertCircle, ChevronDown,
} from "lucide-react";

// ── TYPES & CONSTANTS ──────────────────────────────────────────────────────
const ADMIN_PIN = "123456";
type AppointmentStatus = "Menunggu" | "Hadir" | "Selesai" | "Batal";
type ToastType = { id: string; type: "success" | "error" | "info"; title: string; msg: string };

interface Appointment {
  id: string; kode_booking: string; nama_pasien: string; no_hp: string;
  poli_tujuan: string; tanggal_kunjungan: string; status: AppointmentStatus; created_at: string;
}

const STATUS_STYLE: Record<AppointmentStatus, { badge: string; dot: string }> = {
  Menunggu: { badge: "bg-amber-50 text-amber-800 border-amber-200",   dot: "bg-amber-400" },
  Hadir:    { badge: "bg-blue-50 text-blue-800 border-blue-200",       dot: "bg-blue-400" },
  Selesai:  { badge: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-400" },
  Batal:    { badge: "bg-red-50 text-red-800 border-red-200",          dot: "bg-red-400" },
};

const todayJakarta = () => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const fmtDate = (s: string) =>
  new Date(s+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
const fmtTime = (s: string) =>
  new Date(s).toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

// ── LOGIN SCREEN ───────────────────────────────────────────────────────────
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState(""); const [show, setShow] = useState(false);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      if (pin === ADMIN_PIN) { onSuccess(); }
      else { setErr("PIN salah."); setPin(""); setShake(true); setTimeout(() => setShake(false), 500); }
      setLoading(false);
    }, 600);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Klinik Pratama Cipatik</p>
        </div>
        <motion.div animate={shake?{x:[-8,8,-8,8,0]}:{}} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="pin" className="block text-sm font-bold text-slate-700 mb-2">Masukkan PIN Admin</label>
              <div className="relative">
                <input id="pin" type={show?"text":"password"} value={pin} onChange={e=>{setPin(e.target.value);setErr("");}}
                  placeholder="••••••" maxLength={20} autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-12 text-center text-xl font-mono tracking-widest rounded-xl border-2 outline-none transition-colors ${err?"border-red-300":"border-slate-200 focus:border-teal-500"}`} />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-3.5 text-slate-400">
                  {show?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}
                </button>
              </div>
              <AnimatePresence>
                {err && <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5"/>{err}</motion.p>}
              </AnimatePresence>
            </div>
            <button type="submit" disabled={!pin||loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-teal-600/20">
              {loading?<Loader2 className="w-5 h-5 animate-spin"/>:<Shield className="w-5 h-5"/>}
              {loading?"Memverifikasi...":"Masuk ke Dashboard"}
            </button>
          </form>
        </motion.div>
        <p className="text-center text-xs text-slate-400 mt-6">Akses terbatas untuk staf klinik.</p>
      </motion.div>
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────────────────────
function StatCard({label,value,icon:Icon,color}:{label:string;value:number;icon:React.ElementType;color:string}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="w-6 h-6"/></div>
      <div><p className="text-2xl font-black text-slate-900">{value}</p><p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p></div>
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
            ? {bar:"bg-red-500",icon:"❌",title:"text-red-700",ring:"ring-red-100"}
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
                <button onClick={()=>dismiss(t.id)} className="text-slate-300 hover:text-slate-500 shrink-0 mt-0.5 transition-colors"><XCircle className="w-4 h-4"/></button>
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
  const isDanger = color.includes("red");
  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center px-0 sm:px-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={()=>!busy&&onCancel()}/>
      <motion.div
        initial={{opacity:0,y:48}} animate={{opacity:1,y:0}} exit={{opacity:0,y:48}}
        transition={{type:"spring",stiffness:300,damping:30}}
        className="relative z-10 bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* top accent */}
        <div className={`h-1.5 w-full ${isDanger?"bg-gradient-to-r from-red-500 to-rose-500":"bg-gradient-to-r from-teal-500 to-emerald-500"}`}/>
        {/* drag handle mobile */}
        <div className="flex justify-center pt-3 sm:hidden"><div className="w-9 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDanger?"bg-red-50":"bg-teal-50"}`}>
              {isDanger
                ? <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                : <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-1.5">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pt-5 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50">
            Batalkan
          </button>
          <button onClick={async()=>{ setBusy(true); await Promise.resolve(onOk()); onCancel(); }} disabled={busy}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${color}`}>
            {busy ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>Memproses...</> : label}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({onLogout}:{onLogout:()=>void}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string|null>(null);
  const [fetchError, setFetchError] = useState<string|null>(null);
  const [date, setDate] = useState(todayJakarta());
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message:string;label:string;color:string;onOk:()=>void}>({
    open:false,title:"",message:"",label:"Ya",color:"bg-red-600 hover:bg-red-700",onOk:()=>{}
  });

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
      if (date) p.set("date",date);
      if (statusFilter!=="Semua") p.set("status",statusFilter);
      const res = await fetch(`/api/admin/appointments?${p}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAppointments(json.data??[]); setLastRefresh(new Date());
    } catch(e:any) {
      setFetchError(e.message); toast("error","Gagal Memuat",e.message);
    } finally { setLoading(false); }
  },[date,statusFilter,toast]);

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

  const filtered = appointments.filter(a=>{
    const sq=q.toLowerCase();
    return a.nama_pasien.toLowerCase().includes(sq)||a.kode_booking.toLowerCase().includes(sq)||a.no_hp.includes(sq);
  });

  const today = todayJakarta();
  const td = appointments.filter(a=>a.tanggal_kunjungan===today);
  const counts = {
    total:td.length, menunggu:td.filter(a=>a.status==="Menunggu").length,
    hadir:td.filter(a=>a.status==="Hadir").length, selesai:td.filter(a=>a.status==="Selesai").length,
    batal:td.filter(a=>a.status==="Batal").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastStack toasts={toasts} dismiss={dismiss}/>
      <ConfirmModal {...confirm} onCancel={()=>setConfirm(p=>({...p,open:false}))}/>

      {/* NAV */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">Dashboard Admin</h1>
            <p className="text-slate-400 text-xs mt-0.5">Klinik Pratama Cipatik</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && <span className="hidden sm:block text-xs text-slate-400">{lastRefresh.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span>}
          <button onClick={fetchData} disabled={loading} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-50">
            <RefreshCcw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>
          </button>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5"/> Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* STATS */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Antrean Hari Ini" value={counts.total} icon={Users} color="bg-slate-100 text-slate-600"/>
          <StatCard label="Menunggu" value={counts.menunggu} icon={Clock} color="bg-amber-50 text-amber-600"/>
          <StatCard label="Hadir" value={counts.hadir} icon={UserCheck} color="bg-blue-50 text-blue-600"/>
          <StatCard label="Selesai" value={counts.selesai} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600"/>
          <StatCard label="Batal" value={counts.batal} icon={XCircle} color="bg-red-50 text-red-600"/>
        </motion.div>

        {/* FILTER */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <CalendarDays className="w-4 h-4 text-slate-400 shrink-0"/>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer w-full"/>
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 cursor-pointer">
              {["Semua","Menunggu","Hadir","Selesai","Batal"].map(s=><option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none"/>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
            <input type="text" placeholder="Cari nama, kode, atau HP..." value={q} onChange={e=>setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50"/>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} data</span>
        </motion.div>

        {/* TABLE */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {fetchError && (
            <div className="p-5 flex items-center gap-3 bg-red-50 text-red-700 border-b border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0"/>
              <p className="text-sm font-medium flex-1">{fetchError}</p>
              <button onClick={fetchData} className="text-xs font-bold underline">Coba Lagi</button>
            </div>
          )}

          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl"/>)}</div>
          ) : filtered.length===0 ? (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <p className="text-slate-500 font-medium">Belum ada data antrean.</p>
              <p className="text-slate-400 text-sm mt-1">Coba ubah filter tanggal atau status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {["Kode Booking","Tanggal Hadir","Nama & HP","Poli & Sesi","Status","Waktu Daftar","Aksi"].map(h=>(
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {filtered.map(apt=>{
                      const [poli,sesi] = apt.poli_tujuan.split(" - ");
                      const st = STATUS_STYLE[apt.status]??STATUS_STYLE.Menunggu;
                      const busy = updatingId===apt.id;
                      return (
                        <motion.tr key={apt.id} layout initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-black font-mono text-xs bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-800">{apt.kode_booking}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium text-xs">{fmtDate(apt.tanggal_kunjungan)}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-slate-900 leading-tight">{apt.nama_pasien}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{apt.no_hp}</p>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-semibold text-slate-800 text-xs">{poli}</p>
                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${sesi==="Pagi"?"bg-orange-50 text-orange-700":"bg-indigo-50 text-indigo-700"}`}>{sesi??"-"}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <AnimatePresence mode="wait">
                              <motion.span key={apt.status} initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.85,opacity:0}}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`}/>{apt.status}
                              </motion.span>
                            </AnimatePresence>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 text-xs">{fmtTime(apt.created_at)}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {busy ? <Loader2 className="w-5 h-5 animate-spin text-teal-500"/> : (
                              <div className="flex items-center gap-1.5">
                                {apt.status==="Menunggu" && (
                                  <button onClick={()=>updateStatus(apt.id,"Hadir",apt.kode_booking)} title="Tandai Hadir"
                                    className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                                    <UserCheck className="w-4 h-4"/>
                                  </button>
                                )}
                                {(apt.status==="Menunggu"||apt.status==="Hadir") && (
                                  <button onClick={()=>updateStatus(apt.id,"Selesai",apt.kode_booking)} title="Tandai Selesai"
                                    className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center transition-colors">
                                    <CheckCircle2 className="w-4 h-4"/>
                                  </button>
                                )}
                                {apt.status!=="Batal"&&apt.status!=="Selesai" && (
                                  <button title="Batalkan" onClick={()=>askConfirm(
                                    "Batalkan Reservasi",
                                    `Batalkan kode ${apt.kode_booking} atas nama ${apt.nama_pasien}? Pasien bisa daftar ulang setelah dibatalkan.`,
                                    "Ya, Batalkan","bg-red-600 hover:bg-red-700",
                                    ()=>updateStatus(apt.id,"Batal",apt.kode_booking)
                                  )} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors">
                                    <XCircle className="w-4 h-4"/>
                                  </button>
                                )}
                                {(apt.status==="Selesai"||apt.status==="Batal") && (
                                  <button onClick={()=>updateStatus(apt.id,"Menunggu",apt.kode_booking)} title="Kembalikan ke Antrian"
                                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center transition-colors">
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
            </div>
          )}
        </motion.div>

        <p className="text-center text-xs text-slate-400 pb-4">
          ⚠️ Autentikasi PIN sementara — ganti dengan sistem auth proper sebelum go-live.
        </p>
      </main>
    </div>
  );
}

// ── PAGE ROOT ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  return (
    <AnimatePresence mode="wait">
      {!auth ? (
        <motion.div key="login" exit={{opacity:0,scale:0.97}} transition={{duration:0.2}}>
          <LoginScreen onSuccess={()=>setAuth(true)}/>
        </motion.div>
      ) : (
        <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
          <Dashboard onLogout={()=>setAuth(false)}/>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
