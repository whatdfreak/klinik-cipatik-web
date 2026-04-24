"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarDays, CreditCard, Stethoscope, User, Phone, IdCard, AlertCircle, Loader2, Info, ExternalLink, Ticket, Clock, Users, RefreshCcw, CheckCircle2, X, ChevronDown, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 1. ZOD SCHEMA & TYPES
// ============================================================================
const POLI_OPTIONS = ["Poli Umum", "Poli Gigi", "Poli KIA"] as const;
const SESI_OPTIONS = ["Pagi (08:00 - 12:00)", "Sore (14:00 - 18:00)"] as const;

const reservasiSchema = z.object({
  nik: z.string().length(16, { message: "NIK wajib 16 digit angka" }).regex(/^\d+$/, "NIK hanya berisi angka"),
  namaLengkap: z.string().trim().min(3, { message: "Nama lengkap minimal 3 karakter" }).max(120, { message: "Nama terlalu panjang" }),
  noHp: z.string().regex(/^08\d{8,13}$/, "Format HP tidak valid (mulai dengan 08)"),
  poliTujuan: z.enum(POLI_OPTIONS, { message: "Pilih Poli tujuan" }),
  sesiKunjungan: z.enum(SESI_OPTIONS, { message: "Pilih Sesi Kedatangan" }),
  tanggalKunjungan: z.string().min(1, { message: "Pilih tanggal kehadiran" }),
});

type ReservasiFormValues = z.infer<typeof reservasiSchema>;

interface BookingInfo {
  kode: string;
  tanggal: string;
  poli: string;
  sesi: string;
  nama: string;
}

