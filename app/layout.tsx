import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import Komponen Global
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyWA from "@/components/ui/SpeedDial"; // DITAMBAHKAN

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Klinik Pratama Cipatik | Pelayanan Medis Terpadu",
  description: "Fasilitas Kesehatan Tingkat Pertama (FKTP) melayani pasien Umum, BPJS, dan Asuransi Swasta di Cipatik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen relative`}>
        
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        
        {/* DITAMBAHKAN: Tombol WA akan mengambang di atas semua halaman */}
        <StickyWA />

      </body>
    </html>
  );
}