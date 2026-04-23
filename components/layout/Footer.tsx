import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Kolom 1: Profil Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Klinik Cipatik</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Fasilitas kesehatan tingkat pertama yang berdedikasi memberikan pelayanan medis profesional, ramah, dan terjangkau untuk seluruh lapisan masyarakat.
            </p>
            {/* Social Media Placeholder */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition text-white" aria-label="Instagram">IG</a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition text-white" aria-label="Facebook">FB</a>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Tautan Cepat</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-slate-400 hover:text-blue-400 transition">Beranda</Link></li>
              <li><Link href="/tentang" className="text-sm text-slate-400 hover:text-blue-400 transition">Tentang Kami</Link></li>
              <li><Link href="/#layanan" className="text-sm text-slate-400 hover:text-blue-400 transition">Layanan & Fasilitas</Link></li>
              <li><Link href="/#jadwal" className="text-sm text-slate-400 hover:text-blue-400 transition">Jadwal Praktik</Link></li>
              <li><Link href="/reservasi" className="text-sm text-slate-400 hover:text-blue-400 transition">Pendaftaran Antrean</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Medis */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Layanan Kami</h4>
            <ul className="space-y-3">
              <li className="text-sm text-slate-400">Poli Umum</li>
              <li className="text-sm text-slate-400">Poli Gigi</li>
              <li className="text-sm text-slate-400">Kesehatan Ibu & Anak (KIA)</li>
              <li className="text-sm text-slate-400">Laboratorium Dasar</li>
              <li className="text-sm text-slate-400">Farmasi / Apotek</li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & Alamat */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-blue-500 text-lg leading-none">📍</span>
                <span>Jl. Raya Cipatik, Cihampelas, Bandung Barat.</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-blue-500 text-lg leading-none">📞</span>
                <span>(022) XXXXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-blue-500 text-lg leading-none">✉️</span>
                <span>info@klinikcipatik.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Kolom Bawah: Copyright */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {currentYear} Klinik Pratama Cipatik. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 