export default function ReservasiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); 
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jalurLayanan, setJalurLayanan] = useState<"Umum" | "BPJS" | null>(null);
  const [minDate, setMinDate] = useState("");
  
  const [activeTickets, setActiveTickets] = useState<BookingInfo[]>([]);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false); 
  const MAX_TICKETS = 3; 
  
  const formTopRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const calculateMinDate = () => {
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const currentHour = jakartaTime.getHours();
      const currentDay = jakartaTime.getDay(); 

      let targetDate = new Date(jakartaTime);

      if (currentHour >= 17 || currentDay === 0) { targetDate.setDate(targetDate.getDate() + 1); }
      if (targetDate.getDay() === 0) { targetDate.setDate(targetDate.getDate() + 1); }

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      
      setMinDate(`${year}-${month}-${day}`);
    };

    const loadTickets = () => {
      const saved = localStorage.getItem("cipatik_tickets");
      if (saved) {
        try {
          const parsedTickets: BookingInfo[] = JSON.parse(saved);
          const today = new Date();
          today.setHours(0,0,0,0);

          const validTickets = parsedTickets.filter(ticket => {
            const [year, month, day] = ticket.tanggal.split('-').map(Number);
            const ticketDate = new Date(year, month - 1, day);
            ticketDate.setHours(0,0,0,0);
            return ticketDate >= today;
          });

          setActiveTickets(validTickets);
          localStorage.setItem("cipatik_tickets", JSON.stringify(validTickets));
        } catch (e) {
          localStorage.removeItem("cipatik_tickets");
        }
      }
    };

    calculateMinDate();
    loadTickets();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ReservasiFormValues>({
    resolver: zodResolver(reservasiSchema),
  });
  
  const watchSesi = watch("sesiKunjungan");

  const scrollToTop = () => {
    if (formTopRef.current) {
      const yOffset = -100; 
      const element = formTopRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: ReservasiFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null); 
    
    try {
      if (activeTickets.length >= MAX_TICKETS) {
        throw new Error(`Maksimal ${MAX_TICKETS} tiket aktif per perangkat.`);
      }

      const payload = {
        nik: data.nik,
        nama_pasien: data.namaLengkap.trim().replace(/\s+/g, " "),
        no_hp: data.noHp,
        poli_tujuan: data.poliTujuan,
        sesi_kunjungan: data.sesiKunjungan.includes("Pagi") ? "Pagi" : "Sore",
        tanggal_kunjungan: data.tanggalKunjungan
      };

      const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/reservasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Gagal menghubungi server.");

      const newTicket: BookingInfo = {
        kode: result.kode_booking,
        tanggal: data.tanggalKunjungan,
        poli: data.poliTujuan,
        sesi: data.sesiKunjungan,
        nama: data.namaLengkap
      };

      const alreadyExists = activeTickets.some((ticket) => ticket.kode === newTicket.kode);
      const updatedTickets = alreadyExists ? activeTickets : [...activeTickets, newTicket];
      
      setActiveTickets(updatedTickets);
      localStorage.setItem("cipatik_tickets", JSON.stringify(updatedTickets));
      setBookingInfo(newTicket);
      
      reset(); 
      setJalurLayanan(null); 
      setSubmitSuccess(true);
      scrollToTop();

    } catch (error: any) {
      console.error("Gagal reservasi:", error);
      if (error?.name === "AbortError") {
        setSubmitError("Server lambat merespons. Periksa koneksi Anda.");
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  const removeTicket = (kode: string) => {
    const updated = activeTickets.filter(t => t.kode !== kode);
    setActiveTickets(updated);
    localStorage.setItem("cipatik_tickets", JSON.stringify(updated));
    if (updated.length === 0) setShowTicketModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-teal-200">
      
      {/* ========================================================================
          TICKET MODAL (POPUP) 
      ======================================================================== */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pt-20 pb-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <Ticket className="w-5 h-5 text-teal-600" /> Tiket Aktif ({activeTickets.length}/{MAX_TICKETS})
                </h3>
                <button onClick={() => setShowTicketModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <AnimatePresence>
                    {activeTickets.map((ticket) => (
                      <motion.div key={ticket.kode} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group">
                        <div className="bg-teal-500 h-1.5 w-full absolute top-0 left-0"></div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KODE CHECK-IN</p>
                              <p className="text-2xl font-black font-mono text-slate-900 tracking-wider mt-1">{ticket.kode}</p>
                            </div>
                            <button type="button" onClick={() => removeTicket(ticket.kode)} className="text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-2 rounded-xl" title="Hapus Tiket">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                            <p className="flex justify-between items-center"><span className="text-slate-500">Nama:</span> <span className="font-bold text-slate-800 truncate max-w-[140px]">{ticket.nama}</span></p>
                            <p className="flex justify-between items-center"><span className="text-slate-500">Tgl:</span> <span className="font-semibold text-slate-800">{new Date(ticket.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</span></p>
                            <p className="flex justify-between items-center"><span className="text-slate-500">Poli/Sesi:</span> <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs border border-teal-100">{ticket.poli} ({ticket.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span></p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mt-6">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    Tunjukkan kode ini kepada resepsionis Klinik pada sesi kedatangan yang Anda pilih.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================
          MAIN CONTAINER
      ======================================================================== */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" ref={formTopRef}>
        
        <nav className="flex text-sm text-slate-500 mb-6 font-medium" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-teal-600 transition-colors">Beranda</Link></li>
            <li><div className="flex items-center"><span className="text-slate-400 mx-2">/</span><span className="text-slate-800">Reservasi Mandiri</span></div></li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          
          <div className="bg-slate-900 px-6 sm:px-10 py-8 relative overflow-hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Pendaftaran Mandiri</h1>
              <p className="text-teal-50 text-sm opacity-90">Ambil antrean dengan cepat dan mudah.</p>
            </div>
            
            {activeTickets.length > 0 && !submitSuccess && (
              <button 
                onClick={() => setShowTicketModal(true)}
                className="relative z-10 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md"
              >
                <Ticket className="w-4 h-4" />
                <span className="font-semibold text-sm">Lihat Tiket ({activeTickets.length})</span>
              </button>
            )}
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {!submitSuccess ? (
                <motion.div key="form-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  
                  {activeTickets.length >= MAX_TICKETS ? (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Users className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">Batas Maksimal Tercapai</h3>
                      <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                        Perangkat ini telah menyimpan <strong className="text-slate-900">{MAX_TICKETS} tiket aktif</strong>. Tunggu jadwal kunjungan berlalu untuk mendaftar lagi.
                      </p>
                      <button onClick={() => setShowTicketModal(true)} className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md focus:ring-4 focus:ring-teal-500/30">
                        <Ticket className="w-4 h-4" /> Buka Dompet Tiket
                      </button>
                    </div>
                  ) : (
                    <div className="block w-full">
                      {/* GATEKEEPER - HORIZONTAL LAYOUT */}
                      <AnimatePresence mode="wait">
                        {jalurLayanan === null && (
                          <motion.div key="gatekeeper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                              <CreditCard className="w-5 h-5 text-teal-600" /> Pilih Jalur Layanan
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              
                              <button onClick={() => setJalurLayanan("Umum")} className="flex items-start gap-4 p-5 border-2 border-slate-200 rounded-2xl text-left bg-white hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/20 group">
                                <div className="w-12 h-12 shrink-0 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <User className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-teal-700">Umum / Asuransi</h3>
                                  <p className="text-xs text-slate-500 leading-relaxed">Mendaftar mandiri melalui form website ini.</p>
                                </div>
                              </button>

                              <button onClick={() => setJalurLayanan("BPJS")} className="flex items-start gap-4 p-5 border-2 border-slate-200 rounded-2xl text-left bg-white hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20 group">
                                <div className="w-12 h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-emerald-700">BPJS Kesehatan</h3>
                                  <p className="text-xs text-slate-500 leading-relaxed">Menggunakan aplikasi resmi Mobile JKN.</p>
                                </div>
                              </button>

                            </div>
                          </motion.div>
                        )}

                        {/* INFO BPJS DENGAN GLASSMORPHISM BACK BUTTON */}
                        {jalurLayanan === "BPJS" && (
                          <motion.div key="bpjs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-8 sm:p-10 text-center mb-8 shadow-sm">
                              <Info className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-emerald-900 mb-3">Pendaftaran Antrean BPJS</h3>
                              <p className="text-sm text-emerald-800/80 mb-8 max-w-sm mx-auto leading-relaxed">
                                Pendaftaran antrean faskes tingkat pertama bagi peserta JKN <strong>diwajibkan menggunakan aplikasi Mobile JKN</strong>.
                              </p>
                              <a href="https://play.google.com/store/apps/details?id=app.bpjs.mobile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                                Buka Mobile JKN <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            
                            <div className="flex justify-center">
                              <button 
                                onClick={() => setJalurLayanan(null)} 
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold px-6 py-3 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full transition-all shadow-sm"
                              >
                                <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* FORM UMUM */}
                        {jalurLayanan === "Umum" && (
                          <motion.form key="umum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" /> Data Pasien</h2>
                              <button type="button" onClick={() => { setJalurLayanan(null); setSubmitError(null); reset(); }} className="text-xs font-semibold text-slate-400 hover:text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                                Ubah Jalur
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                  <label htmlFor="nik" className="block text-sm font-bold text-slate-700 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                                  <div className="relative">
                                    <IdCard className={`absolute left-4 top-3.5 w-5 h-5 ${errors.nik ? 'text-red-500' : 'text-slate-400'}`} />
                                    <input 
                                      id="nik" type="text" maxLength={16} inputMode="numeric" {...register("nik")} placeholder="Masukkan 16 Digit NIK di KTP" 
                                      className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.nik ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`} 
                                    />
                                  </div>
                                  {errors.nik && <p className="text-red-500 text-xs font-medium mt-1">{errors.nik.message}</p>}
                                </div>

                                <div>
                                  <label htmlFor="namaLengkap" className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                                  <input 
                                    id="namaLengkap" type="text" {...register("namaLengkap")} placeholder="Sesuai KTP" 
                                    className={`block w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.namaLengkap ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`} 
                                  />
                                  {errors.namaLengkap && <p className="text-red-500 text-xs font-medium mt-1">{errors.namaLengkap.message}</p>}
                                </div>
                                
                                <div>
                                  <label htmlFor="noHp" className="block text-sm font-bold text-slate-700 mb-1.5">No. WhatsApp Aktif</label>
                                  <div className="relative">
                                    <Phone className={`absolute left-4 top-3.5 w-4 h-4 ${errors.noHp ? 'text-red-500' : 'text-slate-400'}`} />
                                    <input 
                                      id="noHp" type="tel" maxLength={15} inputMode="tel" {...register("noHp")} placeholder="08..." 
                                      className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.noHp ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`} 
                                    />
                                  </div>
                                  {errors.noHp && <p className="text-red-500 text-xs font-medium mt-1">{errors.noHp.message}</p>}
                                </div>
                              </div>
                            </div>

                            <div className="border-b border-slate-100 pb-3 pt-2">
                              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-teal-600" /> Detail Kunjungan</h2>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="poliTujuan" className="block text-sm font-bold text-slate-700 mb-1.5">Poli Tujuan</label>
                                  <div className="relative">
                                    <select 
                                      id="poliTujuan" {...register("poliTujuan")} 
                                      className={`block w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 appearance-none focus:outline-none transition-colors cursor-pointer ${errors.poliTujuan ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}
                                    >
                                      <option value="" disabled className="text-slate-400 font-normal">-- Pilih Poli --</option>
                                      {POLI_OPTIONS.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
                                    </select>
                                    <ChevronDown className={`absolute right-3.5 top-3.5 w-5 h-5 pointer-events-none ${errors.poliTujuan ? 'text-red-400' : 'text-slate-400'}`} />
                                  </div>
                                  {errors.poliTujuan && <p className="text-red-500 text-xs font-medium mt-1">{errors.poliTujuan.message}</p>}
                                </div>

                                <div>
                                  <label htmlFor="tanggalKunjungan" className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Hadir</label>
                                  <div className="relative">
                                    <CalendarDays className={`absolute left-4 top-3.5 w-4 h-4 ${errors.tanggalKunjungan ? 'text-red-500' : 'text-slate-400'}`} />
                                    <input 
                                      id="tanggalKunjungan" type="date" min={minDate} {...register("tanggalKunjungan")} 
                                      className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 focus:outline-none transition-colors cursor-pointer ${errors.tanggalKunjungan ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`} 
                                    />
                                  </div>
                                  {errors.tanggalKunjungan && <p className="text-red-500 text-xs font-medium mt-1">{errors.tanggalKunjungan.message}</p>}
                                </div>
                              </div>

                              {/* ANIMASI ESTIMASI KEDATANGAN DENGAN FRAMER MOTION LAYOUTID */}
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Estimasi Kedatangan</label>
                                <div className="relative flex bg-slate-100 p-1.5 rounded-xl">
                                  {SESI_OPTIONS.map((sesi, idx) => {
                                    const title = sesi.split(' ')[0]; 
                                    const time = sesi.split(' ')[1] + ' ' + sesi.split(' ')[2] + ' ' + sesi.split(' ')[3]; 
                                    const isSelected = watchSesi === sesi;
                                    
                                    return (
                                      <label key={sesi} htmlFor={`sesi-${idx}`} className={`relative flex-1 text-center py-2.5 rounded-lg cursor-pointer z-10 transition-colors ${isSelected ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}>
                                        <input id={`sesi-${idx}`} type="radio" value={sesi} {...register("sesiKunjungan")} className="sr-only" />
                                        
                                        {/* Background pill animation */}
                                        {isSelected && (
                                          <motion.div 
                                            layoutId="activeSesiBackground"
                                            className="absolute inset-0 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-lg -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                          />
                                        )}
                                        
                                        <span className="block text-sm font-bold">{title}</span>
                                        <span className="block text-[10px] font-medium mt-0.5">{time}</span>
                                      </label>
                                    )
                                  })}
                                </div>
                                {errors.sesiKunjungan && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.sesiKunjungan.message}</p>}
                              </div>
                            </div>

                            <div className="pt-2">
                              {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-start gap-2 shadow-sm">
                                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" /> 
                                  <p className="font-medium leading-relaxed">{submitError}</p>
                                </div>
                              )}
                              <button 
                                type="submit" disabled={isSubmitting} 
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base focus:outline-none transition-all active:scale-[0.98] ${
                                  submitError ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-4 focus:ring-amber-500/30 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-4 focus:ring-slate-900/30 shadow-lg shadow-slate-900/20'
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                              >
                                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : submitError ? <><RefreshCcw className="w-4 h-4" /> Coba Lagi</> : "Dapatkan Kode Booking"}
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : (
                // ============================================================================
                // 3. SUCCESS STATE (TIKET BARU)
                // ============================================================================
                <motion.div key="success-ticket" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-4">
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
                    <button 
                      onClick={() => { setBookingInfo(null); reset(); setJalurLayanan(null); setSubmitSuccess(false); scrollToTop(); }}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors focus:ring-4 focus:ring-slate-200"
                    >
                      Daftar Lagi
                    </button>
                    <Link href="/" className="flex-1 flex items-center justify-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-500 transition-colors shadow-md">
                      Selesai
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}