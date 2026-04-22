import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-700">
          Klinik Pratama Cipatik
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-slate-600 hover:text-blue-600 font-medium">Beranda</Link>
          <Link href="/#layanan" className="text-slate-600 hover:text-blue-600 font-medium">Layanan</Link>
          <Link href="/#jadwal" className="text-slate-600 hover:text-blue-600 font-medium">Jadwal Dokter</Link>
        </nav>
        <Link href="/reservasi" className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">
          Daftar Antrean
        </Link>
      </div>
    </header>
  );
}