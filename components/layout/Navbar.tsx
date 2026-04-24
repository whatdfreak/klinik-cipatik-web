"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out py-3 sm:py-4 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link 
            href="/" 
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${isScrolled ? 'bg-teal-600 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/></svg>
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors duration-500 ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              Klinik Cipatik
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Beranda', 'Layanan', 'Jadwal', 'Tim Medis', 'Kontak'].map((item) => (
              <Link 
                key={item} 
                href={item === 'Beranda' ? '/' : `/#${item.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md px-2 py-1 ${
                  isScrolled ? 'text-slate-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/reservasi" 
              className={`hidden md:flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-500 transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                isScrolled 
                  ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-md hover:shadow-teal-600/20' 
                  : 'bg-white text-teal-900 hover:bg-teal-50 shadow-lg'
              }`}
            >
              Reservasi Online
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-colors duration-500 ${
                isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/20'
              }`}
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col">
              {['Beranda', 'Layanan', 'Jadwal', 'Tim Medis', 'Kontak'].map((item) => (
                <Link 
                  key={item} 
                  href={item === 'Beranda' ? '/' : `/#${item.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  {item}
                </Link>
              ))}
              <Link 
                href="/reservasi" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 flex items-center justify-center w-full px-5 py-3 rounded-xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Reservasi Online
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}