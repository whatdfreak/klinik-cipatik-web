"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CreditCard, Stethoscope, User, Phone, IdCard, AlertCircle, Loader2, Info, ExternalLink, Ticket, Clock, Users, RefreshCcw, CheckCircle2, X, ChevronDown, ArrowLeft, Printer } from "lucide-react";

const POLI_OPTIONS = ["Poli Umum", "Poli Gigi", "Poli KIA"] as const;
const SESI_OPTIONS = ["Pagi (08:00 - 12:00)", "Sore (14:00 - 18:00)"] as const;

const getMaxBookingDate = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  now.setDate(now.getDate() + 30);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const reservasiSchema = z.object({
  nik: z
    .string()
    .length(16, { message: "NIK wajib 16 digit angka" })
    .regex(/^\d+$/, "NIK hanya berisi angka"),

  namaLengkap: z
    .string()
    .trim()
    .min(3, { message: "Nama lengkap minimal 3 karakter" })
    .max(120, { message: "Nama terlalu panjang (maks. 120 karakter)" })
    .regex(
      /^[a-zA-Z\s.,'-]+$/,
      "Nama hanya boleh berisi huruf, spasi, dan tanda baca dasar (titik/koma)."
    )
    .transform((val) => val.replace(/\s+/g, ' ').trim()),

  noHp: z
    .string()
    .regex(
      /^08[0-9]{7,11}$/,
      "Nomor HP harus diawali '08' dan terdiri dari 9-13 angka."
    ),

  poliTujuan: z.enum(POLI_OPTIONS, { message: "Pilih Poli tujuan" }),
  sesiKunjungan: z.enum(SESI_OPTIONS, { message: "Pilih Sesi Kedatangan" }),

  tanggalKunjungan: z
    .string()
    .min(1, { message: "Pilih tanggal kehadiran" })
    .refine((val) => {
      if (!val) return false;
      const selected = new Date(val + 'T00:00:00');
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return selected >= today;
    }, { message: "Tanggal kunjungan tidak boleh di masa lalu." })
    .refine((val) => {
      if (!val) return false;
      const selected = new Date(val + 'T00:00:00');
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
      return selected <= maxDate;
    }, { message: "Reservasi hanya tersedia untuk 30 hari ke depan." })
    .refine((val) => {
      if (!val) return false;
      const selected = new Date(val + 'T00:00:00');
      return selected.getDay() !== 0;
    }, { message: "Klinik tutup di hari Minggu. Pilih hari lain." }),
});

type ReservasiFormValues = z.infer<typeof reservasiSchema>;

interface BookingInfo {
  kode: string;
  tanggal: string;
  poli: string;
  sesi: string;
  nama: string;
  adminBatal?: boolean; // flag dari pengecekan server
}

export default function ReservasiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jalurLayanan, setJalurLayanan] = useState<"Umum" | "BPJS" | null>(null);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  const [activeTickets, setActiveTickets] = useState<BookingInfo[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false); // anti-flicker guard
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [cancelledNotices, setCancelledNotices] = useState<BookingInfo[]>([]);
  const [disabledSessions, setDisabledSessions] = useState<string[]>([]);
  const [sesiMessage, setSesiMessage] = useState("");
  const MAX_TICKETS = 3;

  // Toast notifikasi ringan (auto-dismiss)
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" } | null>(null);
  const showToast = (message: string, type: "info" | "success" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Ticket Recovery states (inside unified modal)
  const [recoveryNik, setRecoveryNik] = useState("");
  const [recoveryNoHp, setRecoveryNoHp] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [showMultiRecovery, setShowMultiRecovery] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

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
      // Hitung maxDate (hari ini + 30 hari)
      setMaxDate(getMaxBookingDate());
    };

    const loadTickets = async () => {
      const saved = localStorage.getItem("cipatik_tickets");
      if (!saved) { setTicketsLoaded(true); return; }
      try {
        const parsedTickets: BookingInfo[] = JSON.parse(saved);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const validByDate = parsedTickets.filter(ticket => {
          const [y, m, d] = ticket.tanggal.split('-').map(Number);
          const td = new Date(y, m - 1, d); td.setHours(0, 0, 0, 0);
          return td >= today;
        });

        // Cek status terbaru dari server (deteksi: batal, selesai, dibatalkan admin)
        if (validByDate.length > 0) {
          try {
            const kodes = validByDate.map(t => t.kode).join(',');
            const res = await fetch(`/api/cek-tiket?kodes=${kodes}`);
            const json = await res.json();
            if (json.data) {
              const cancelledCodes = new Set<string>(
                json.data.filter((d: any) => d.status === 'Batal').map((d: any) => d.kode_booking)
              );
              // AUTO-CLEAR: hapus tiket Selesai dan Batal dari localStorage
              const finishedCodes = new Set<string>(
                json.data.filter((d: any) => d.status === 'Selesai' || d.status === 'Batal').map((d: any) => d.kode_booking)
              );
              const stillActive = validByDate.filter(t => !finishedCodes.has(t.kode));
              const adminCancelled = validByDate.filter(t => cancelledCodes.has(t.kode));
              const finished = validByDate.filter(t => {
                const serverRecord = json.data.find((d: any) => d.kode_booking === t.kode);
                return serverRecord?.status === 'Selesai';
              });

              if (adminCancelled.length > 0) setCancelledNotices(adminCancelled);
              // Toast jika ada tiket selesai yang dihapus otomatis
              if (finished.length > 0) {
                setTimeout(() => showToast(
                  "Sesi pengobatan Anda sebelumnya telah selesai. Anda kini dapat mendaftar kembali.",
                  "success"
                ), 600);
              }
              setActiveTickets(stillActive);
              localStorage.setItem("cipatik_tickets", JSON.stringify(stillActive));
              return;
            }
          } catch { /* server cek gagal, lanjut normal */ }
        }
        setActiveTickets(validByDate);
        localStorage.setItem("cipatik_tickets", JSON.stringify(validByDate));
      } catch {
        localStorage.removeItem("cipatik_tickets");
      } finally {
        setTicketsLoaded(true);
      }
    };

    calculateMinDate();
    loadTickets();

    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const { register, handleSubmit, reset, watch, setValue, resetField, formState: { errors } } = useForm<ReservasiFormValues>({
    resolver: zodResolver(reservasiSchema),
  });

  const watchSesi = watch("sesiKunjungan");
  const watchDate = watch("tanggalKunjungan");

  // Hitung sesi yang dinonaktifkan berdasarkan tanggal & waktu sekarang (WIB)
  useEffect(() => {
    if (!watchDate) { setDisabledSessions([]); setSesiMessage(""); return; }
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const [y, m, d] = watchDate.split('-').map(Number);
    const selectedMidnight = new Date(y, m - 1, d);
    const todayMidnight = new Date(jakartaNow.getFullYear(), jakartaNow.getMonth(), jakartaNow.getDate());
    if (selectedMidnight.getTime() !== todayMidnight.getTime()) {
      setDisabledSessions([]); setSesiMessage(""); return;
    }
    const mins = jakartaNow.getHours() * 60 + jakartaNow.getMinutes();
    const disabled: string[] = [];
    if (mins >= 12 * 60) disabled.push("Pagi (08:00 - 12:00)");
    if (mins >= 18 * 60) disabled.push("Sore (14:00 - 18:00)");
    setDisabledSessions(disabled);
    if (disabled.length === 2) setSesiMessage("⚠️ Semua sesi hari ini telah berakhir. Silakan pilih tanggal berikutnya.");
    else if (disabled.length === 1) setSesiMessage("ℹ️ Sesi Pagi sudah berakhir. Hanya tersedia Sesi Sore.");
    else setSesiMessage("");
    // Auto-reset sesi jika yang dipilih sudah kadaluarsa
    if (watchSesi && disabled.includes(watchSesi)) resetField("sesiKunjungan");
  }, [watchDate]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const printTicket = (ticket: BookingInfo) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Tiket - ${ticket.kode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
            .ticket { background: #ffffff; border: 2px dashed #cbd5e1; padding: 32px; border-radius: 24px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
            .header h1 { margin: 0; color: #0f766e; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .kode-box { background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: center; }
            .kode-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
            .kode { font-size: 32px; font-weight: 900; color: #0f766e; letter-spacing: 3px; font-family: monospace; margin: 0; }
            .detail { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
            .detail:last-child { border-bottom: none; }
            .label { color: #64748b; font-weight: 600; }
            .value { font-weight: 700; color: #334155; text-align: right; max-width: 200px; word-break: break-word; }
            .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #94a3b8; font-weight: 600; line-height: 1.5; padding: 16px; background: #f8fafc; border-radius: 12px; }
            @media print {
              body { padding: 0; background: none; }
              .ticket { border: 2px solid #cbd5e1; box-shadow: none; max-width: 100%; border-radius: 16px; padding: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Klinik Pratama Cipatik</h1>
              <p>Tiket Reservasi Mandiri</p>
            </div>
            <div class="kode-box">
              <div class="kode-label">Kode Check-In</div>
              <div class="kode">${ticket.kode}</div>
            </div>
            <div class="detail"><span class="label">Nama Pasien</span><span class="value">${ticket.nama}</span></div>
            <div class="detail"><span class="label">Tanggal</span><span class="value">${new Date(ticket.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
            <div class="detail"><span class="label">Poli/Sesi</span><span class="value">${ticket.poli}<br/><span style="font-size:12px;color:#0f766e;">(${ticket.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span></span></div>
            <div class="footer">Tunjukkan tiket ini kepada petugas pendaftaran<br/>Klinik Pratama Cipatik.</div>
          </div>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 250); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Ticket Recovery: cari tiket dari server berdasarkan NIK + No HP
  const handleRecoverTickets = async () => {
    if (recoveryNik.length !== 16 || !/^\d+$/.test(recoveryNik)) {
      setRecoveryError("NIK harus 16 digit angka.");
      return;
    }
    if (!/^08[0-9]{7,11}$/.test(recoveryNoHp)) {
      setRecoveryError("No. HP harus diawali '08' dan terdiri dari 9-13 angka.");
      return;
    }
    setIsRecovering(true);
    setRecoveryError(null);
    try {
      const res = await fetch('/api/cari-tiket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: recoveryNik, no_hp: recoveryNoHp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghubungi server.');
      const found: BookingInfo[] = json.data ?? [];
      if (found.length === 0) {
        setRecoveryError("Tidak ada tiket aktif yang ditemukan untuk NIK dan No. HP ini.");
        return;
      }
      // Simpan ke localStorage dan update state
      const merged = [...activeTickets];
      for (const ticket of found) {
        if (!merged.some(t => t.kode === ticket.kode)) merged.push(ticket);
      }
      setActiveTickets(merged);
      localStorage.setItem("cipatik_tickets", JSON.stringify(merged));
      setShowMultiRecovery(false);
      setRecoveryNik("");
      setRecoveryNoHp("");
      showToast(`${found.length} tiket berhasil dipulihkan ke perangkat ini.`, "success");
    } catch (err: any) {
      setRecoveryError(err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-teal-200">

      {/* ── TOAST NOTIFIKASI RINGAN ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl shadow-black/10 text-sm font-semibold border backdrop-blur-md max-w-sm w-[calc(100%-2rem)] ${toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              : <Info className="w-5 h-5 text-teal-500 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-auto p-1 rounded-lg hover:bg-black/5 transition-colors" aria-label="Tutup notifikasi">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOTIFIKASI PEMBATALAN — MODAL PROFESIONAL ── */}
      <AnimatePresence>
        {cancelledNotices.length > 0 && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"
              onClick={() => setCancelledNotices([])}
            />
            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="relative z-10 bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

              {/* Drag indicator (mobile) */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Header */}
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
                <button onClick={() => setCancelledNotices([])} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors -mr-1 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-2">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Mohon maaf atas ketidaknyamanannya. Reservasi berikut telah <span className="font-semibold text-slate-800">dibatalkan oleh pihak klinik</span>. Anda dapat melakukan pendaftaran ulang kapan saja.
                </p>

                {/* Cancelled tickets */}
                <div className="space-y-2.5 mt-4">
                  {cancelledNotices.map(ticket => (
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

              {/* Actions */}
              <div className="px-6 pt-4 pb-6 flex gap-3">
                <button
                  onClick={() => setCancelledNotices([])}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Tutup
                </button>
                <button
                  onClick={() => setCancelledNotices([])}
                  className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-lg shadow-teal-600/20"
                >
                  Daftar Ulang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================================================
          TICKET MODAL (POPUP)
      ======================================================================== */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pt-20 pb-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowTicketModal(false); setRecoveryError(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="relative overflow-hidden bg-slate-900 px-6 py-5 flex justify-between items-center">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/20 blur-2xl pointer-events-none"></div>
                <h3 className="font-bold text-white flex items-center gap-2 text-lg relative z-10">
                  <Ticket className="w-5 h-5 text-teal-400" /> 
                  {activeTickets.length > 0 && !showMultiRecovery ? `Tiket Saya (${activeTickets.length}/${MAX_TICKETS})` : 'Cari Tiket'}
                </h3>
                <button onClick={() => { setShowTicketModal(false); setRecoveryError(null); setShowMultiRecovery(false); }} aria-label="Tutup modal" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTickets.length > 0 && !showMultiRecovery ? (
                    <motion.div key="has-tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4 bg-slate-50">
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
                                <button type="button" onClick={() => setTicketToDelete(ticket.kode)} className="text-slate-300 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-3 rounded-xl" aria-label={`Hapus tiket ${ticket.kode}`} title="Hapus Tiket">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                                <p className="flex justify-between items-center"><span className="text-slate-500">Nama:</span> <span className="font-bold text-slate-800 truncate max-w-[140px]">{ticket.nama}</span></p>
                                <p className="flex justify-between items-center"><span className="text-slate-500">Tgl:</span> <span className="font-semibold text-slate-800">{new Date(ticket.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                                <p className="flex justify-between items-center"><span className="text-slate-500">Poli/Sesi:</span> <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs border border-teal-100">{ticket.poli} ({ticket.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span></p>
                              </div>
                              {/* 4. Simpan / Cetak PDF Button */}
                              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                <button type="button" onClick={() => printTicket(ticket)} className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
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
                      
                      {/* 2. Tombol Cari Tiket Lain */}
                      {activeTickets.length < MAX_TICKETS && (
                        <button 
                          onClick={() => setShowMultiRecovery(true)}
                          className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCcw className="w-4 h-4" /> Cari Tiket Lain
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="no-tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                      {activeTickets.length > 0 && showMultiRecovery && (
                        <button onClick={() => setShowMultiRecovery(false)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
                          <ArrowLeft className="w-4 h-4" /> Kembali ke Tiket Saya
                        </button>
                      )}
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <RefreshCcw className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{activeTickets.length > 0 ? "Cari Tiket Anggota Keluarga" : "Belum ada tiket"}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {activeTickets.length > 0 
                            ? "Anda dapat mencari dan memulihkan beberapa tiket dari NIK yang berbeda untuk anggota keluarga secara bergantian." 
                            : "Tiket tersimpan di perangkat ini. Jika Anda pernah mendaftar, gunakan form di bawah untuk memulihkannya."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">NIK KTP (16 digit)</label>
                          <input
                            type="text" inputMode="numeric" maxLength={16}
                            value={recoveryNik}
                            onChange={e => setRecoveryNik(e.target.value.replace(/\D/g, ''))}
                            placeholder="Contoh: 3204xxxxxxxxxxxx"
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">No. WhatsApp</label>
                          <input
                            type="tel" inputMode="numeric" maxLength={13}
                            value={recoveryNoHp}
                            onChange={e => setRecoveryNoHp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Contoh: 08xxxxxxxxx"
                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-mono text-slate-800"
                          />
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

                        <button
                          onClick={handleRecoverTickets}
                          disabled={isRecovering}
                          className="w-full mt-2 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-teal-600/20"
                        >
                          {isRecovering ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari...</> : 'Cari & Pulihkan Tiket'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Custom Delete Confirmation Overlay */}
              <AnimatePresence>
                {ticketToDelete && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }} 
                      className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-slate-100"
                    >
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
                        <button onClick={() => { removeTicket(ticketToDelete); setTicketToDelete(null); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95">
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

          <div className="bg-slate-900 px-6 sm:px-10 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Pendaftaran Mandiri</h1>
                <p className="text-teal-50 text-sm opacity-90">Ambil antrean dengan cepat dan mudah.</p>
              </div>

              {/* TIKET SAYA BUTTON (SATU TOMBOL SAJA) */}
              <div className="relative z-10 w-full sm:w-auto">
                {ticketsLoaded && !submitSuccess && (
                  <button
                    onClick={() => { setShowTicketModal(true); setRecoveryError(null); }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 sm:py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md"
                  >
                    <Ticket className="w-4 h-4 shrink-0" />
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {activeTickets.length > 0 ? `Tiket Saya (${activeTickets.length})` : 'Tiket Saya'}
                    </span>
                  </button>
                )}
              </div>
            </div>
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
                                      onKeyDown={(e) => {
                                        const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                                          e.preventDefault();
                                        }
                                      }}
                                      onPaste={(e) => {
                                        const paste = e.clipboardData.getData('text');
                                        if (!/^\d+$/.test(paste)) e.preventDefault();
                                      }}
                                      className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.nik ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}
                                    />
                                  </div>
                                  {errors.nik && <p className="text-red-500 text-xs font-medium mt-1">{errors.nik.message}</p>}
                                </div>

                                <div>
                                  <label htmlFor="namaLengkap" className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                                  <input
                                    id="namaLengkap" type="text" {...register("namaLengkap")} placeholder="Sesuai KTP"
                                    autoComplete="name"
                                    onKeyDown={(e) => {
                                      // Blokir karakter yang tidak diizinkan secara real-time
                                      const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
                                      if (!allowed.includes(e.key) && !/^[a-zA-Z\s.,'-]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                                        e.preventDefault();
                                      }
                                    }}
                                    onPaste={(e) => {
                                      const paste = e.clipboardData.getData('text');
                                      if (!/^[a-zA-Z\s.,'-]+$/.test(paste)) e.preventDefault();
                                    }}
                                    className={`block w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${errors.namaLengkap ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}
                                  />
                                  {errors.namaLengkap && <p className="text-red-500 text-xs font-medium mt-1">{errors.namaLengkap.message}</p>}
                                </div>

                                <div>
                                  <label htmlFor="noHp" className="block text-sm font-bold text-slate-700 mb-1.5">No. WhatsApp Aktif</label>
                                  <div className="relative">
                                    <Phone className={`absolute left-4 top-3.5 w-4 h-4 ${errors.noHp ? 'text-red-500' : 'text-slate-400'}`} />
                                    <input
                                      id="noHp" type="tel" maxLength={13} inputMode="numeric" {...register("noHp")} placeholder="08..."
                                      autoComplete="tel"
                                      onKeyDown={(e) => {
                                        // Hanya izinkan angka — blokir spasi, +, -, huruf, dsb.
                                        const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                                          e.preventDefault();
                                        }
                                      }}
                                      onPaste={(e) => {
                                        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
                                        e.preventDefault();
                                        // Insert hanya digit dari clipboard
                                        document.execCommand('insertText', false, paste);
                                      }}
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
                                      id="tanggalKunjungan" type="date" min={minDate} max={maxDate} {...register("tanggalKunjungan")}
                                      className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 focus:outline-none transition-colors cursor-pointer ${errors.tanggalKunjungan ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 hover:border-slate-300'}`}
                                    />
                                  </div>
                                  {errors.tanggalKunjungan && <p className="text-red-500 text-xs font-medium mt-1">{errors.tanggalKunjungan.message}</p>}
                                </div>
                              </div>

                              {/* ESTIMASI KEDATANGAN */}
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Estimasi Kedatangan</label>
                                {sesiMessage && (
                                  <div className={`text-xs font-medium px-3 py-2 rounded-lg mb-2 ${disabledSessions.length === 2 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>{sesiMessage}</div>
                                )}
                                <div className="relative flex bg-slate-100 p-1.5 rounded-xl">
                                  {SESI_OPTIONS.map((sesi, idx) => {
                                    const title = sesi.split(' ')[0];
                                    const time = sesi.split(' ')[1] + ' ' + sesi.split(' ')[2] + ' ' + sesi.split(' ')[3];
                                    const isSelected = watchSesi === sesi;
                                    const isDisabled = disabledSessions.includes(sesi);
                                    return (
                                      <label
                                        key={sesi}
                                        htmlFor={`sesi-${idx}`}
                                        className={`relative flex-1 text-center py-4 rounded-lg z-10 transition-colors select-none ${isDisabled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : isSelected ? 'text-teal-700 cursor-pointer' : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                                          }`}
                                      >
                                        <input
                                          id={`sesi-${idx}`} type="radio" value={sesi}
                                          {...register("sesiKunjungan")}
                                          disabled={isDisabled}
                                          className="sr-only"
                                        />
                                        {isSelected && !isDisabled && (
                                          <motion.div
                                            layoutId="activeSesiBackground"
                                            className="absolute inset-0 bg-white shadow-sm ring-1 ring-slate-200/50 rounded-lg -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                          />
                                        )}
                                        <span className="block text-sm font-bold">{title}</span>
                                        <span className="block text-[10px] font-medium mt-0.5">
                                          {isDisabled ? 'Sesi Berakhir' : time}
                                        </span>
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
                              <button
                                type="submit" disabled={isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base focus:outline-none transition-all active:scale-[0.98] ${submitError ? 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-4 focus:ring-amber-500/30 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-4 focus:ring-slate-900/30 shadow-lg shadow-slate-900/20'
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