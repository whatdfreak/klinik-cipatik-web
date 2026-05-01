"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

interface Staff {
  id: string;
  nama: string;
  kategori: string;
  jabatan: string;
  status_karyawan: string;
  deskripsi: string;
  foto_url: string;
  lisensi?: string;
}

export function StaffCarousel({ staff }: { staff: Staff[] }) {
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
    sliderRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-500">
        Belum ada data tim medis yang ditambahkan ke sistem.
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      {staff.map((medis, index) => (
        <motion.div
          key={medis.id}
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4), ease: "easeOut" }}
          className="relative min-w-[280px] md:min-w-[320px] aspect-[3/4] snap-center rounded-3xl overflow-hidden group shadow-lg hover:shadow-xl border border-slate-200 transition-all duration-300 flex-shrink-0"
        >
          {/* Image with fade-in */}
          <motion.img
            src={medis.foto_url}
            alt={medis.nama}
            initial={{ opacity: 0, scale: 1.06 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.7, delay: Math.min(index * 0.1 + 0.1, 0.5) }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-90 transition-opacity pointer-events-none" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 w-full p-6 transition-transform duration-500 translate-y-0 md:translate-y-12 md:group-hover:translate-y-0 pointer-events-none">
            <p className="text-teal-400 font-bold text-sm mb-1 uppercase tracking-wider">{medis.kategori}</p>
            <h3 className="text-2xl font-bold text-white mb-1">{medis.nama}</h3>
            <p className="text-teal-100 font-medium text-xs mb-3 uppercase tracking-wider">
              {medis.jabatan} • {medis.status_karyawan}
            </p>
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <p className="text-slate-200 text-sm leading-relaxed mb-4">{medis.deskripsi}</p>
              {medis.lisensi && (
                <span className="inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-teal-200 border border-white/20">
                  {medis.lisensi}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton loader for Suspense fallback
export function StaffCarouselSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden py-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="min-w-[280px] md:min-w-[320px] aspect-[3/4] rounded-3xl shrink-0 bg-slate-100 border border-slate-200 overflow-hidden relative"
        >
          {/* shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded-full" />
            <div className="h-5 w-36 bg-slate-200 rounded-full" />
            <div className="h-3 w-28 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
