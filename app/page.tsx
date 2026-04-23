"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";

// ============================================================================
// DATA TIM MEDIS KLINIK PRATAMA CIPATIK
// ============================================================================
const dataTimMedis = [
  {
    id: 1,
    nama: "dr. Elviana R. Hermanus",
    jabatan: "Dokter Umum", 
    kategori: "Dokter Umum",
    deskripsi: "Pelayanan medis primer berkelanjutan, menangani kasus klinis keluarga dengan pendekatan holistik.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    nama: "dr. Roery S. Kriswihadi",
    jabatan: "Dokter Umum", 
    kategori: "Dokter Umum",
    deskripsi: "Pemeriksaan medis dasar, diagnosis, dan kuratif penyakit umum untuk pasien anak hingga dewasa.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    nama: "drg. Atika Suryadewi",
    jabatan: "Dokter Gigi", 
    kategori: "Dokter Gigi",
    deskripsi: "Spesialis perawatan preventif, konservasi gigi, dan edukasi kesehatan mulut keluarga.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    nama: "Apt. Syifa Fatasyaa, S.Farm",
    jabatan: "Apoteker", 
    kategori: "Farmasi",
    deskripsi: "Bertanggung jawab atas pengelolaan, peracikan, dan pemberian edukasi informasi obat kepada pasien.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 5,
    nama: "Puri Puspita Sari, A.Md.Kep",
    jabatan: "Perawat", 
    kategori: "Keperawatan",
    deskripsi: "Penanggung jawab tindakan keperawatan, skrining tanda vital pasien, dan pendampingan medis.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1584820927498-cafe8c1c9842?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 6,
    nama: "Annisa Sarah Agustina, A.Md.Kes",
    jabatan: "Perawat", 
    kategori: "Keperawatan",
    deskripsi: "Memberikan asuhan keperawatan komprehensif serta mendukung prosedur medis dokter di klinik.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 7,
    nama: "Aljan, A.Md.Farm",
    jabatan: "Asisten Apoteker", 
    kategori: "Farmasi",
    deskripsi: "Membantu apoteker dalam penyiapan resep, manajemen stok ketersediaan obat, dan pelayanan farmasi.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: 8,
    nama: "Maya Siti Nurbaya",
    jabatan: "Administrasi 1", 
    kategori: "Front Office",
    deskripsi: "Melayani proses pendaftaran pasien, pengelolaan rekam medis, dan pusat informasi operasional klinik.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
  },
  {
    id: 9,
    nama: "Irma Marlina",
    jabatan: "Administrasi 2", 
    kategori: "Front Office",
    deskripsi: "Membantu kelancaran alur administrasi, manajemen antrean, dan validasi data pasien BPJS.",
    lisensi: "", 
    foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  }
];

