import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi | Klinik Pratama Cipatik",
};

export default function KebijakanPrivasi() {
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
                <span className="text-slate-800" aria-current="page">Kebijakan Privasi</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kebijakan Privasi</h1>
          {/* Menggunakan tanggal statis untuk dokumen legal */}
          <p className="text-slate-500 mb-10 pb-6 border-b border-slate-100">Draf Revisi Terakhir: 23 April 2026</p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Pengumpulan Data Pasien</h2>
            <p>Klinik Pratama Cipatik berkomitmen untuk melindungi kerahasiaan data rekam medis pasien sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia (Permenkes RI). Data yang dikumpulkan melalui formulir pendaftaran daring (online) hanya digunakan untuk kepentingan administratif dan tata laksana medis.</p>
            
            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Penggunaan Informasi</h2>
            <p>Informasi identitas (KTP/NIK) dan status asuransi (BPJS/Swasta) digunakan secara eksklusif untuk memvalidasi hak pasien atas fasilitas kesehatan. Kami tidak akan memperjualbelikan atau mendistribusikan data Anda kepada pihak ketiga yang tidak berkepentingan.</p>

            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Keamanan Data</h2>
            <p>Sistem reservasi kami menggunakan infrastruktur komputasi awan yang dienkripsi guna mencegah akses yang tidak sah terhadap rekam medis elektronik (RME) Anda.</p>

            <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl mt-12">
              <p className="text-teal-900 text-sm font-medium">Dokumen ini adalah draf kerangka tata tertib (placeholder). Konten resmi akan diisi oleh pihak manajemen dan legal Klinik Pratama Cipatik menjelang perilisan publik.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}