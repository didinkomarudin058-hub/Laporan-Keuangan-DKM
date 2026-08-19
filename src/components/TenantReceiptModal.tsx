import React, { useState, useEffect } from 'react';
import { X, Printer, Phone, Building2 } from 'lucide-react';
import { LandTenant, MosqueProfile } from '../types';

interface TenantReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: LandTenant | null;
  mosqueProfile: MosqueProfile;
}

function angkaKeTerbilang(angka: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];
  if (angka < 12) return bilangan[angka];
  if (angka < 20) return bilangan[angka - 10] + ' Belas';
  if (angka < 100) return bilangan[Math.floor(angka / 10)] + ' Puluh ' + (angka % 10 !== 0 ? ' ' + bilangan[angka % 10] : '');
  if (angka < 200) return 'Seratus ' + (angka % 100 !== 0 ? angkaKeTerbilang(angka - 100) : '');
  if (angka < 1000)
    return (
      bilangan[Math.floor(angka / 100)] +
      ' Ratus ' +
      (angka % 100 !== 0 ? angkaKeTerbilang(angka % 100) : '')
    );
  if (angka < 2000) return 'Seribu ' + (angka % 1000 !== 0 ? angkaKeTerbilang(angka - 1000) : '');
  if (angka < 1000000)
    return (
      angkaKeTerbilang(Math.floor(angka / 1000)) +
      ' Ribu ' +
      (angka % 1000 !== 0 ? angkaKeTerbilang(angka % 1000) : '')
    );
  if (angka < 1000000000)
    return (
      angkaKeTerbilang(Math.floor(angka / 1000000)) +
      ' Juta ' +
      (angka % 1000000 !== 0 ? angkaKeTerbilang(angka % 1000000) : '')
    );
  if (angka < 1000000000000)
    return (
      angkaKeTerbilang(Math.floor(angka / 1000000000)) +
      ' Miliar ' +
      (angka % 1000000000 !== 0 ? angkaKeTerbilang(angka % 1000000000) : '')
    );
  return angka.toString();
}

