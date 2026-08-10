import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, QrCode, Tv, Calendar, HeartHandshake, CircleDollarSign, Building, Wallet, Sparkles } from 'lucide-react';
import { MosqueProfile, Transaction } from '../types';

interface PublicDisplayBoardProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
}

export const PublicDisplayBoard: React.FC<PublicDisplayBoardProps> = ({
  transactions,
  mosqueProfile,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute balances
  const totalCombinedIncome = transactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalCombinedExpense = transactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalBalance = totalCombinedIncome - totalCombinedExpense;

  // Balance per category
  const getFundBalance = (catName: string) => {
    const catT = transactions.filter(t => t.danaKat === catName);
    const inc = catT.filter(t => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const exp = catT.filter(t => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    return inc - exp;
  };

  const operasionalBal = getFundBalance('Kas Operasional');
  const pembangunanBal = getFundBalance('Kas Pembangunan');

  const formatDateDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
    return dateStr;
  };

  // Last Friday Infaq Amount
  const fridayInfaqTrx = transactions
    .filter(t => t.kategori.toLowerCase().includes('jumat'))
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];

  return (
    <div className="bg-slate-950 text-white min-h-[85vh] rounded-2xl p-6 sm:p-8 border border-emerald-900 shadow-2xl space-y-8 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-amber-300 shadow-lg border border-emerald-400/30 shrink-0 overflow-hidden">
            {mosqueProfile.logoUrl ? (
              <img
                src={mosqueProfile.logoUrl}
                alt="Logo Masjid"
                className="w-full h-full object-contain p-1 bg-white rounded-2xl"
              />
            ) : (
              <Building2 className="w-9 h-9" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-400/40 uppercase tracking-widest">
                PAPAN TRANSPARANSI KAS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              {mosqueProfile.namaMasjid}
            </h1>
            <p className="text-emerald-200/80 text-xs">
              {mosqueProfile.alamat}, {mosqueProfile.kota}
            </p>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="bg-emerald-950/80 border border-emerald-800 px-5 py-3 rounded-xl text-right shrink-0">
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-wider">
            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
          </div>
          <div className="text-xs text-emerald-200 font-medium">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Hero Highlight: Total Saldo Kas Utama */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 sm:p-8 rounded-2xl border-2 border-amber-400/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            TOTAL SALDO SELURUH KAS MASJID (SISA AKUMULASI)
          </span>
          <div className="text-3xl sm:text-5xl font-black text-amber-300 tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-emerald-100/80">
            Amanah dikelola oleh Dewan Kemakmuran Masjid (DKM) secara terbuka & dilaporkan berkala.
          </p>
        </div>

        <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60 text-right shrink-0 relative z-10">
          <div className="text-xs text-emerald-300 font-semibold uppercase">Penerimaan Infaq Jumat Terakhir</div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Rp {(fridayInfaqTrx?.jumlah || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-amber-300 mt-0.5">
            Tgl {fridayInfaqTrx ? formatDateDDMMYYYY(fridayInfaqTrx.tanggal) : '-'} • Jazakumullah Khairan Katsiran
          </div>
        </div>
      </div>

      {/* Grid 2 Pos Kas Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kas Operasional */}
        <div className="bg-emerald-900/40 border border-emerald-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Kas Operasional
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            Rp {operasionalBal.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-200/70">
            Listrik, Kebersihan, Honorarium Imam & Marbot
          </p>
        </div>

        {/* Kas Pembangunan */}
        <div className="bg-emerald-900/40 border border-emerald-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Building className="w-4 h-4 text-blue-400" />
            Kas Pembangunan
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            Rp {pembangunanBal.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-200/70">
            Renovasi fisik, tempat wudhu, & perawatan gedung
          </p>
        </div>
      </div>

      {/* Bottom Row: Donation Rekening & Digital QRIS Barcode Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-950 p-6 rounded-2xl border border-emerald-800">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Salurkan Infaq & Sedekah Terbaik Anda
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji." (QS. Al-Baqarah: 261)
          </p>

          <div className="bg-emerald-900/80 p-4 rounded-xl border border-emerald-700/80 space-y-1">
            <div className="text-xs text-emerald-300 font-semibold">Rekening Bank Resmi DKM:</div>
            <div className="text-lg font-mono font-bold text-amber-300">
              {mosqueProfile.namaBank}: {mosqueProfile.nomorRekening}
            </div>
            <div className="text-xs text-white">
              Atas Nama: <span className="font-bold">{mosqueProfile.anRekening}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl text-slate-900 shadow-inner space-y-2">
          <div className="w-32 h-32 bg-slate-100 border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center p-2 text-center">
            <QrCode className="w-20 h-20 text-slate-900" />
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider mt-1">
              SCAN QRIS MASJID
            </span>
          </div>
          <div className="text-[10px] font-bold text-center text-slate-700">
            Mendukung QRIS Seluruh Bank & E-Wallet
          </div>
        </div>
      </div>
    </div>
  );
};
