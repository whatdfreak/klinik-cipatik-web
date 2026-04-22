import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans text-slate-800">
      {/* HERO SECTION */}
      <section className="bg-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Kesehatan Keluarga Anda, <br className="hidden lg:block" />
            <span className="text-blue-600">Prioritas Utama Kami</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Klinik Pratama Cipatik melayani masyarakat dengan sepenuh hati. Fasilitas modern, tenaga medis profesional, dan pelayanan yang ramah untuk senyum sehat Anda.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/reservasi" className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-blue-700 shadow-lg transition">
              Reservasi Online Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="layanan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Layanan Medis Kami</h2>
            <p className="mt-4 text-slate-600">Fasilitas kesehatan komprehensif untuk berbagai kebutuhan Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Poli Umum', 'Poli Gigi', 'Kesehatan Ibu & Anak (KIA)', 'Laboratorium'].map((service) => (
              <div key={service} className="p-6 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition bg-slate-50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl font-bold">
                  +
                </div>
                <h3 className="text-xl font-semibold mb-2">{service}</h3>
                <p className="text-slate-600 text-sm">Pelayanan {service.toLowerCase()} terbaik dengan peralatan medis standar terkini.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}