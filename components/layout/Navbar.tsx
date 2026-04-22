"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Sitemap yang sudah dioptimalkan (Tanpa Pendobelan & Sesuai Screenshot)
  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang Kami", href: "/tentang" },
    { name: "Layanan & Fasilitas", href: "/#layanan" },
    { name: "Jadwal Praktik", href: "/#jadwal" },
    { name: "Hubungi Kami", href: "/kontak" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-blue-700 tracking-tight">
          Klinik Pratama Cipatik
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href 
                  ? "text-blue-600" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/reservasi"
            className="hidden md:inline-flex bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Daftar Antrean
          </Link>

          {/* Tombol Hamburger untuk Layar HP */}
          <button
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Buka menu navigasi"
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

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg transition-all duration-300 ease-in-out">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium transition ${
                  pathname === link.href 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4">
              <Link
                href="/reservasi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-blue-600 text-white px-5 py-3 rounded-md text-base font-bold hover:bg-blue-700 transition shadow-sm"
              >
                Daftar Antrean
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}