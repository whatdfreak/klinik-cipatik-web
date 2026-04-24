import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="kontak" className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg inline-block">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z"/></svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Fasilitas Kesehatan Tingkat Pertama (FKTP) modern yang berdedikasi memberikan pelayanan medis terpadu, aman, dan profesional untuk keluarga Anda.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Tautan Cepat</h3>
            <ul className="space-y-3.5 text-sm">
              <li><Link href="/" className="hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Beranda</Link></li>
              <li><Link href="/#layanan" className="hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Fasilitas & Layanan</Link></li>
              <li><Link href="/#jadwal" className="hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Jadwal Praktik</Link></li>
              <li><Link href="/#tim-medis" className="hover:text-teal-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Tim Medis Profesional</Link></li>
              <li><Link href="/reservasi" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Reservasi Online →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <a href={siteConfig.contact.mapsLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 leading-relaxed hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm flex flex-col">
                  {siteConfig.contact.address.map((line, index) => (
                    <span key={index}>{line}</span>
                  ))}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <svg className="w-5 h-5 text-teal-500 shrink-0 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:${siteConfig.contact.phone.raw}`} className="text-slate-400 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">
                  {siteConfig.contact.phone.display} (Telepon)
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <svg className="w-5 h-5 text-[#25D366] shrink-0 group-hover:text-[#1ebe57] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
                <a href={`https://wa.me/${siteConfig.contact.wa.raw}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">
                  {siteConfig.contact.wa.display} (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <svg className="w-5 h-5 text-teal-500 shrink-0 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${siteConfig.contact.email}`} className="text-slate-400 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Lokasi Klinik</h3>
            <div className="w-full h-32 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative group cursor-pointer">
              <iframe 
                title="Peta Lokasi Klinik Pratama Cipatik" 
                src={siteConfig.contact.mapsEmbed} 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'contrast(0.9) opacity(0.8)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-300 group-hover:filter-none"
              ></iframe>
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div>
            </div>
            <a href={siteConfig.contact.mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 mt-3 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">
              Buka di Google Maps &nearr;
            </a>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/kebijakan-privasi" className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm">Syarat & Ketentuan</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}