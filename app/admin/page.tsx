"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle2, XCircle, RefreshCcw, LogOut, Users,
  Loader2, UserCheck, Clock, Hospital
} from "lucide-react";

import { Appointment, AppointmentStatus, ToastType, todayJakarta, fmtTime } from "@/components/admin/types";
import ToastStack from "@/components/admin/ToastStack";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AdminHolidaysModal from "@/components/admin/AdminHolidaysModal";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminTable from "@/components/admin/AdminTable";

const POLL_INTERVAL_MS = 30_000; // 30 detik

// ── STAT CARD (small, kept inline) ─────────────────────────────────────────
function StatCard({label,value,icon:Icon,color}:{label:string;value:number;icon:React.ElementType;color:string}) {
  return (
    <div className="bg-white rounded-[1.25rem] p-4 sm:p-5 border border-slate-100 shadow-md shadow-slate-100/80 flex items-center gap-3 sm:gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5"/>
      </div>
      <div>
        <p className="text-lg sm:text-[22px] font-black text-slate-900 tracking-tight leading-none mb-0.5 sm:mb-1">{value}</p>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

// ── LAST UPDATED INDICATOR ────────────────────────────────────────────────
function LastUpdated({ lastRefresh, isSyncing }: { lastRefresh: Date | null; isSyncing: boolean }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!lastRefresh) return;
    const tick = () => {
      const diffSec = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
      if (diffSec < 5) setLabel("Baru saja");
      else if (diffSec < 60) setLabel(`${diffSec} dtk lalu`);
      else setLabel(`${Math.floor(diffSec / 60)} mnt lalu`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  if (!lastRefresh) return null;

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 select-none">
      <span className="relative flex h-2 w-2">
        {isSyncing ? (
          <Loader2 className="w-2 h-2 animate-spin text-teal-400" />
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </>
        )}
      </span>
      <span className="hidden sm:inline">{isSyncing ? "Memperbarui..." : label}</span>
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
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [confirm, setConfirm] = useState<{open:boolean;title:string;message:string;label:string;color:string;onOk:()=>void}>({
    open:false,title:"",message:"",label:"Ya",color:"bg-rose-600 hover:bg-rose-700",onOk:()=>{}
  });
  const [currentTime, setCurrentTime] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Refs for polling — avoids stale closures
  const startDateRef = useRef(startDate);
  const endDateRef = useRef(endDate);
  useEffect(() => { startDateRef.current = startDate; }, [startDate]);
  useEffect(() => { endDateRef.current = endDate; }, [endDate]);

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

  // ── Fetch (manual — shows full loading spinner) ─────────────────────
  const fetchData = useCallback(async()=>{
    setLoading(true); setFetchError(null);
    try {
      const p = new URLSearchParams();
      if (startDate) p.set("startDate",startDate);
      if (endDate) p.set("endDate",endDate);
      const res = await fetch(`/api/admin/appointments?${p}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAppointments(json.data??[]);
      setLastRefresh(new Date());
    } catch(e:any) {
      setFetchError(e.message); toast("error","Gagal Memuat",e.message);
    } finally { setLoading(false); }
  },[startDate, endDate, statusFilter, toast]);

  useEffect(()=>{fetchData();},[fetchData]);

  // ── Background polling (silent — no loading spinner) ────────────────
  useEffect(() => {
    const poll = async () => {
      setIsSyncing(true);
      try {
        const p = new URLSearchParams();
        if (startDateRef.current) p.set("startDate", startDateRef.current);
        if (endDateRef.current) p.set("endDate", endDateRef.current);
        const res = await fetch(`/api/admin/appointments?${p}`);
        const json = await res.json();
        if (res.ok) {
          setAppointments(json.data ?? []);
          setLastRefresh(new Date());
          setFetchError(null);
        }
      } catch {
        // Silent fail — don't interrupt the receptionist
      } finally {
        setIsSyncing(false);
      }
    };

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []); // runs once — uses refs for current filter values

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
      <AdminHolidaysModal open={showSettings} onClose={()=>setShowSettings(false)} toast={toast}/>

      {/* TOP HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Hospital className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[13px] sm:text-[15px] font-bold text-white tracking-tight leading-tight">Dashboard Admin</h1>
                <p className="text-[10px] sm:text-[11px] font-medium text-teal-400">Klinik Pratama Cipatik</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Live sync indicator */}
              <LastUpdated lastRefresh={lastRefresh} isSyncing={isSyncing} />
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-semibold">
                 {currentTime}
              </div>
              <button onClick={fetchData} className="text-slate-400 hover:text-white transition-colors" title="Muat Ulang Data" aria-label="Muat Ulang Data">
                 <RefreshCcw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs sm:text-sm font-semibold transition-all">
                 <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* STATS CARDS — 2 cols mobile, 3 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard label="Antrean" value={counts.total} icon={Users} color="text-slate-600 bg-slate-100"/>
          <StatCard label="Menunggu" value={counts.menunggu} icon={Clock} color="text-amber-500 bg-amber-50"/>
          <StatCard label="Hadir" value={counts.hadir} icon={UserCheck} color="text-blue-500 bg-blue-50"/>
          <StatCard label="Selesai" value={counts.selesai} icon={CheckCircle2} color="text-emerald-500 bg-emerald-50"/>
          <StatCard label="Batal" value={counts.batal} icon={XCircle} color="text-rose-500 bg-rose-50"/>
        </div>

        {/* FILTER BAR */}
        <AdminFilters
          startDate={startDate} endDate={endDate}
          statusFilter={statusFilter} searchQuery={q} filteredCount={filtered.length}
          onStartDateChange={setStartDate} onEndDateChange={setEndDate}
          onStatusFilterChange={setStatusFilter} onSearchChange={setQ}
          onOpenSettings={()=>setShowSettings(true)} onExportCSV={exportCSV}
        />

        {/* DATA TABLE */}
        <AdminTable
          filtered={filtered} loading={loading} fetchError={fetchError}
          updatingId={updatingId} onRefresh={fetchData}
          onUpdateStatus={updateStatus} onAskConfirm={askConfirm}
        />
      </div>
    </div>
  );
}
