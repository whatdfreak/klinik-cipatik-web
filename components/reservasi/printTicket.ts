import type { BookingInfo } from "./types";

/**
 * Opens a new window with a styled printable ticket and triggers print dialog.
 */
export function printTicket(ticket: BookingInfo) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Tiket - ${ticket.kode}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
          .ticket { background: #ffffff; border: 2px dashed #cbd5e1; padding: 32px; border-radius: 24px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .header h1 { margin: 0; color: #0f766e; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .kode-box { background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 24px; text-align: center; }
          .kode-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
          .kode { font-size: 32px; font-weight: 900; color: #0f766e; letter-spacing: 3px; font-family: monospace; margin: 0; }
          .detail { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
          .detail:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 600; }
          .value { font-weight: 700; color: #334155; text-align: right; max-width: 200px; word-break: break-word; }
          .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #94a3b8; font-weight: 600; line-height: 1.5; padding: 16px; background: #f8fafc; border-radius: 12px; }
          @media print {
            body { padding: 0; background: none; }
            .ticket { border: 2px solid #cbd5e1; box-shadow: none; max-width: 100%; border-radius: 16px; padding: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>Klinik Pratama Cipatik</h1>
            <p>Tiket Reservasi Mandiri</p>
          </div>
          <div class="kode-box">
            <div class="kode-label">Kode Check-In</div>
            <div class="kode">${ticket.kode}</div>
          </div>
          <div class="detail"><span class="label">Nama Pasien</span><span class="value">${ticket.nama}</span></div>
          <div class="detail"><span class="label">Tanggal</span><span class="value">${new Date(ticket.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
          <div class="detail"><span class="label">Poli/Sesi</span><span class="value">${ticket.poli}<br/><span style="font-size:12px;color:#0f766e;">(${ticket.sesi.includes('Pagi') ? 'Pagi' : 'Sore'})</span></span></div>
          <div class="footer">Tunjukkan tiket ini kepada petugas pendaftaran<br/>Klinik Pratama Cipatik.</div>
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 250); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
