import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan | Klinik Pratama Cipatik",
};

export default function SyaratKetentuan() {
  return (
    <div className="bg-slate-50 pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation Professional */}
        <nav className="flex text-sm text-slate-500 mb-8 font-medium" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-teal-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">
                Beranda
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-slate-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-slate-800" aria-current="page">Syarat & Ketentuan</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Syarat & Ketentuan Pelayanan</h1>
          {/* Menggunakan tanggal statis untuk dokumen legal */}
          <p className="text-slate-500 mb-10 pb-6 border-b border-slate-100">Draf Revisi Terakhir: 23 April 2026</p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Persetujuan Umum</h2>
            <p>Dengan mengakses situs web ini dan melakukan reservasi daring (online), pasien dianggap telah memahami dan menyetujui seluruh prosedur operasional dan tata tertib yang berlaku di lingkungan Klinik Pratama Cipatik.</p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Reservasi & Kedatangan</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pasien wajib hadir selambat-lambatnya 15 menit sebelum estimasi jadwal panggilan.</li>
              <li>Sistem antrean daring hanya berfungsi sebagai pengambilan nomor awal. Pasien tetap diwajibkan melakukan validasi fisik (KTP/Kartu BPJS) di loket pendaftaran.</li>
              <li>Keterlambatan yang melebihi 3 nomor antrean berhak membuat petugas memprioritaskan pasien lain yang telah hadir.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Penggunaan Jaminan (BPJS)</h2>
            <p>Bagi pasien BPJS Kesehatan, keabsahan dan keaktifan kartu merupakan tanggung jawab pasien. Klinik berhak menagihkan tarif pasien umum apabila sistem BPJS mendeteksi tunggakan atau ketidaksesuaian Fasilitas Kesehatan Tingkat Pertama (Faskes 1).</p>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mt-12">
              <p className="text-amber-900 text-sm font-medium">Peringatan: Laman ini berisi struktur draf (placeholder). Syarat dan ketentuan hukum yang mengikat akan disediakan oleh tim operasional klinik.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}