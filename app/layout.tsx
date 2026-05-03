import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Klinik Pratama Cipatik - Reservasi Online & Profil",
  description: "Fasilitas Kesehatan Tingkat Pertama (FKTP) melayani pasien Umum, BPJS, dan Asuransi Swasta di Cipatik. Daftar antrean online dengan cepat dan mudah.",
  openGraph: {
    title: "Klinik Pratama Cipatik - Reservasi Online & Profil",
    description: "Fasilitas Kesehatan Tingkat Pertama (FKTP) melayani pasien Umum, BPJS, dan Asuransi Swasta di Cipatik. Daftar antrean online dengan cepat dan mudah.",
    url: "https://klinik-cipatik.com",
    siteName: "Klinik Pratama Cipatik",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen relative`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}