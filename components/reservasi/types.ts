import * as z from "zod";

export const POLI_OPTIONS = ["Poli Umum", "Poli Gigi", "Poli KIA"] as const;
export const SESI_OPTIONS = ["Pagi (08:00 - 12:00)", "Sore (14:00 - 18:00)"] as const;

export const getMaxBookingDate = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  now.setDate(now.getDate() + 30);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const reservasiSchema = z.object({
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

export type ReservasiFormValues = z.infer<typeof reservasiSchema>;

export interface BookingInfo {
  kode: string;
  tanggal: string;
  poli: string;
  sesi: string;
  nama: string;
  status?: string;
  adminBatal?: boolean;
}
