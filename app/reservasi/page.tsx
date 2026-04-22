"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ReservasiPage() {
  const [device, setDevice] = useState<"android" | "ios" | "desktop" | "loading">("loading");
  const [services, setServices] = useState<any[]>([]);
  
  // State untuk form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // STEP 3.2: DYNAMIC FETCHING (GET)
  useEffect(() => {
    // Deteksi OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) setDevice("android");
    else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) setDevice("ios");
    else setDevice("desktop");

    // Tarik data Poli dari Supabase
    const fetchServices = async () => {
        try {
          const response = await fetch('/api/layanan');
          if (!response.ok) throw new Error('Gagal memuat layanan');
          const data = await response.json();
          setServices(data);
        } catch (error: any) {
          console.error("Error Fetching:", error.message);
        }
      };

    fetchServices();
  }, []);

  const getBPJSLink = () => {
    switch (device) {
      case "android": return { url: "https://play.google.com/store/apps/details?id=app.bpjs.mobile", label: "Unduh di Play Store", icon: "🤖" };
      case "ios": return { url: "https://apps.apple.com/id/app/mobile-jkn/id1280680453", label: "Unduh di App Store", icon: "🍎" };
      case "desktop": default: return { url: "https://www.bpjs-kesehatan.go.id/", label: "Buka Portal BPJS", icon: "🌐" };
    }
  };

  const bpjsData = getBPJSLink();

  // STEP 3.4: PENGIRIMAN DATA KE API (POST)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    const payload = {
      nik: formData.get('nik'),
      name: formData.get('name'),
      date_of_birth: formData.get('dob'),
      phone_number: formData.get('phone'),
      service_id: formData.get('service_id'),
      complaint: formData.get('complaint'),
    };

    try {
      const response = await fetch('/api/reservasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSubmitStatus({ type: 'success', message: 'Reservasi berhasil! Tim kami akan menghubungi WhatsApp Anda.' });
      e.currentTarget.reset(); 
      
    } catch (error: any) {
      setSubmitStatus({ type: 'error', message: error.message || 'Terjadi kesalahan saat mendaftar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Pendaftaran Antrean Online</h1>
          <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
            Lengkapi data diri Anda di bawah ini untuk mendapatkan nomor antrean kunjungan.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 mb-8 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg mt-0.5">ℹ️</span>
            <div>
              <h3 className="text-sm font-bold text-amber-800">Khusus Pasien Umum</h3>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                Formulir ini hanya untuk pasien mandiri. Peserta <strong>BPJS Kesehatan</strong> wajib mengambil antrean melalui Mobile JKN.
              </p>
            </div>
          </div>
          
          {device !== "loading" && (
            <a href={bpjsData.url} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap w-full sm:w-auto text-center inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-white border border-amber-300 text-amber-800 text-xs font-bold rounded-md hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm">
              <span>{bpjsData.icon}</span> {bpjsData.label}
            </a>
          )}
        </div>

        {submitStatus.type === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm font-medium flex items-center gap-2">
            ✅ {submitStatus.message}
          </div>
        )}
        {submitStatus.type === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm font-medium flex items-center gap-2">
            ❌ {submitStatus.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">NIK (Nomor KTP) <span className="text-red-500">*</span></label>
                <input type="text" name="nik" required maxLength={16} className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="16 Digit NIK" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" name="name" required className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Sesuai KTP" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
                <input type="date" name="dob" required className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor WhatsApp <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" required className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Poliklinik Tujuan <span className="text-red-500">*</span></label>
              <select name="service_id" required className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                <option value="">-- Pilih Layanan --</option>
                {/* Looping data dari Supabase hasil Fetching (Step 3.2) */}
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keluhan Singkat</label>
              <textarea name="complaint" rows={2} className="w-full px-3.5 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Jelaskan keluhan Anda..."></textarea>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-2.5 px-4 rounded-md transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? 'Sedang Memproses...' : 'Kirim Reservasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}