export const TenantReceiptModal: React.FC<TenantReceiptModalProps> = ({
  isOpen,
  onClose,
  tenant,
  mosqueProfile,
}) => {
  const [bulanTahun, setBulanTahun] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  });

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setBulanTahun(now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
    }
    return () => {
      document.body.classList.remove('print-kwitansi-active');
    };
  }, [isOpen]);

  if (!isOpen || !tenant) return null;

  const receiptNumber = `KW-SEWA-${new Date().getFullYear()}${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${tenant.id.slice(-4).toUpperCase()}`;

  // Nominal kwitansi adalah nominal ASLI / SEBELUM POTONGAN sesuai permintaan
  const nominal = tenant.tarifSewa || 0;
  const terbilangText = nominal > 0 ? `${angkaKeTerbilang(nominal)} Rupiah` : 'Nol Rupiah';

  const handlePrint = () => {
    document.body.classList.add('print-kwitansi-active');

    const handleAfterPrint = () => {
      document.body.classList.remove('print-kwitansi-active');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    // Give browser brief tick to compute layout before opening print window
    setTimeout(() => {
      window.print();
      // Fallback cleanup if afterprint doesn't fire
      setTimeout(() => {
        document.body.classList.remove('print-kwitansi-active');
      }, 2000);
    }, 100);
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = (tenant.nomorTelepon || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = encodeURIComponent(
      `*BUKTI PEMBAYARAN SEWA*\n` +
      `*${mosqueProfile.namaMasjid}*\n\n` +
      `Assalamu'alaikum Wr. Wb. Bpk/Ibu ${tenant.namaPenyewa},\n` +
      `Terima kasih telah melakukan pembayaran sewa:\n` +
      `• No. Kwitansi: ${receiptNumber}\n` +
      `• Keterangan: Bayar sewa bulan ${bulanTahun}\n` +
      `• Objek: ${tenant.namaLahan} (${tenant.kategori || tenant.peruntukanUsaha || 'Sewa Lahan'})\n` +
      `• Luas: ${tenant.luasLahan || '-'}\n` +
      `• Jumlah Diterima: Rp ${nominal.toLocaleString('id-ID')} (${terbilangText})\n` +
      `• Status: LUNAS & Tercatat di Kas DKM\n\n` +
      `Semoga usaha yang dijalankan berkah dan lancar selalu. Aamiin.\n` +
      `_Pengurus DKM / Sie Aset & Wakaf ${mosqueProfile.namaMasjid}_`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div
      id="kwitansi-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="kwitansi-modal-dialog"
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Controls Bar (Hidden in Print) */}
        <div
          id="kwitansi-modal-header"
          className="bg-slate-900 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden shrink-0"
        >
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Kwitansi Sewa</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              <label className="text-[10px] text-slate-400">Bulan:</label>
              <input
                type="text"
                value={bulanTahun}
                onChange={(e) => setBulanTahun(e.target.value)}
                placeholder="misal: Agustus 2026"
                className="bg-transparent text-white text-[11px] font-semibold focus:outline-none w-24 sm:w-28 border-b border-emerald-500/50 px-0.5"
              />
            </div>

            {tenant.nomorTelepon && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Kirim ke WhatsApp Penyewa"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="w-3 h-3" />
              <span>Cetak / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.body.classList.remove('print-kwitansi-active');
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable Card) */}
        <div className="overflow-y-auto p-2.5 sm:p-3">
          <div
            id="kwitansi-print-card"
            className="p-4 sm:p-5 bg-white text-slate-900 font-sans border-2 border-dashed border-emerald-800/30 rounded-lg relative"
          >
            {/* Header Kop Masjid */}
            <div className="text-center border-b-2 border-slate-900 pb-2.5 mb-3">
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-emerald-950 leading-tight">
                {mosqueProfile.namaMasjid}
              </h2>
              <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                {[mosqueProfile.alamat, mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '', mosqueProfile.kota].filter(Boolean).join(', ')}
              </p>
              {(mosqueProfile.telepon || mosqueProfile.nomorRekening) && (
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {[
                    mosqueProfile.telepon ? `Telp: ${mosqueProfile.telepon}` : '',
                    mosqueProfile.nomorRekening ? `Rek: ${mosqueProfile.namaBank || 'Bank'} ${mosqueProfile.nomorRekening}` : ''
                  ].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            {/* Receipt Title & Number */}
            <div className="flex items-center justify-between text-[11px] mb-3">
              <span className="font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/70 border border-emerald-800/30 px-2 py-0.5 rounded text-[10px]">
                KWITANSI BUKTI PEMBAYARAN SEWA
              </span>
              <span className="font-mono text-[11px] text-slate-600">
                No: <strong className="text-slate-900">{receiptNumber}</strong>
              </span>
            </div>

            {/* Receipt Form Rows */}
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Telah diterima dari</span>
                <span className="text-slate-400">:</span>
                <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                  {tenant.namaPenyewa}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Uang Sejumlah</span>
                <span className="text-slate-400">:</span>
                <span className="font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex-1 italic text-[11px]">
                  # {terbilangText} #
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Untuk Pembayaran</span>
                <span className="text-slate-400">:</span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-[11px]">
                  Bayar sewa bulan <strong>{bulanTahun}</strong> — Objek: <strong>{tenant.namaLahan}</strong> ({tenant.kategori || tenant.peruntukanUsaha || 'Sewa Lahan'}), Luas: {tenant.luasLahan || '-'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Kategori Sewa</span>
                <span className="text-slate-400">:</span>
                <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-[11px]">
                  {tenant.kategori || 'Sewa Lahan Wakaf'} ({tenant.tipePeriode.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Nominal Box & Signature */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-end justify-between">
              <div className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Jumlah Terbayar:</span>
                <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-900">
                  Rp {nominal.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="text-center text-[11px] space-y-0.5">
                <p className="text-slate-600 text-[10px]">
                  {(mosqueProfile.kota || 'Bekasi').split(',')[0]}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-[10px] font-bold text-slate-700">Pengurus DKM / Bendahara</p>
                <div className="h-9 flex items-center justify-center">
                  <span className="text-[9px] text-emerald-800 font-bold uppercase tracking-widest border border-emerald-600/40 px-2 py-0.5 rounded bg-emerald-50/50">
                    LUNAS / DKM
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline underline-offset-2 text-[11px]">
                  {mosqueProfile.bendaharaDKM || 'Pengurus DKM'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
