"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import {
  CalendarDays, CreditCard, Stethoscope, User, Phone, IdCard, AlertCircle,
  Loader2, Info, ExternalLink, Ticket, Users, RefreshCcw, ChevronDown, ArrowLeft
} from "lucide-react";
import { POLI_OPTIONS, SESI_OPTIONS, ReservasiFormValues } from "./types";

interface BookingFormProps {
  form: UseFormReturn<ReservasiFormValues>;
  jalurLayanan: "Umum" | "BPJS" | null;
  minDate: string;
  maxDate: string;
  disabledSessions: string[];
  sesiMessage: string;
  isSubmitting: boolean;
  submitError: string | null;
  activeTicketCount: number;
  maxTickets: number;
  ticketsLoaded: boolean;
  submitSuccess: boolean;
  onSetJalur: (jalur: "Umum" | "BPJS" | null) => void;
  onSubmit: (data: ReservasiFormValues) => void;
  onOpenTickets: () => void;
}

export default function BookingForm(props: BookingFormProps) {
  const {
    form, jalurLayanan, minDate, maxDate, disabledSessions, sesiMessage,
    isSubmitting, submitError, activeTicketCount, maxTickets, ticketsLoaded, submitSuccess,
    onSetJalur, onSubmit, onOpenTickets,
  } = props;

  const { register, handleSubmit, reset, watch, formState: { errors } } = form;
  const watchSesi = watch("sesiKunjungan");

  return (
    <motion.div key="form-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      {activeTicketCount >= maxTickets ? (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Batas Maksimal Tercapai</h3>
          <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto mb-6">
            Perangkat ini telah menyimpan <strong className="text-slate-900">{maxTickets} tiket aktif</strong>. Tunggu jadwal kunjungan berlalu untuk mendaftar lagi.
          </p>
          <button onClick={onOpenTickets} className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md focus:ring-4 focus:ring-teal-500/30">
            <Ticket className="w-4 h-4" /> Buka Dompet Tiket
          </button>
        </div>
      ) : (
        <div className="block w-full">
          <AnimatePresence mode="wait">
            {jalurLayanan === null && (
              <motion.div key="gatekeeper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-5 h-5 text-teal-600" /> Pilih Jalur Layanan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <button onClick={() => onSetJalur("Umum")} className="flex items-start gap-4 p-5 border-2 border-slate-200 rounded-2xl text-left bg-white hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/20 group">
                    <div className="w-12 h-12 shrink-0 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-teal-700">Umum / Asuransi</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Mendaftar mandiri melalui form website ini.</p>
                    </div>
                  </button>
                  <button onClick={() => onSetJalur("BPJS")} className="flex items-start gap-4 p-5 border-2 border-slate-200 rounded-2xl text-left bg-white hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20 group">
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
                  <button onClick={() => onSetJalur(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold px-6 py-3 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full transition-all shadow-sm">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Pilihan
                  </button>
                </div>
              </motion.div>
            )}

            {jalurLayanan === "Umum" && (
              <motion.form key="umum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" /> Data Pasien</h2>
                  <button type="button" onClick={() => { onSetJalur(null); reset(); }} className="text-xs font-semibold text-slate-400 hover:text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                    Ubah Jalur
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="nik" className="block text-sm font-bold text-slate-700 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                      <div className="relative">
                        <IdCard className={`absolute left-4 top-3.5 w-5 h-5 ${errors.nik ? 'text-red-500' : 'text-slate-400'}`} />
                        <input id="nik" type="text" maxLength={16} inputMode="numeric" {...register("nik")} placeholder="Masukkan 16 Digit NIK di KTP"
                          onKeyDown={(e) => { const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']; if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                          onPaste={(e) => { const paste = e.clipboardData.getData('text'); if (!/^\d+$/.test(paste)) e.preventDefault(); }}
                          className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.nik ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}/>
                      </div>
                      {errors.nik && <p className="text-red-500 text-xs font-medium mt-1">{errors.nik.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="namaLengkap" className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input id="namaLengkap" type="text" {...register("namaLengkap")} placeholder="Sesuai KTP" autoComplete="name"
                        onKeyDown={(e) => { const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter']; if (!allowed.includes(e.key) && !/^[a-zA-Z\s.,'-]$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                        onPaste={(e) => { const paste = e.clipboardData.getData('text'); if (!/^[a-zA-Z\s.,'-]+$/.test(paste)) e.preventDefault(); }}
                        className={`block w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.namaLengkap ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}/>
                      {errors.namaLengkap && <p className="text-red-500 text-xs font-medium mt-1">{errors.namaLengkap.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="noHp" className="block text-sm font-bold text-slate-700 mb-1.5">No. WhatsApp Aktif</label>
                      <div className="relative">
                        <Phone className={`absolute left-4 top-3.5 w-4 h-4 ${errors.noHp ? 'text-red-500' : 'text-slate-400'}`} />
                        <input id="noHp" type="tel" maxLength={13} inputMode="numeric" {...register("noHp")} placeholder="08..." autoComplete="tel"
                          onKeyDown={(e) => { const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']; if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault(); }}
                          onPaste={(e) => { const paste = e.clipboardData.getData('text').replace(/\D/g, ''); e.preventDefault(); document.execCommand('insertText', false, paste); }}
                          className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.noHp ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}/>
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
                        <select id="poliTujuan" {...register("poliTujuan")}
                          className={`block w-full pl-4 pr-10 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 appearance-none focus:outline-none transition-colors cursor-pointer ${errors.poliTujuan ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}>
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
                        <input id="tanggalKunjungan" type="date" min={minDate} max={maxDate} {...register("tanggalKunjungan")}
                          className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 focus:outline-none transition-colors cursor-pointer ${errors.tanggalKunjungan ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}/>
                      </div>
                      {errors.tanggalKunjungan && <p className="text-red-500 text-xs font-medium mt-1">{errors.tanggalKunjungan.message}</p>}
                    </div>
                  </div>

                  {/* Session selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Estimasi Kedatangan</label>
                    {sesiMessage && (
                      <div className={`text-xs font-medium px-3 py-2 rounded-lg mb-2 ${disabledSessions.length === 2 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{sesiMessage}</div>
                    )}
                    <div className="relative flex bg-slate-100 p-1.5 rounded-xl">
                      {SESI_OPTIONS.map((sesi, idx) => {
                        const title = sesi.split(' ')[0];
                        const time = sesi.split(' ')[1] + ' ' + sesi.split(' ')[2] + ' ' + sesi.split(' ')[3];
                        const isSelected = watchSesi === sesi;
                        const isDisabled = disabledSessions.includes(sesi);
                        return (
                          <label key={sesi} htmlFor={`sesi-${idx}`}
                            className={`relative flex-1 text-center py-4 rounded-lg z-10 transition-colors select-none ${isDisabled ? 'opacity-40 cursor-not-allowed' : isSelected ? 'text-teal-700 cursor-pointer' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}>
                            <input id={`sesi-${idx}`} type="radio" value={sesi} {...register("sesiKunjungan")} disabled={isDisabled} className="sr-only"/>
                            {isSelected && !isDisabled && (
                              <motion.div layoutId="activeSesiBackground" className="absolute inset-0 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-lg -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }}/>
                            )}
                            <span className="block text-sm font-bold">{title}</span>
                            <span className="block text-[10px] font-medium mt-0.5">{isDisabled ? 'Sesi Berakhir' : time}</span>
                          </label>
                        );
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
                  <button type="submit" disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base focus:outline-none transition-all active:scale-[0.98] ${submitError ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-4 focus:ring-amber-500/30 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-4 focus:ring-slate-900/30 shadow-lg shadow-slate-900/20'} disabled:opacity-70 disabled:cursor-not-allowed`}>
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : submitError ? <><RefreshCcw className="w-4 h-4" /> Coba Lagi</> : "Dapatkan Kode Booking"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
