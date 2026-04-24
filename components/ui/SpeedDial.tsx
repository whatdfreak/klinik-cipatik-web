"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// 1. Tambahkan useMotionValueEvent di import
import { motion, AnimatePresence, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { siteConfig } from "@/config/site";

export default function SpeedDial() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const isReservasiPage = pathname === '/reservasi';

  const shouldReduceMotion = useReducedMotion(); 
  const { scrollY } = useScroll();

  // 2. Ganti useEffect(scrollY.onChange) menjadi useMotionValueEvent
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 300);
    if (latest <= 300) setIsOpen(false); 
  });

  useEffect(() => {
    const handleOutsideInteraction = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("pointerdown", handleOutsideInteraction);
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("pointerdown", handleOutsideInteraction);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  // ... (Sisa kode return render JSX di bawahnya TETAP SAMA) ...

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={menuRef}
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id="speed-dial-menu"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-end gap-3 mb-2"
              >
                {/* Sembunyikan jika sudah di halaman Reservasi */}
                {!isReservasiPage && (
                  <Link href="/reservasi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-full">
                    <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md group-hover:bg-slate-50 transition-colors">Reservasi Online</span>
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-teal-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                )}

                <a href={`https://wa.me/${siteConfig.contact.wa.raw}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] rounded-full">
                  <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md group-hover:bg-slate-50 transition-colors">Chat WhatsApp</span>
                  <div className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-[#1ebe57] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
                  </div>
                </a>

                <a href={`tel:${siteConfig.contact.phone.raw}`} className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full">
                  <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md group-hover:bg-slate-50 transition-colors">Telepon Klinik</span>
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                </a>

                <a href={siteConfig.contact.mapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full">
                  <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md group-hover:bg-slate-50 transition-colors">Buka Peta Lokasi</span>
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="speed-dial-menu"
            aria-label={isOpen ? "Tutup Menu Bantuan" : "Buka Menu Bantuan"}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(20,184,166,0.4)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 focus-visible:ring-offset-2 ${
              isOpen ? "bg-slate-800 text-white hover:bg-slate-700 rotate-45" : "bg-teal-600 text-white hover:bg-teal-500 hover:-translate-y-1"
            }`}
          >
            <svg className="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              )}
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}