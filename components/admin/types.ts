// ── Shared Types, Constants & Utilities for Admin Dashboard ─────────────────

export type AppointmentStatus = "Menunggu" | "Hadir" | "Selesai" | "Batal";

export type ToastType = {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  msg: string;
};

export interface Appointment {
  id: string;
  kode_booking: string;
  nama_pasien: string;
  no_hp: string;
  poli_tujuan: string;
  tanggal_kunjungan: string;
  status: AppointmentStatus;
  created_at: string;
}

export const STATUS_STYLE: Record<AppointmentStatus, { badge: string; dot: string; text: string }> = {
  Menunggu: { badge: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
  Hadir:    { badge: "bg-blue-50 border-blue-200",   dot: "bg-blue-500",  text: "text-blue-700" },
  Selesai:  { badge: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
  Batal:    { badge: "bg-slate-50 border-slate-200", dot: "bg-slate-400", text: "text-slate-600" },
};

export const todayJakarta = () => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export const fmtDate = (s: string) =>
  new Date(s+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});

export const fmtTime = (s: string) =>
  new Date(s).toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
