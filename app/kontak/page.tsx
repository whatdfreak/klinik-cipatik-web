import Link from "next/link";

export default function KontakPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 pb-20">
      
      {/* Header Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hubungi Kami
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Kami siap mendengar, membantu, dan melayani kebutuhan kesehatan Anda. Jangan ragu untuk menghubungi tim kami.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bagian Informasi Kontak & CTA WhatsApp */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informasi Kontak</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 text-xl">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Alamat Klinik</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    Jl. Raya Cipatik, Kec. Cihampelas, <br />
                    Kabupaten Bandung Barat, Jawa Barat.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 text-xl">
                  📞
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Telepon & WhatsApp</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    0899-9801-472 (Telepon)<br />
                    0899-9801-472 (WhatsApp)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 text-xl">
                  ✉️
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    info@klinikcipatik.com
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Button CTA - Direct to WhatsApp */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3">Butuh Bantuan Cepat?</h3>
              <a 
                href="https://wa.me/628999801472" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3.5 rounded-lg font-bold transition shadow-sm"
              >
                <span>💬</span> Chat via WhatsApp
              </a>
              <p className="text-xs text-slate-500 text-center mt-3">
                Tim admin kami membalas pesan pada jam operasional (08.00 - 20.00 WIB).
              </p>
            </div>
          </div>

          {/* Bagian Peta (Google Maps Embed) */}
          <div className="bg-white p-2 rounded-2xl shadow-md border border-slate-100 h-[500px] overflow-hidden relative">
            {/* Placeholder untuk Google Maps. Di tahap produksi, ganti URL src ini dengan link Embed asli dari Google Maps klinik Anda */}
            <iframe 
              src="https://maps.google.com/maps?q=Klinik+Pratama+Cipatik,+Kabupaten+Bandung+Barat&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '0.75rem' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Klinik Cipatik"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}