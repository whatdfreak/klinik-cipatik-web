export default function Footer() {
    return (
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Klinik Pratama Cipatik</h3>
            <p className="text-sm">Jl. Raya Cipatik, Kec. Cihampelas, Kab. Bandung Barat.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kontak</h3>
            <p className="text-sm">Telepon: (022) XXXXXXXX</p>
            <p className="text-sm">Email: info@klinikcipatik.com</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Jam Operasional</h3>
            <p className="text-sm">Senin - Minggu: 08.00 - 21.00 WIB</p>
          </div>
        </div>
      </footer>
    );
  }