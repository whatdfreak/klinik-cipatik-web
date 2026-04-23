import Link from "next/link";

export default function TentangKamiPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* Header/Hero Section */}
      <div className="bg-blue-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Tentang Klinik Pratama Cipatik
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
            Melayani masyarakat Cipatik, Cihampelas, dan sekitarnya dengan fasilitas kesehatan tingkat pertama yang profesional, ramah, dan terjangkau.
          </p>
        </div>
      </div>

      {/* Visi & Misi Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card Visi */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative z-10">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-2xl border border-blue-100 shadow-sm">
              👁️
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Visi Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Menjadi fasilitas kesehatan tingkat pertama yang paling dipercaya dan diandalkan oleh masyarakat Bandung Barat, dengan mengedepankan kualitas medis berstandar tinggi dan pelayanan sepenuh hati.
            </p>
          </div>

          {/* Card Misi */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative z-10">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-2xl border border-blue-100 shadow-sm">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Misi Kami</h2>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Memberikan pelayanan kesehatan yang cepat, tanggap, dan akurat untuk seluruh kalangan pasien.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Menyediakan fasilitas medis yang bersih, aman, dan memadai sesuai standar Kemenkes.
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                Membangun lingkungan kerja yang kolaboratif dan profesional bagi seluruh tenaga kesehatan.
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Nilai-Nilai Inti (Core Values) Section */}
      <div className="bg-white py-20 border-t border-slate-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Nilai-Nilai Inti Klinik</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 transition hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Profesional</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ditangani langsung oleh tenaga medis, dokter, dan bidan yang bersertifikasi resmi serta berpengalaman di bidangnya.
              </p>
            </div>
            
            <div className="p-6 transition hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Empati</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Kami selalu berusaha mendengar, memahami, dan merawat keluhan setiap pasien layaknya keluarga kami sendiri.
              </p>
            </div>
            
            <div className="p-6 transition hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Integritas</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Transparan dan jujur dalam memberikan diagnosis, rincian tindakan medis, serta biaya demi kenyamanan pasien.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action (CTA) Bottom */}
      <div className="bg-blue-50 py-16 text-center border-t border-blue-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Percayakan Kesehatan Anda Pada Kami</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Tim medis Klinik Pratama Cipatik siap melayani Anda setiap hari. Jangan ragu untuk melakukan pendaftaran antrean secara online.
        </p>
        <Link 
          href="/reservasi" 
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
        >
          Daftar Antrean Sekarang
        </Link>
      </div>

    </div>
  );
}