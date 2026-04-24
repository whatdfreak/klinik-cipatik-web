"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarDays, CreditCard, Stethoscope, User, Phone, IdCard, AlertCircle, CheckCircle2, Loader2, Info, ExternalLink, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 1. ZOD SCHEMA & TYPES
// ============================================================================
const reservasiSchema = z.object({
  nik: z.string().length(16, { message: "NIK wajib 16 digit angka" }).regex(/^\d+$/, "NIK hanya berisi angka"),
  namaLengkap: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  noHp: z.string().min(10, { message: "Nomor HP tidak valid" }).regex(/^08\d+$/, "Diawali dengan '08'"),
  poliTujuan: z.enum(["Poli Umum", "Poli Gigi", "Poli KIA"], { required_error: "Silakan pilih Poli tujuan" }),
  tanggalKunjungan: z.string().min(1, { message: "Pilih tanggal kunjungan" }),
});

type ReservasiFormValues = z.infer<typeof reservasiSchema>;

interface BookingInfo {
  kode: string;
  tanggal: string;
  poli: string;
  nama: string;
}

export default function ReservasiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jalurLayanan, setJalurLayanan] = useState<"Umum" | "BPJS" | null>(null);
  const [minDate, setMinDate] = useState("");
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  
  // Referensi untuk auto-scroll
  const formTopRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // LOGIC 1: INITIALIZATION (CUT-OFF TIME & LOCAL STORAGE)
  // ============================================================================
  useEffect(() => {
    // A. Menghitung Cut-off Time
    const calculateMinDate = () => {
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const currentHour = jakartaTime.getHours();
      const currentDay = jakartaTime.getDay(); 

      let targetDate = new Date(jakartaTime);

      if (currentHour >= 17 || currentDay === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      
      setMinDate(`${year}-${month}-${day}`);
    };

    // B. Cek apakah ada tiket aktif di Local Storage
    const checkActiveTicket = () => {
      const savedTicket = localStorage.getItem("cipatik_active_ticket");
      if (savedTicket) {
        try {
          const parsedTicket = JSON.parse(savedTicket);
          
          // Cek apakah tiket sudah kadaluarsa (melewati tanggal kunjungan)
          const ticketDate = new Date(parsedTicket.tanggal);
          const today = new Date();
          // Reset waktu ke jam 00:00 agar perbandingan adil
          ticketDate.setHours(0,0,0,0);
          today.setHours(0,0,0,0);

          if (ticketDate >= today) {
            // Tiket masih valid/aktif
            setBookingInfo(parsedTicket);
            setSubmitSuccess(true);
            setJalurLayanan("Umum");
          } else {
            // Tiket kadaluarsa, hapus dari memori
            localStorage.removeItem("cipatik_active_ticket");
          }
        } catch (e) {
          localStorage.removeItem("cipatik_active_ticket");
        }
      }
    };

    calculateMinDate();
    checkActiveTicket();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservasiFormValues>({
    resolver: zodResolver(reservasiSchema),
  });

  // Fungsi untuk scroll halus ke atas form
  const scrollToTop = () => {
    if (formTopRef.current) {
      const yOffset = -100; // Jarak dari atas agar tidak tertutup Navbar
      const element = formTopRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ============================================================================
  // LOGIC 2: FORM SUBMISSION (SIMULASI DB & SAVE LOCAL STORAGE)
  // ============================================================================
  const onSubmit = async (data: ReservasiFormValues) => {
    setIsSubmitting(true);
    
    // TODO: Supabase Insert Data
    await new Promise((resolve) => setTimeout(resolve, 2000)); 
    
    const generateBookingCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'CPTK-';
      for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
      return result;
    };

    const newBooking: BookingInfo = {
      kode: generateBookingCode(),
      tanggal: data.tanggalKunjungan,
      poli: data.poliTujuan,
      nama: data.namaLengkap
    };

    setBookingInfo(newBooking);
    
    // Simpan ke memori browser agar tidak hilang saat di-refresh
    localStorage.setItem("cipatik_active_ticket", JSON.stringify(newBooking));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    scrollToTop();
  };

  // Fungsi untuk kembali ke tampilan awal dengan bersih
  const handleReset = () => {
    setSubmitSuccess(false);
    setJalurLayanan(null);
    reset(); // Kosongkan field form
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-teal-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Beranda</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-slate-400 mx-2">/</span>
                <span className="text-slate-800" aria-current="page">Reservasi Mandiri</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Form Card */}
        <div ref={formTopRef} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative min-h-[500px]">
          
          {/* Header Form */}
          <div className="bg-slate-900 px-8 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
            <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Pendaftaran Mandiri</h1>
            <p className="text-teal-50 relative z-10 opacity-90">Ambil kode booking pendaftaran tanpa perlu antre lama di fasilitas kami.</p>
          </div>

          <AnimatePresence mode="wait">
            {!submitSuccess ? (
              <motion.div
                key="form-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-10"
              >
                {/* PILIH JALUR LAYANAN */}
                <div className="mb-10">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CreditCard className="w-5 h-5 text-teal-600" />
                    Pilih Jalur Kepesertaan
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setJalurLayanan("Umum")}
                      className={`p-4 border-2 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        jalurLayanan === "Umum" 
                          ? "border-teal-500 bg-teal-50 shadow-sm" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <h3 className={`font-bold ${jalurLayanan === "Umum" ? "text-teal-800" : "text-slate-700"}`}>Pasien Umum / Asuransi Swasta</h3>
                      <p className="text-xs text-slate-500 mt-1">Daftar langsung via website ini.</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setJalurLayanan("BPJS")}
                      className={`p-4 border-2 rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        jalurLayanan === "BPJS" 
                          ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <h3 className={`font-bold ${jalurLayanan === "BPJS" ? "text-emerald-800" : "text-slate-700"}`}>Pasien BPJS Kesehatan</h3>
                      <p className="text-xs text-slate-500 mt-1">Terintegrasi aplikasi Mobile JKN.</p>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {/* TAMPILAN BPJS */}
                  {jalurLayanan === "BPJS" && (
                    <motion.div
                      key="bpjs-info"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                          <Info className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-900 mb-2">Informasi Pasien BPJS</h3>
                        <p className="text-sm text-emerald-800/80 mb-6 max-w-md mx-auto leading-relaxed">
                          Sesuai regulasi Kementerian Kesehatan dan BPJS, pendaftaran antrean faskes tingkat pertama untuk peserta JKN <strong>wajib dilakukan melalui aplikasi Mobile JKN</strong>. Hal ini untuk memastikan data rujukan Anda tersinkronisasi.
                        </p>
                        <a 
                          href="https://play.google.com/store/apps/details?id=app.bpjs.mobile" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 shadow-sm"
                        >
                          Buka Aplikasi Mobile JKN
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* TAMPILAN UMUM (FORM) */}
                  {jalurLayanan === "Umum" && (
                    <motion.form
                      key="umum-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit(onSubmit)} 
                      className="space-y-8 overflow-hidden"
                    >
                      <section>
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <User className="w-5 h-5 text-teal-600" />
                          Data Diri Pasien
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="nik" className="block text-sm font-semibold text-slate-700">Nomor Induk Kependudukan (NIK)</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <IdCard className={`w-5 h-5 ${errors.nik ? 'text-red-400' : 'text-slate-400'}`} />
                              </div>
                              <input
                                id="nik"
                                type="text"
                                maxLength={16}
                                {...register("nik")}
                                placeholder="16 Digit NIK di KTP"
                                className={`block w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${
                                  errors.nik ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100 text-slate-900'
                                }`}
                              />
                            </div>
                            {errors.nik && <p className="text-red-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nik.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="namaLengkap" className="block text-sm font-semibold text-slate-700">Nama Lengkap (Sesuai KTP)</label>
                            <input
                              id="namaLengkap"
                              type="text"
                              {...register("namaLengkap")}
                              placeholder="Contoh: Budi Santoso"
                              className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${
                                errors.namaLengkap ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100 text-slate-900'
                              }`}
                            />
                            {errors.namaLengkap && <p className="text-red-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.namaLengkap.message}</p>}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label htmlFor="noHp" className="block text-sm font-semibold text-slate-700">Nomor WhatsApp Aktif</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Phone className={`w-5 h-5 ${errors.noHp ? 'text-red-400' : 'text-slate-400'}`} />
                              </div>
                              <input
                                id="noHp"
                                type="tel"
                                {...register("noHp")}
                                placeholder="08xxxxxxxxxx"
                                className={`block w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${
                                  errors.noHp ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100 text-slate-900'
                                }`}
                              />
                            </div>
                            {errors.noHp && <p className="text-red-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.noHp.message}</p>}
                          </div>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Stethoscope className="w-5 h-5 text-teal-600" />
                          Detail Kunjungan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="poliTujuan" className="block text-sm font-semibold text-slate-700">Poli Tujuan</label>
                            <select
                              id="poliTujuan"
                              {...register("poliTujuan")}
                              className={`block w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all appearance-none ${
                                errors.poliTujuan ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100 text-slate-900'
                              }`}
                            >
                              <option value="">Pilih Poli...</option>
                              <option value="Poli Umum">Poli Umum</option>
                              <option value="Poli Gigi">Poli Gigi</option>
                              <option value="Poli KIA">Poli KIA & KB</option>
                            </select>
                            {errors.poliTujuan && <p className="text-red-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.poliTujuan.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="tanggalKunjungan" className="block text-sm font-semibold text-slate-700">Tanggal Rencana Hadir</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <CalendarDays className={`w-5 h-5 ${errors.tanggalKunjungan ? 'text-red-400' : 'text-slate-400'}`} />
                              </div>
                              <input
                                id="tanggalKunjungan"
                                type="date"
                                min={minDate} 
                                {...register("tanggalKunjungan")}
                                className={`block w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${
                                  errors.tanggalKunjungan ? 'border-red-300 focus:border-red-400 focus:ring-red-200 text-red-900' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100 text-slate-900'
                                }`}
                              />
                            </div>
                            {errors.tanggalKunjungan && <p className="text-red-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.tanggalKunjungan.message}</p>}
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6 flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 leading-relaxed">
                            <strong>Sistem Check-in Berjalan:</strong> Anda akan mendapatkan Kode Booking. Kode ini harus ditukarkan di KiosK / Meja Resepsionis Klinik pada hari H untuk mendapatkan nomor antrean yang sebenarnya.
                          </p>
                        </div>
                      </section>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Memproses Data...
                            </>
                          ) : (
                            "Dapatkan Kode Booking"
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              // ============================================================================
              // 3. SUCCESS STATE (KODE BOOKING / CHECK-IN)
              // ============================================================================
              <motion.div
                key="success-ticket"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className="p-8 md:p-12 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reservasi Diterima!</h2>
                <p className="text-slate-600 mb-8 max-w-md text-sm">
                  {bookingInfo?.nama}, data Anda telah tersimpan di sistem. Tiket ini akan tetap tersimpan di browser Anda hari ini.
                </p>

                {/* Tiket Check-in / Booking Code */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-sm p-6 mb-8 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Ticket className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Check-in</p>
                  </div>
                  <div className="bg-white border border-slate-200 py-4 px-6 rounded-xl inline-block mb-6 shadow-inner">
                    <p className="text-4xl font-mono font-black text-slate-900 tracking-[0.2em]">{bookingInfo?.kode}</p>
                  </div>
                  
                  <div className="space-y-3 text-left border-t border-slate-200 pt-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Tanggal Kehadiran:</span>
                      <span className="font-bold text-slate-800">
                        {bookingInfo?.tanggal ? new Date(bookingInfo.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Poli Dituju:</span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{bookingInfo?.poli}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-sm">
                  <button 
                    onClick={() => {
                      // Hapus dari local storage untuk mendaftar yang baru
                      localStorage.removeItem("cipatik_active_ticket");
                      setBookingInfo(null);
                      handleReset();
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 shadow-sm"
                  >
                    Daftarkan Pasien Lain
                  </button>
                  <Link
                    href="/"
                    className="w-full text-teal-600 font-semibold py-3 rounded-xl hover:text-teal-700 hover:bg-teal-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}