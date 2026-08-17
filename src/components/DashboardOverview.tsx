import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building, 
  HeartHandshake, 
  CircleDollarSign, 
  PlusCircle, 
  Calendar, 
  ChevronRight, 
  QrCode, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles,
  Coins,
  Camera
} from 'lucide-react';
import { FundCategory, MosqueProfile, Transaction } from '../types';
import { ReceiptModal } from './ReceiptModal';

interface DashboardOverviewProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
  selectedMonth: number; // 1-12
  selectedYear: number;
  posDanaList?: string[];
  onOpenAddModal?: (defaultCategory?: FundCategory) => void;
  onNavigateTab: (tab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onSelectFundFilter: (fund: FundCategory | 'semua') => void;
  readOnly?: boolean;
  onOpenQrModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  mosqueProfile,
  selectedMonth,
  selectedYear,
  posDanaList = ['Kas Operasional', 'Kas Pembangunan'],
  onOpenAddModal,
  onNavigateTab,
  onSelectFundFilter,
  readOnly = false,
  onOpenQrModal,
}) => {
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaction | null>(null);
  // Compute overall financial totals
  const totalCombinedIncome = transactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalCombinedExpense = transactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalCombinedBalance = totalCombinedIncome - totalCombinedExpense;

  // Compute current month totals
  const currentMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  
  const currentMonthTransactions = transactions.filter(t => t.tanggal.startsWith(currentMonthStr));
  
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const currentMonthNet = currentMonthIncome - currentMonthExpense;

  // Default Preset definitions for known fund categories
  const presets: Record<string, {
    description: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
  }> = {
    'Kas Operasional': {
      description: 'Infaq Jumat, Kebersihan, Listrik, Syahriyah Imam & Marbot',
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badgeText: 'Kas Utama',
      borderAccent: 'border-l-4 border-l-emerald-600',
    },
    'Kas Pembangunan': {
      description: 'Renovasi fisik, perluasan area, kubah & menara masjid',
      icon: <Building className="w-5 h-5 text-blue-600" />,
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      badgeText: 'Renovasi',
      borderAccent: 'border-l-4 border-l-blue-600',
    },
  };

  // Build dynamic fundList from posDanaList
  const fundList = posDanaList.map((fundName) => {
    if (presets[fundName]) {
      return {
        name: fundName,
        ...presets[fundName],
      };
    }
    return {
      name: fundName,
      description: `Pos dana khusus DKM ${fundName}`,
      icon: <Coins className="w-5 h-5 text-teal-600" />,
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
      badgeText: 'Pos Dana',
      borderAccent: 'border-l-4 border-l-teal-600',
    };
  });

  // Calculate balance per fund category
  const fundBalances = fundList.map(fund => {
    const fundT = transactions.filter(t => t.danaKat === fund.name);
    const inc = fundT.filter(t => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const exp = fundT.filter(t => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    const bal = inc - exp;
    
    // Month specific for fund
    const mFundT = currentMonthTransactions.filter(t => t.danaKat === fund.name);
    const mInc = mFundT.filter(t => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const mExp = mFundT.filter(t => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);

    return {
      ...fund,
      balance: bal,
      monthIncome: mInc,
      monthExpense: mExp,
    };
  });

  const formatDateDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
    return dateStr;
  };

  // Recent 6 transactions sorted from start date (ascending date)
  const recentTransactions = [...transactions]
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, 6);

  const monthNamesIndonesian = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {mosqueProfile.logoUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-1 shadow-lg border-2 border-emerald-400/40 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={mosqueProfile.logoUrl}
                  alt="Logo Masjid"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-emerald-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  DKM Dashboard
                </span>
                <span className="text-emerald-200 text-xs flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Terverifikasi & Akuntabel
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mosqueProfile.namaMasjid}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-sans max-w-2xl leading-relaxed">
                "{mosqueProfile.motto}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Kas Gabungan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Kas Gabungan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {totalCombinedBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Akumulasi dari {posDanaList.length} Pos Dana Kas DKM
            </p>
          </div>
        </div>

        {/* Total Pemasukan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Inflow {monthNamesIndonesian[selectedMonth - 1]} {selectedYear}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              +Rp {currentMonthIncome.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Penerimaan Kas Bulan Ini
            </p>
          </div>
        </div>

        {/* Total Pengeluaran Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Outflow {monthNamesIndonesian[selectedMonth - 1]} {selectedYear}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              -Rp {currentMonthExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Total Operasional & Belanja
            </p>
          </div>
        </div>

        {/* Net Flow Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Arus Kas Net Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black tracking-tight ${currentMonthNet >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {currentMonthNet >= 0 ? '+' : ''}Rp {currentMonthNet.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Surplus / Defisit Kas Bulan Ini
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown 4 Pos Dana Kas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-700" />
            Rincian Saldo Kas per Pos Dana
          </h2>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Jurnal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fundBalances.map((item) => (
            <div
              key={item.name}
              className={`bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition ${item.borderAccent} space-y-2.5 flex flex-col justify-between`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.icon}
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">{item.name}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                    {item.badgeText}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">
                  {item.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Saldo Kas
                  </span>
                  <div className="text-base font-black text-slate-900">
                    Rp {item.balance.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-emerald-50/60 p-1.5 rounded-md border border-emerald-100 flex items-center justify-between">
                    <span className="text-emerald-800 font-semibold text-[9px]">Masuk</span>
                    <span className="font-bold text-emerald-700 text-[10px]">+Rp {item.monthIncome.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-rose-50/60 p-1.5 rounded-md border border-rose-100 flex items-center justify-between">
                    <span className="text-rose-800 font-semibold text-[9px]">Keluar</span>
                    <span className="font-bold text-rose-700 text-[10px]">-Rp {item.monthExpense.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-0.5">
                  {!readOnly && onOpenAddModal && (
                    <button
                      onClick={() => onOpenAddModal(item.name)}
                      className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md border border-emerald-200 transition text-center cursor-pointer"
                    >
                      + Catat Kas
                    </button>
                  )}
                  <button
                    onClick={() => onSelectFundFilter(item.name)}
                    className={`${readOnly ? 'w-full' : 'py-1 px-2.5'} py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-md transition text-center cursor-pointer`}
                    title="Lihat rincian mutasi pos ini"
                  >
                    {readOnly ? 'Lihat Mutasi Kas' : 'Mutasi'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mutasi Table & QRIS Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Transaksi Kas Terbaru
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Jurnal Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Belum ada transaksi dicatat.
              </p>
            ) : (
              recentTransactions.map((trx) => (
                <div key={trx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 max-w-[65%]">
                    <p className="font-bold text-slate-900 text-xs leading-snug">{trx.keterangan}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {trx.kategori}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {trx.danaKat}
                      </span>
                      {trx.buktiUrl && (
                        <button
                          type="button"
                          onClick={() => setActiveReceiptTrx(trx)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 cursor-pointer"
                          title="Klik untuk melihat bukti foto / struk"
                        >
                          <Camera className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Bukti</span>
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>{formatDateDDMMYYYY(trx.tanggal)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-black text-sm ${trx.jenis === 'pemasukan' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {trx.jenis === 'pemasukan' ? '+' : '-'}Rp {trx.jumlah.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block">{trx.metodePembayaran}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Information Rekening & QRIS */}
        <div className="bg-gradient-to-b from-slate-900 to-emerald-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <QrCode className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">
                Rekening Infaq Resmi DKM
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Salurkan infaq, shadaqah & zakat Anda melalui rekening resmi masjid:
            </p>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                {mosqueProfile.namaBank}
              </span>
              <div className="text-base font-extrabold text-white font-mono tracking-wider">
                {mosqueProfile.nomorRekening}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                a.n {mosqueProfile.anRekening}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparan & Real-Time</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Seluruh laporan kas dan foto nota dapat dipantau langsung oleh jamaah melalui barcode transparansi masjid.
            </p>
            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Barcode Transparansi Jamaah</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Image Lightbox Modal */}
      <ReceiptModal
        isOpen={!!activeReceiptTrx}
        onClose={() => setActiveReceiptTrx(null)}
        transaction={activeReceiptTrx}
      />
    </div>
  );
};
