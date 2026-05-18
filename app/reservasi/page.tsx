"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { Ticket } from "lucide-react";

import {
  reservasiSchema, getMaxBookingDate,
  type ReservasiFormValues, type BookingInfo,
} from "@/components/reservasi/types";
import ReservasiToast from "@/components/reservasi/ReservasiToast";
import CancelledNoticeModal from "@/components/reservasi/CancelledNoticeModal";
import TicketModal from "@/components/reservasi/TicketModal";
import BookingForm from "@/components/reservasi/BookingForm";
import SuccessTicket from "@/components/reservasi/SuccessTicket";
import { printTicket } from "@/components/reservasi/printTicket";

const MAX_TICKETS = 3;

export default function ReservasiPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jalurLayanan, setJalurLayanan] = useState<"Umum" | "BPJS" | null>(null);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  const [activeTickets, setActiveTickets] = useState<BookingInfo[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [cancelledNotices, setCancelledNotices] = useState<BookingInfo[]>([]);
  const [disabledSessions, setDisabledSessions] = useState<string[]>([]);
  const [sesiMessage, setSesiMessage] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const showToast = (message: string, type: "info" | "success" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const formTopRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Init: blocked dates, min/max date, load tickets ────────────────────
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch('/api/blocked-dates');
        const json = await res.json();
        if (res.ok) setBlockedDates(json.data || []);
      } catch (e) {}
    };
    fetchBlockedDates();

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
        if (validByDate.length > 0) {
          try {
            const kodes = validByDate.map(t => t.kode).join(',');
            const res = await fetch(`/api/cek-tiket?kodes=${kodes}`);
            const json = await res.json();
            if (json.data) {
              const updatedTickets = validByDate.map(t => {
                const serverRecord = json.data.find((d: any) => d.kode_booking === t.kode);
                return serverRecord ? { ...t, status: serverRecord.status } : t;
              });
              const adminCancelled = updatedTickets.filter(t => t.status === 'Batal');
              if (adminCancelled.length > 0 && !localStorage.getItem("cipatik_notified_batal")) {
                setCancelledNotices(adminCancelled);
                localStorage.setItem("cipatik_notified_batal", "true");
              }
              setActiveTickets(updatedTickets);
              localStorage.setItem("cipatik_tickets", JSON.stringify(updatedTickets));
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

  // ── Form ────────────────────────────────────────────────────────────────
  const form = useForm<ReservasiFormValues>({ resolver: zodResolver(reservasiSchema) });
  const watchDate = form.watch("tanggalKunjungan");
  const watchSesi = form.watch("sesiKunjungan");

  // Session disable logic based on date/time
  useEffect(() => {
    if (!watchDate) { setDisabledSessions([]); setSesiMessage(""); return; }
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const [y, m, d] = watchDate.split('-').map(Number);
    const selectedMidnight = new Date(y, m - 1, d);

    if (selectedMidnight.getDay() === 0) {
      setTimeout(() => { showToast("Klinik tutup di hari Minggu. Silakan pilih hari lain.", "info"); form.resetField("tanggalKunjungan"); }, 0);
      return;
    }
    const isBlocked = blockedDates.find(bd => bd.tanggal === watchDate);
    if (isBlocked) {
      setTimeout(() => { showToast(`Libur: ${isBlocked.keterangan}. Silakan pilih tanggal lain.`, "info"); form.resetField("tanggalKunjungan"); }, 0);
      return;
    }
    const todayMidnight = new Date(jakartaNow.getFullYear(), jakartaNow.getMonth(), jakartaNow.getDate());
    if (selectedMidnight.getTime() === todayMidnight.getTime()) {
      const mins = jakartaNow.getHours() * 60 + jakartaNow.getMinutes();
      if (mins >= 16 * 60) {
        setTimeout(() => { showToast("Pendaftaran hari ini sudah ditutup (batas 16:00). Silakan pilih hari esok.", "info"); form.resetField("tanggalKunjungan"); }, 0);
        return;
      }
      const disabled: string[] = [];
      if (mins >= 12 * 60) disabled.push("Pagi (08:00 - 12:00)");
      if (mins >= 18 * 60) disabled.push("Sore (14:00 - 18:00)");
      setDisabledSessions(disabled);
      if (disabled.length === 2) setSesiMessage("⚠️ Semua sesi hari ini telah berakhir. Silakan pilih tanggal berikutnya.");
      else if (disabled.length === 1) setSesiMessage("ℹ️ Sesi Pagi sudah berakhir. Hanya tersedia Sesi Sore.");
      else setSesiMessage("");
      if (watchSesi && disabled.includes(watchSesi)) form.resetField("sesiKunjungan");
    } else {
      setDisabledSessions([]); setSesiMessage("");
    }
  }, [watchDate, blockedDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToTop = () => {
    if (formTopRef.current) {
      const yOffset = -100;
      const element = formTopRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async (data: ReservasiFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (activeTickets.length >= MAX_TICKETS) throw new Error(`Maksimal ${MAX_TICKETS} tiket aktif per perangkat.`);
      const payload = {
        nik: data.nik,
        nama_pasien: data.namaLengkap.trim().replace(/\s+/g, " "),
        no_hp: data.noHp,
        poli_tujuan: data.poliTujuan,
        sesi_kunjungan: data.sesiKunjungan.includes("Pagi") ? "Pagi" : "Sore",
        tanggal_kunjungan: data.tanggalKunjungan,
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
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menghubungi server.");
      const newTicket: BookingInfo = { kode: result.kode_booking, tanggal: data.tanggalKunjungan, poli: data.poliTujuan, sesi: data.sesiKunjungan, nama: data.namaLengkap, status: "Menunggu" };
      const alreadyExists = activeTickets.some(t => t.kode === newTicket.kode);
      const updatedTickets = alreadyExists ? activeTickets : [...activeTickets, newTicket];
      setActiveTickets(updatedTickets);
      localStorage.setItem("cipatik_tickets", JSON.stringify(updatedTickets));
      setBookingInfo(newTicket);
      form.reset(); setJalurLayanan(null); setSubmitSuccess(true); scrollToTop();
    } catch (error: any) {
      if (error?.name === "AbortError") { setSubmitError("Server lambat merespons. Periksa koneksi Anda."); showToast("Server lambat merespons. Periksa koneksi Anda.", "error"); }
      else { setSubmitError(error.message); showToast(error.message, "error"); }
    } finally { setIsSubmitting(false); abortControllerRef.current = null; }
  };

  // ── Ticket actions ──────────────────────────────────────────────────────
  const removeTicket = (kode: string) => {
    const updated = activeTickets.filter(t => t.kode !== kode);
    setActiveTickets(updated);
    localStorage.setItem("cipatik_tickets", JSON.stringify(updated));
    if (updated.length === 0) setShowTicketModal(false);
  };

  const handleRecoverTickets = async (nik: string, noHp: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/cari-tiket', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, no_hp: noHp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menghubungi server.');
      const found: BookingInfo[] = json.data ?? [];
      if (found.length === 0) return "Tidak ada tiket aktif yang ditemukan untuk NIK dan No. HP ini.";
      const merged = [...activeTickets];
      for (const ticket of found) { if (!merged.some(t => t.kode === ticket.kode)) merged.push(ticket); }
      setActiveTickets(merged);
      localStorage.setItem("cipatik_tickets", JSON.stringify(merged));
      showToast(`${found.length} tiket berhasil dipulihkan ke perangkat ini.`, "success");
      return null;
    } catch (err: any) { return err.message; }
  };

  const handleReset = () => {
    setBookingInfo(null); form.reset(); setJalurLayanan(null); setSubmitSuccess(false); scrollToTop();
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-teal-200">
      <ReservasiToast toast={toast} onDismiss={() => setToast(null)} />
      <CancelledNoticeModal notices={cancelledNotices} onDismiss={() => setCancelledNotices([])} />
      <TicketModal
        open={showTicketModal} tickets={activeTickets} maxTickets={MAX_TICKETS}
        onClose={() => setShowTicketModal(false)} onRemoveTicket={removeTicket}
        onPrintTicket={printTicket} onRecoverTickets={handleRecoverTickets}
      />

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
              <div className="relative z-10 w-full sm:w-auto">
                {ticketsLoaded && !submitSuccess && (
                  <button onClick={() => { setShowTicketModal(true); }} className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 sm:py-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-md">
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
                <BookingForm
                  form={form} jalurLayanan={jalurLayanan} minDate={minDate} maxDate={maxDate}
                  disabledSessions={disabledSessions} sesiMessage={sesiMessage}
                  isSubmitting={isSubmitting} submitError={submitError}
                  activeTicketCount={activeTickets.length} maxTickets={MAX_TICKETS}
                  ticketsLoaded={ticketsLoaded} submitSuccess={submitSuccess}
                  onSetJalur={setJalurLayanan} onSubmit={onSubmit} onOpenTickets={() => setShowTicketModal(true)}
                />
              ) : (
                <SuccessTicket bookingInfo={bookingInfo} onReset={handleReset} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}