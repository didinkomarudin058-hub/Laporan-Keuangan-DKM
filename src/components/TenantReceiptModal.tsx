import React, { useState, useEffect } from 'react';
import { X, Printer, Phone, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { LandTenant, MosqueProfile, TenantPaymentRecord } from '../types';

interface TenantReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: LandTenant | null;
  paymentRecord?: TenantPaymentRecord | null;
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
  paymentRecord,
  mosqueProfile,
}) => {
  const [bulanTahun, setBulanTahun] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  });

  const [statusBayar, setStatusBayar] = useState<'lunas' | 'belum_lunas'>('lunas');
  const [customNominal, setCustomNominal] = useState<number>(0);
  const [customSisa, setCustomSisa] = useState<number>(0);

  useEffect(() => {
    if (isOpen && tenant) {
      const tarifSebelumPotongan = tenant.tarifSewa || 0;

      if (paymentRecord) {
        if (paymentRecord.periode) {
          setBulanTahun(paymentRecord.periode.replace(/^Bulan\s+/i, ''));
        }

        if (paymentRecord.statusBayar === 'cicilan') {
          const dibayar = paymentRecord.nominalAsli || paymentRecord.nominal || 0;
          setCustomNominal(dibayar);
          const sisa =
            paymentRecord.sisaKurangBayar !== undefined
              ? paymentRecord.sisaKurangBayar
              : Math.max(0, tarifSebelumPotongan - dibayar);
          setCustomSisa(sisa);
          setStatusBayar('belum_lunas');
        } else {
          // Status LUNAS: selalu gunakan tarif asli penuh sebelum potongan
          setCustomNominal(tarifSebelumPotongan);
          setCustomSisa(0);
          setStatusBayar('lunas');
        }
      } else {
        const now = new Date();
        setBulanTahun(now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
        // Default selalu Lunas dengan Tarif Asli penuh
        setCustomNominal(tarifSebelumPotongan);
        setCustomSisa(0);
        setStatusBayar('lunas');
      }
    }
  }, [isOpen, tenant, paymentRecord]);

  if (!isOpen || !tenant) return null;

  // Nominal murni sebelum potongan (Tarif Asli)
  const tarifSewaSebelumPotongan = tenant.tarifSewa || 0;

  const receiptNumber =
    paymentRecord?.noKwitansi ||
    `KW-SEWA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${tenant.id.slice(-4).toUpperCase()}`;

  const isLunas = statusBayar === 'lunas';
  // Jika lunas, selalu gunakan tarif asli murni sebelum potongan
  const nominal = isLunas ? tarifSewaSebelumPotongan : (customNominal || 0);
  const sisaKurangBayar = isLunas ? 0 : (customSisa !== undefined ? customSisa : Math.max(0, tarifSewaSebelumPotongan - nominal));
  const terbilangText = nominal > 0 ? `${angkaKeTerbilang(nominal)} Rupiah` : 'Nol Rupiah';

  // Titimangsa: ambil desa atau kota
  const titimangsaKota = (() => {
    if (mosqueProfile.desa) {
      const d = mosqueProfile.desa.replace(/^desa\s+/gi, '').replace(/^kelurahan\s+/gi, '').trim();
      return d;
    }
    if (mosqueProfile.kota) {
      return mosqueProfile.kota.split(',')[0].trim();
    }
    return 'Bekasi';
  })();

  const handlePrint = () => {
    window.print();
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
      (isLunas
        ? `Terima kasih telah melakukan pembayaran sewa:\n`
        : `Terima kasih telah melakukan pembayaran sewa (Cicilan / Sebagian):\n`) +
      `• No. Kwitansi: ${receiptNumber}\n` +
      `• Keterangan: Bayar sewa bulan ${bulanTahun}\n` +
      `• Objek: ${tenant.namaLahan} (${tenant.kategori || tenant.peruntukanUsaha || 'Sewa Lahan'})\n` +
      `• Luas: ${tenant.luasLahan || '-'}\n` +
      `• Tarif Sewa: Rp ${tarifSewaSebelumPotongan.toLocaleString('id-ID')}\n` +
      `• Jumlah Diterima: Rp ${nominal.toLocaleString('id-ID')} (${terbilangText})\n` +
      (!isLunas ? `• Sisa Belum Bayar: Rp ${sisaKurangBayar.toLocaleString('id-ID')}\n` : '') +
      `• Status: ${isLunas ? 'LUNAS (Tercatat di Kas DKM)' : 'BELUM LUNAS (Kurang Bayar)'}\n\n` +
      (!isLunas ? `Mohon dapat melunasi sisa tagihan sebelum jatuh tempo. Jazakumullah khairan katsiran.\n\n` : `Semoga usaha yang dijalankan berkah dan lancar selalu. Aamiin.\n`) +
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
          className="bg-slate-900 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2 print:hidden shrink-0 border-b border-slate-800"
        >
          <span className="text-xs font-bold flex items-center gap-1.5 text-white">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Kwitansi Sewa</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status Selector */}
            <select
              value={statusBayar}
              onChange={(e) => {
                const next = e.target.value as 'lunas' | 'belum_lunas';
                setStatusBayar(next);
                if (next === 'lunas') {
                  setCustomNominal(tarifSewaSebelumPotongan);
                  setCustomSisa(0);
                }
              }}
              className={`text-xs font-bold px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                statusBayar === 'lunas'
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                  : 'bg-amber-900 text-amber-100 border-amber-600'
              }`}
            >
              <option value="lunas">LUNAS</option>
              <option value="belum_lunas">BELUM LUNAS (CICILAN)</option>
            </select>

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
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kwitansi Body (Printable Card) */}
        <div className="overflow-y-auto p-3 sm:p-4 bg-slate-50/50 flex-1">
          <div
            id="kwitansi-print-card"
            className={`p-5 sm:p-6 bg-white text-slate-900 font-sans border-2 rounded-xl relative shadow-sm ${
              isLunas ? 'border-emerald-900/40' : 'border-amber-700/60'
            }`}
          >
            {/* Header Kop Masjid */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-3.5">
              <div className="flex items-center justify-center gap-2.5 mb-1">
                {mosqueProfile.logoUrl ? (
                  <img
                    src={mosqueProfile.logoUrl}
                    alt="Logo Masjid"
                    className="w-10 h-10 object-contain rounded-full border border-emerald-700 p-0.5 bg-white shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-emerald-800 text-white rounded-full flex items-center justify-center font-bold border border-emerald-600 shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="text-left sm:text-center">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Dewan Kemakmuran Masjid (DKM)
                  </p>
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight uppercase text-emerald-950 leading-tight">
                    {mosqueProfile.namaMasjid}
                  </h2>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                {[
                  mosqueProfile.alamat ? mosqueProfile.alamat.replace(/,\s*$/, '') : '',
                  mosqueProfile.desa ? `Desa ${mosqueProfile.desa.replace(/^desa\s+/gi, '')}` : '',
                  mosqueProfile.kecamatan ? `Kec. ${mosqueProfile.kecamatan.replace(/^kec\.?\s+/gi, '')}` : '',
                  mosqueProfile.kota || ''
                ].filter(Boolean).join(' ')}
              </p>
              {(mosqueProfile.telepon || mosqueProfile.nomorRekening) && (
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {[
                    mosqueProfile.telepon ? `Telp: ${mosqueProfile.telepon}` : '',
                    mosqueProfile.nomorRekening ? `Rek. Infaq: ${mosqueProfile.namaBank || 'Bank'} ${mosqueProfile.nomorRekening} a.n ${mosqueProfile.anRekening || mosqueProfile.namaMasjid}` : ''
                  ].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>

            {/* Receipt Title & Number */}
            <div className="flex items-center justify-between text-[11px] mb-3.5 pb-1 border-b border-slate-200">
              {isLunas ? (
                <span className="font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/80 border border-emerald-700/30 px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>KWITANSI PEMBAYARAN SEWA - LUNAS</span>
                </span>
              ) : (
                <span className="font-bold uppercase tracking-wider text-amber-950 bg-amber-100/90 border border-amber-600/40 px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>KWITANSI SEWA - BELUM LUNAS (CICILAN)</span>
                </span>
              )}
              <span className="font-mono text-[11px] text-slate-600">
                No: <strong className="text-slate-900">{receiptNumber}</strong>
              </span>
            </div>

            {/* Receipt Form Rows */}
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Telah Diterima Dari</span>
                <span className="text-slate-400">:</span>
                <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-xs">
                  {tenant.namaPenyewa}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">
                  {isLunas ? 'Uang Sejumlah' : 'Uang Diterima (Cicilan)'}
                </span>
                <span className="text-slate-400">:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded border flex-1 italic text-[11px] ${
                  isLunas 
                    ? 'text-emerald-950 bg-emerald-50/80 border-emerald-300' 
                    : 'text-amber-950 bg-amber-50/80 border-amber-300'
                }`}>
                  # {terbilangText} #
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Untuk Pembayaran</span>
                <span className="text-slate-400">:</span>
                <span className="text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-[11px]">
                  Sewa bulan <strong>{bulanTahun}</strong> ({isLunas ? 'Pelunasan Penuh' : 'Pembayaran Cicilan / Sebagian'}) — Objek: <strong>{tenant.namaLahan}</strong> ({tenant.kategori || tenant.peruntukanUsaha || 'Sewa Lahan'}), Luas: {tenant.luasLahan || '-'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Tarif Sewa</span>
                <span className="text-slate-400">:</span>
                <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 pb-0.5 text-[11px] font-mono font-semibold">
                  Rp {tarifSewaSebelumPotongan.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="w-32 shrink-0 text-slate-600 font-semibold text-[11px]">Status Pelunasan</span>
                <span className="text-slate-400">:</span>
                <span className="flex-1 pb-0.5 text-[11px] font-bold">
                  {isLunas ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      LUNAS (Tercatat di Kas DKM)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      BELUM LUNAS — Sisa Kurang Bayar: Rp {sisaKurangBayar.toLocaleString('id-ID')}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Nominal Box & Signature */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className={`border-2 px-3 py-2 rounded-lg shadow-2xs ${
                  isLunas 
                    ? 'bg-emerald-50/70 border-emerald-800/30 text-emerald-950' 
                    : 'bg-amber-50/80 border-amber-700/40 text-amber-950'
                }`}>
                  <span className="text-[9px] uppercase font-bold block opacity-80">
                    {isLunas ? 'Jumlah Terbayar (Lunas):' : 'Jumlah Diterima Saat Ini:'}
                  </span>
                  <div className="text-base sm:text-lg font-mono font-extrabold">
                    Rp {nominal.toLocaleString('id-ID')}
                  </div>
                </div>

                {!isLunas && (
                  <div className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded text-[10px] text-rose-800 font-semibold flex items-center justify-between gap-2">
                    <span>Sisa Belum Bayar:</span>
                    <span className="font-mono font-bold">Rp {sisaKurangBayar.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] space-y-0.5 min-w-[140px]">
                <p className="text-slate-600 text-[10px]">
                  {titimangsaKota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-[10px] font-bold text-slate-700">Pengurus DKM / Bendahara</p>
                <div className="h-9 flex items-center justify-center my-0.5">
                  {isLunas ? (
                    <span className="text-[9px] text-emerald-800 font-black uppercase tracking-widest border-2 border-emerald-600 px-2 py-0.5 rounded bg-emerald-50 rotate-[-3deg] shadow-2xs">
                      LUNAS / DKM
                    </span>
                  ) : (
                    <span className="text-[9px] text-amber-900 font-black uppercase tracking-widest border-2 border-amber-600 px-2 py-0.5 rounded bg-amber-50 rotate-[-3deg] shadow-2xs">
                      BELUM LUNAS
                    </span>
                  )}
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

