import React from 'react';
import { X, Printer, Share2, CheckCircle2, ShieldCheck, MapPin, Calendar, Building2, Phone } from 'lucide-react';
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
  if (!isOpen || !tenant) return null;

  const receiptNumber = `KW-SEWA-${new Date().getFullYear()}${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}-${tenant.id.slice(-4).toUpperCase()}`;

  const diskonPersen = tenant.diskonPersen || 0;
  const tarifNormal = tenant.tarifSewa || 0;
  const nominalPotongan = (tarifNormal * diskonPersen) / 100;
  const nominal = tenant.tarifSetelahDiskon !== undefined 
    ? tenant.tarifSetelahDiskon 
    : Math.max(0, tarifNormal - nominalPotongan);

  const terbilangText = nominal > 0 ? `${angkaKeTerbilang(nominal)} Rupiah` : 'Nol Rupiah';

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = tenant.nomorTelepon.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const diskonMsg = diskonPersen > 0 
      ? `• Tarif Normal: Rp ${tarifNormal.toLocaleString('id-ID')}\n• Potongan Operasional: ${diskonPersen}% (-Rp ${nominalPotongan.toLocaleString('id-ID')}) ${tenant.keteranganDiskon ? `[${tenant.keteranganDiskon}]` : ''}\n` 
      : '';

    const message = encodeURIComponent(
      `*BUKTI PEMBAYARAN SEWA LAHAN / TANAH WAKAF*\n` +
      `*${mosqueProfile.namaMasjid}*\n\n` +
      `Assalamu'alaikum Wr. Wb. Bpk/Ibu ${tenant.namaPenyewa},\n` +
      `Terima kasih telah melakukan pembayaran sewa lahan wakaf:\n` +
      `• No. Kwitansi: ${receiptNumber}\n` +
      `• Objek: ${tenant.namaLahan} (${tenant.peruntukanUsaha})\n` +
      `• Luas: ${tenant.luasLahan || '-'}\n` +
      diskonMsg +
      `• Jumlah Diterima: Rp ${nominal.toLocaleString('id-ID')} (${terbilangText})\n` +
      `• Status: LUNAS & Tercatat di Kas DKM\n\n` +
      `Semoga usaha yang dijalankan berkah dan lancar selalu. Aamiin.\n` +
      `_Pengurus DKM / Sie Aset & Wakaf ${mosqueProfile.namaMasjid}_`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Kwitansi Resmi Sewa Lahan DKM</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable) */}
        <div className="p-8 bg-white text-slate-900 font-serif border-8 border-double border-emerald-900/20 m-4 rounded-xl relative">
          {/* Header Kop Masjid */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h2 className="text-xl font-bold tracking-wide uppercase font-sans text-emerald-950">
              {mosqueProfile.namaMasjid}
            </h2>
            <p className="text-xs font-sans text-slate-600">
              {mosqueProfile.alamat}, {mosqueProfile.kota}
            </p>
            <p className="text-[11px] font-sans text-slate-500">
              Telp: {mosqueProfile.telepon} • Rekening: {mosqueProfile.namaBank} ({mosqueProfile.nomorRekening})
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-sans mb-4">
            <span className="font-bold uppercase tracking-wider text-emerald-900 border border-emerald-800 px-2 py-0.5 rounded">
              KWITANSI SEWA LAHAN WAKAF
            </span>
            <span className="font-mono text-slate-600">
              No: <strong className="text-slate-900">{receiptNumber}</strong>
            </span>
          </div>

          {/* Receipt Form Rows */}
          <div className="space-y-3 text-xs font-sans leading-relaxed">
            <div className="flex items-baseline gap-2">
              <span className="w-36 shrink-0 text-slate-600 font-semibold">Telah diterima dari</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                {tenant.namaPenyewa} {tenant.nomorTelepon ? `(${tenant.nomorTelepon})` : ''}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="w-36 shrink-0 text-slate-600 font-semibold">Uang Sejumlah</span>
              <span className="text-slate-400">:</span>
              <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex-1 italic">
                # {terbilangText} #
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="w-36 shrink-0 text-slate-600 font-semibold">Untuk Pembayaran</span>
              <span className="text-slate-400">:</span>
              <span className="text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                Sewa Objek: <strong>{tenant.namaLahan}</strong> ({tenant.peruntukanUsaha}), Luas: {tenant.luasLahan || '-'}
              </span>
            </div>

            {diskonPersen > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="w-36 shrink-0 text-amber-800 font-semibold">Potongan Operasional</span>
                <span className="text-slate-400">:</span>
                <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium flex-1">
                  <strong>{diskonPersen}%</strong> (Alokasi Ops Rp {nominalPotongan.toLocaleString('id-ID')}) {tenant.keteranganDiskon ? `— ${tenant.keteranganDiskon}` : ''}
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="w-36 shrink-0 text-slate-600 font-semibold">Masa Kontrak</span>
              <span className="text-slate-400">:</span>
              <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                {new Date(tenant.tanggalMulai).toLocaleDateString('id-ID')} s.d.{' '}
                {new Date(tenant.tanggalSelesai).toLocaleDateString('id-ID')} ({tenant.tipePeriode.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Nominal Box & Signature */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-end justify-between font-sans">
            <div className="bg-slate-100 border-2 border-slate-300 p-3 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Jumlah Terbayar:</span>
              <div className="text-lg font-mono font-extrabold text-emerald-900">
                Rp {nominal.toLocaleString('id-ID')}
              </div>
              {diskonPersen > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  (Tarif Normal: Rp {tarifNormal.toLocaleString('id-ID')})
                </span>
              )}
            </div>

            <div className="text-center text-xs space-y-1">
              <p className="text-slate-600">
                {mosqueProfile.kota.split(',')[0] || 'Bekasi'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[11px] font-bold text-slate-700">Pengurus DKM / Bendahara</p>
              <div className="h-12 flex items-center justify-center">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest border border-emerald-600/40 px-2 py-0.5 rounded bg-emerald-50/50">
                  LUNAS / DKM
                </span>
              </div>
              <p className="font-bold text-slate-900 underline underline-offset-2">
                {mosqueProfile.bendaharaDKM || 'H. Mohammad Ridwan, SE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