export default function Home() {
  // ============================================================================
  // LOGIC 1: REAL-TIME CONTEXTUAL SCHEDULE (WIB)
  // ============================================================================
  const [mounted, setMounted] = useState(false);
  const [statusWaktu, setStatusWaktu] = useState({ isOpen: false, text: "Memuat...", color: "emerald", detail: "Jadwal Praktik" });
  const [bpjsLogoError, setBpjsLogoError] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';

    const checkStatusKlinik = () => {
      const jakartaTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      const jakartaDate = new Date(jakartaTimeStr);
      
      const hari = jakartaDate.getDay(); 
      const jam = jakartaDate.getHours();

      let isOpen = false;
      let text = "Memuat...";
      let color = "emerald";
      let detail = "";

      if (hari === 0) {
        isOpen = false; text = "Tutup (Libur Nasional)"; color = "red"; detail = "Buka kembali Senin 08:00";
      } else if (hari === 6) {
        if (jam >= 8 && jam < 12) {
          isOpen = true; text = "Buka Sekarang"; color = "emerald"; detail = "08:00-12:00 | 16:00-18:00";
        } else if (jam >= 12 && jam < 16) {
          isOpen = false; text = "Istirahat Siang"; color = "amber"; detail = "Buka kembali pukul 16:00";
        } else if (jam >= 16 && jam < 18) {
          isOpen = true; text = "Buka Sekarang"; color = "emerald"; detail = "08:00-12:00 | 16:00-18:00";
        } else {
          isOpen = false; text = "Sudah Tutup"; color = "red"; detail = "Buka Senin pukul 08:00";
        }
      } else {
        if (jam >= 8 && jam < 12) {
          isOpen = true; text = "Buka Sekarang"; color = "emerald"; detail = "08:00-12:00 | 14:00-18:00";
        } else if (jam >= 12 && jam < 14) {
          isOpen = false; text = "Istirahat Siang"; color = "amber"; detail = "Buka kembali pukul 14:00";
        } else if (jam >= 14 && jam < 18) {
          isOpen = true; text = "Buka Sekarang"; color = "emerald"; detail = "08:00-12:00 | 14:00-18:00";
        } else {
          isOpen = false; text = "Sudah Tutup"; color = "red"; detail = "Buka besok pukul 08:00";
        }
      }

      setStatusWaktu({ isOpen, text, color, detail });
    };

    checkStatusKlinik();
    const interval = setInterval(checkStatusKlinik, 60000); 
    
    return () => {
      clearInterval(interval);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    };
  }, []);

  const getThemeClasses = (colorName: string) => {
    switch (colorName) {
      case "emerald": return { text: "text-emerald-300", bg: "bg-emerald-500", ping: "bg-emerald-400", badgeBg: "bg-emerald-900/50", badgeBorder: "border-emerald-500/30" };
      case "amber": return { text: "text-amber-300", bg: "bg-amber-500", ping: "bg-amber-400", badgeBg: "bg-amber-900/50", badgeBorder: "border-amber-500/30" };
      case "red": return { text: "text-red-300", bg: "bg-red-500", ping: "bg-red-400", badgeBg: "bg-red-900/50", badgeBorder: "border-red-500/30" };
      default: return { text: "text-emerald-300", bg: "bg-emerald-500", ping: "bg-emerald-400", badgeBg: "bg-emerald-900/50", badgeBorder: "border-emerald-500/30" };
    }
  };

  const theme = getThemeClasses(statusWaktu.color);

  // ============================================================================
  // LOGIC 2: DRAG-TO-SCROLL UNTUK TIM MEDIS CAROUSEL
  // ============================================================================
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // ============================================================================
  // VARIANTS ANIMASI FRAMER MOTION
  // ============================================================================
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" } 
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.15 }
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-36 bg-slate-900 overflow-hidden z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" alt="Fasilitas Klinik" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 to-slate-900/90 mix-blend-multiply"></div>
        </div>

        <motion.div 
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          
          <motion.div variants={fadeInUp}>
            <a 
              href="#jadwal" 
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/40 border border-slate-700/50 text-slate-100 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md hover:bg-slate-800/60 hover:border-slate-600 active:scale-95 transition-all duration-300 group cursor-pointer shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span className="flex h-2.5 w-2.5 relative">
                {mounted && statusWaktu.isOpen && !shouldReduceMotion && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.ping} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${mounted ? theme.bg : 'bg-slate-500'}`}></span>
              </span>
              
              <span className="font-semibold tracking-wide">Klinik Pratama Cipatik</span>
              <span className="text-white/20 hidden sm:inline px-1">|</span>
              
              <span className={`${mounted ? theme.text : 'text-slate-400'} hidden sm:flex items-center gap-1.5`}>
                {mounted ? statusWaktu.text : "Memuat..."}
                <span className={`hidden md:inline-block font-mono ${mounted ? theme.badgeBg : 'bg-slate-800'} px-1.5 py-0.5 rounded text-[10px] border ${mounted ? theme.badgeBorder : 'border-slate-700'} text-white/90 tracking-wider whitespace-nowrap`}>
                  {mounted ? statusWaktu.detail : "..."}
                </span>
              </span>

              <svg className="w-3.5 h-3.5 text-slate-300 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Pelayanan Medis Terpadu <br className="hidden md:block" />
            <span className="text-teal-400">& Terpercaya di Cipatik</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-base md:text-lg text-teal-50/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Kami hadir dengan fasilitas kesehatan modern dan tenaga medis profesional, mengutamakan kenyamanan serta kesembuhan keluarga Anda.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/reservasi" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-300 transform hover:-translate-y-1 hover:bg-teal-500 hover:shadow-[0_8px_25px_rgba(20,184,166,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              <span>Reservasi Online</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <a href="https://wa.me/628999801472" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/10 hover:border-white/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              Konsultasi Online
            </a>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 translate-y-[1px]">
          <svg viewBox="0 0 1440 120" className="w-full h-[40px] md:h-[80px] fill-white" preserveAspectRatio="none">
            <path d="M0,60 C320,120 420,0 720,0 C1020,0 1120,120 1440,60 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* 2. TRUST BAND (REVISI: Active/Colored by default di Mobile) */}
      <motion.section 
        className="bg-white pt-8 pb-16 border-b border-slate-100 relative z-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-slate-500 uppercase tracking-[0.18em] mb-10">Fasilitas Kesehatan Tingkat Pertama Melayani</motion.p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
            
            {/* Pasien Umum */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 bg-teal-50 text-teal-600 md:bg-slate-50 md:text-slate-400 md:group-hover:bg-teal-50 md:group-hover:text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold transition-colors duration-300 text-slate-900 md:text-slate-600 md:group-hover:text-slate-900">Pasien Umum</span>
                <span className="text-[11px] uppercase tracking-wide transition-colors duration-300 text-teal-600 md:text-slate-400 md:group-hover:text-teal-600">Layanan Mandiri</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="hidden md:block w-px h-12 bg-slate-200"></motion.div>

            {/* BPJS Kesehatan */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 cursor-default group">
              <div className="h-10 flex items-center justify-center transition-opacity duration-300 opacity-100 grayscale-0 md:opacity-70 md:grayscale md:group-hover:opacity-100 md:group-hover:grayscale-0">
                {!bpjsLogoError ? (
                  <img 
                    src="/images/bpjs-logo.png" 
                    alt="Logo BPJS Kesehatan" 
                    className="h-full w-auto max-w-[120px] object-contain"
                    onError={() => setBpjsLogoError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 bg-emerald-50 text-emerald-600 md:bg-slate-50 md:text-slate-400 md:group-hover:bg-emerald-50 md:group-hover:text-emerald-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-4H5v-2h4V7h2v4h4v2h-4v4z"/></svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold transition-colors duration-300 text-slate-900 md:text-slate-600 md:group-hover:text-slate-900">BPJS Kesehatan</span>
                <span className="text-[11px] uppercase tracking-wide transition-colors duration-300 text-emerald-600 md:text-slate-400 md:group-hover:text-emerald-600">Mitra Faskes 1</span>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="hidden md:block w-px h-12 bg-slate-200"></motion.div>

            {/* Asuransi Swasta */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 group cursor-default">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 bg-blue-50 text-blue-600 md:bg-slate-50 md:text-slate-400 md:group-hover:bg-blue-50 md:group-hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold transition-colors duration-300 text-slate-900 md:text-slate-600 md:group-hover:text-slate-900">Asuransi Swasta</span>
                <span className="text-[11px] uppercase tracking-wide transition-colors duration-300 text-blue-600 md:text-slate-400 md:group-hover:text-blue-600">Provider Terpilih</span>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* 3. FASILITAS & LAYANAN MEDIS */}
      <section id="layanan" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden scroll-mt-20 border-t border-slate-100">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-teal-200/30 blur-[100px] opacity-50"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[100px] opacity-50"></div>
        </div>

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Layanan & Fasilitas Kami</h2>
            <p className="text-slate-600 text-lg leading-relaxed">Menyediakan berbagai macam layanan kesehatan dasar dengan dokter yang ahli dan peralatan klinik yang memadai.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <svg className="absolute -right-4 -bottom-4 w-28 h-28 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5S4.5 7.858 4.5 12m15 0a7.5 7.5 0 11-15 0" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Poli Umum</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Pemeriksaan medis dasar, pengobatan penyakit umum, dan konsultasi kesehatan untuk semua rentang usia.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <svg className="absolute -right-4 -bottom-4 w-28 h-28 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-3.11 0-6 2.45-6 5.5 0 2.2 1.48 4.15 3.5 5.05v6.95C9.5 21.43 11 22 12 22s2.5-.57 2.5-2.5v-6.95c2.02-.9 3.5-2.85 3.5-5.05C18 4.45 15.11 2 12 2zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Poli Gigi</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Melayani perawatan kesehatan gigi dasar seperti pembersihan karang gigi, penambalan, hingga pencabutan gigi.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <svg className="absolute -right-4 -bottom-4 w-28 h-28 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 16.5v-3H8v-2h1.5v-3h2v3H13v2h-1.5v3h-2z"/></svg>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Layanan KIA & KB</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Pemeriksaan dan konsultasi kehamilan, pelayanan imunisasi anak terpadu, serta program Keluarga Berencana (KB).</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group">
              <svg className="absolute -right-4 -bottom-4 w-28 h-28 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.04-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/></svg>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Farmasi & Obat</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Fasilitas ketersediaan obat yang lengkap sesuai resep dokter, melayani pasien umum maupun jaminan BPJS.</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* 4. JADWAL PRAKTIK SECTION */}
      <section id="jadwal" className="py-20 md:py-28 bg-white relative overflow-hidden scroll-mt-20 border-t border-slate-100">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute bottom-[20%] -left-[10%] w-[300px] h-[300px] rounded-full bg-teal-100/40 blur-[80px] opacity-60"></div>
        </div>

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Jadwal Operasional Klinik</h2>
            <p className="text-slate-600 text-lg leading-relaxed">Klinik Pratama Cipatik siap melayani Anda setiap hari Senin hingga Sabtu. Silakan cek jam buka masing-masing layanan di bawah ini.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_24px_-8px_rgba(20,184,166,0.1)] relative overflow-hidden hover:border-teal-200 transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-400"></div>
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5 pt-2">
                <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-9 1V7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5V15m-9 2.25h.008v.008H12v-.008z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Poli Umum</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Senin - Jumat</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">14:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Sabtu</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">16:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-500">Minggu / Libur Nasional</span>
                  <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-slate-200">Tutup</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_24px_-8px_rgba(20,184,166,0.1)] relative overflow-hidden hover:border-teal-200 transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-400"></div>
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5 pt-2">
                <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Poli Gigi</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Senin - Jumat</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">14:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Sabtu</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">16:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-500">Minggu / Libur Nasional</span>
                  <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-slate-200">Tutup</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_24px_-8px_rgba(20,184,166,0.1)] relative overflow-hidden hover:border-teal-200 transition-colors">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-teal-400"></div>
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-5 pt-2">
                <div className="p-2.5 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Poli KIA & KB</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Senin - Jumat</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">14:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-start text-sm">
                  <span className="font-semibold text-slate-700 pt-1">Sabtu</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">08:00 - 12:00</span>
                    <span className="text-teal-800 bg-teal-50 px-3 py-1 rounded-md font-bold font-mono text-[11px] border border-teal-100 text-center">16:00 - 18:00</span>
                  </div>
                </li>
                <li className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-500">Minggu / Libur Nasional</span>
                  <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-semibold text-xs border border-slate-200">Tutup</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="bg-teal-50 border border-teal-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-teal-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div>
                <h4 className="text-lg font-bold text-teal-900">Ketentuan Pendaftaran</h4>
                <p className="text-teal-800/80 text-sm mt-1.5 leading-relaxed max-w-2xl">
                  Pasien wajib membawa <strong className="font-bold text-teal-900">KTP / Kartu Identitas Asli</strong>. Bagi pasien BPJS, pastikan status keaktifan kartu Anda. Pelayanan loket dihentikan sementara pada jam istirahat dan ditutup <strong className="font-bold text-teal-900">30 menit</strong> sebelum jam operasional berakhir.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. ALUR PELAYANAN */}
      <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal-200/30 blur-[100px] opacity-60"></div>
          <div className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full bg-blue-200/30 blur-[100px] opacity-60"></div>
        </div>

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          
          <motion.div variants={fadeInUp} className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Kemudahan Alur Pendaftaran</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Ikuti 4 langkah mudah berikut ini agar proses pendaftaran hingga pemeriksaan Anda berjalan lancar tanpa antrean panjang.
            </p>
          </motion.div>

          <div className="relative mt-8">
            <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-transparent border-t-2 border-dashed border-teal-200/70 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              
              {/* Step 1: Pendaftaran */}
              <motion.div variants={fadeInUp} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative flex flex-col h-full">
                <svg className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
                
                <div className="relative z-10 flex-grow">
                  <div className="w-12 h-12 bg-white text-teal-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-teal-100 mb-6">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Daftar Online</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">Ambil nomor antrean dari rumah agar Anda tidak perlu menunggu lama di ruang tunggu klinik.</p>
                </div>
                
                <div className="relative z-10 flex flex-col gap-2 mt-auto">
                  <Link href="/reservasi" className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-xs active:scale-95 hover:bg-teal-500 transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(20,184,166,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                    Daftar Umum (Web)
                  </Link>
                  <a href="https://play.google.com/store/apps/details?id=app.bpjs.mobile" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-white text-teal-700 border border-teal-200 px-4 py-2.5 rounded-xl font-semibold text-xs active:scale-95 hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                    Pasien BPJS (Aplikasi)
                  </a>
                </div>
              </motion.div>

              {/* Step 2: Verifikasi */}
              <motion.div variants={fadeInUp} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative flex flex-col h-full">
                <svg className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>

                <div className="relative z-10 flex-grow">
                  <div className="w-12 h-12 bg-white text-teal-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-teal-100 mb-6">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Verifikasi Kedatangan</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Datang ke klinik sesuai jadwal. Tunjukkan KTP atau Kartu BPJS Anda di bagian meja resepsionis.</p>
                </div>
              </motion.div>

              {/* Step 3: Skrining */}
              <motion.div variants={fadeInUp} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative flex flex-col h-full">
                <svg className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>

                <div className="relative z-10 flex-grow">
                  <div className="w-12 h-12 bg-white text-teal-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-teal-100 mb-6">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Pemeriksaan Awal</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Pengecekan awal oleh perawat (seperti tensi darah, suhu, dan berat badan) sebelum masuk ke poli.</p>
                </div>
              </motion.div>

              {/* Step 4: Konsultasi */}
              <motion.div variants={fadeInUp} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-2 group overflow-hidden relative flex flex-col h-full">
                <svg className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:text-teal-50/50 transition-colors duration-500 z-0 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M10.5 4.5c.3-.3.8-.3 1.1 0l3.6 3.6c.3.3.3.8 0 1.1l-9 9c-.3.3-.8.3-1.1 0l-3.6-3.6c-.3-.3-.3-.8 0-1.1l9-9zm4.2 4.2l-1.4-1.4-1.4 1.4 1.4 1.4zM21 16l-3.5-3.5L16 14l3.5 3.5c.3.3.8.3 1.1 0l.4-.4c.3-.3.3-.8 0-1.1z"/></svg>

                <div className="relative z-10 flex-grow">
                  <div className="w-12 h-12 bg-white text-teal-600 rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-teal-100 mb-6">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Konsultasi Dokter & Obat</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Berdiskusi tentang keluhan dengan dokter, dilanjutkan mengambil obat sesuai resep di apotek kami.</p>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. TIM MEDIS */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-100 overflow-hidden relative">
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          
          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">Tim Medis Profesional</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Klinik Pratama Cipatik didukung oleh tim dokter dan tenaga kesehatan yang ramah, berpengalaman, serta siap melayani kesehatan Anda.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-teal-600 text-sm font-semibold">
              <span>Geser untuk melihat</span>
              <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {dataTimMedis.map((medis) => (
              <div key={medis.id} className="relative min-w-[280px] md:min-w-[320px] aspect-[3/4] snap-center rounded-3xl overflow-hidden group shadow-lg hover:shadow-xl border border-slate-200 transition-all duration-300 flex-shrink-0">
                <img src={medis.foto} alt={medis.nama} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-90 transition-opacity pointer-events-none"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 transition-transform duration-500 translate-y-0 md:translate-y-12 md:group-hover:translate-y-0 pointer-events-none">
                  <p className="text-teal-400 font-bold text-sm mb-1 uppercase tracking-wider">{medis.kategori}</p>
                  <h3 className="text-2xl font-bold text-white mb-2">{medis.nama}</h3>
                  <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <p className="text-slate-200 text-sm leading-relaxed mb-4">{medis.deskripsi}</p>
                    {medis.lisensi && (
                      <span className="inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-teal-200 border border-white/20">{medis.lisensi}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}