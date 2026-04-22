import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Kita memanggil komponen yang baru saja dibuat
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Klinik Pratama Cipatik",
  description: "Website Profil Profesional Klinik Pratama Cipatik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Navbar /> {/* Navbar selalu ada di atas */}
        <main className="min-h-screen">
          {children} {/* Ini adalah tempat halaman berubah-ubah */}
        </main>
        <Footer /> {/* Footer selalu ada di bawah */}
      </body>
    </html>
  );
}