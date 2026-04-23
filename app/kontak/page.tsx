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
                    (022) XXXXXXXX <br />
                    +62 812-XXXX-XXXX (WhatsApp)
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
                href="https://wa.me/6281200000000" 
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126744.60699026402!2d107.45892556536551!3d-6.917463999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e815b2!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
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