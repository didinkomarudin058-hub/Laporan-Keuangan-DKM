import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { FundCategory, MosqueProfile, Transaction } from '../types';

interface DashboardOverviewProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
  selectedMonth: number; // 1-12
  selectedYear: number;
  onOpenAddModal: (defaultCategory?: FundCategory) => void;
  onNavigateTab: (tab: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
  onSelectFundFilter: (fund: FundCategory | 'semua') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  mosqueProfile,
  selectedMonth,
  selectedYear,
  onOpenAddModal,
  onNavigateTab,
  onSelectFundFilter,
}) => {
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

  // Fund Categories definitions
  const fundList: {
    name: FundCategory;
    description: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
  }[] = [
    {
      name: 'Kas Operasional',
      description: 'Infaq Jumat, Kebersihan, Listrik, Syahriyah Imam & Marbot',
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badgeText: 'Kas Utama',
      borderAccent: 'border-l-4 border-l-emerald-600',
    },
    {
      name: 'Kas Pembangunan',
      description: 'Renovasi fisik, perluasan area, kubah & menara masjid',
      icon: <Building className="w-5 h-5 text-blue-600" />,
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      badgeText: 'Renovasi',
      borderAccent: 'border-l-4 border-l-blue-600',
    },
    {
      name: 'Kas Yatim & Sosial',
      description: 'Santunan anak yatim, bantuan dhuafa & paket sembako',
      icon: <HeartHandshake className="w-5 h-5 text-amber-600" />,
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      badgeText: 'Sosial Umat',
      borderAccent: 'border-l-4 border-l-amber-500',
    },
    {
      name: 'Kas Zakat & Shadaqah',
      description: 'Zakat Fitrah, Zakat Maal & Distribusi Mustahik',
      icon: <CircleDollarSign className="w-5 h-5 text-purple-600" />,
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      badgeText: 'ZIS',
      borderAccent: 'border-l-4 border-l-purple-600',
    },
  ];

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

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 6);

  const monthNamesIndonesian = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Transparansi Heading */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Building className="w-72 h-72 text-white" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 text-amber-300 text-xs px-3 py-1 rounded-full font-medium border border-emerald-700/60">
            <ShieldCheck className="w-3.5 h-3.5" /> Transparansi Kas DKM Berkelanjutan
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ikhtisar Keuangan Kas {mosqueProfile.namaMasjid}
          </h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Pencatatan kas terbuka, akuntabel, dan rapi untuk seluruh dana infaq jamaah, pembangunan, serta santunan sosial.
          </p>
        </div>
      </div>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Utama */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Saldo Seluruh Kas
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Rp {totalCombinedBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Aktif</span> per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Total Pemasukan Bulan Ini */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pemasukan {monthNamesIndonesian[selectedMonth - 1]}
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight flex items-baseline gap-1">
              <span>Rp {currentMonthIncome.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Infaq, donatur, & zakat</span>
            </p>
          </div>
        </div>

        {/* Total Pengeluaran Bulan Ini */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pengeluaran {monthNamesIndonesian[selectedMonth - 1]}
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-rose-700 tracking-tight">
              Rp {currentMonthExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>Operasional & pembangunan</span>
            </p>
          </div>
        </div>

        {/* Surplus / Defisit Bulan Ini */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surplus Neto Bulan Ini
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              currentMonthNet >= 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-bold tracking-tight ${
              currentMonthNet >= 0 ? 'text-amber-700' : 'text-rose-600'
            }`}>
              Rp {currentMonthNet.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentMonthNet >= 0 ? 'Surplus kas terkendali' : 'Defisit bulan berjalan'}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown per Jenis Kas (4 Account Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-700" />
            Rincian Kas per Pos/Kategori Dana
          </h3>
          <span className="text-xs text-slate-500">
            Klik pos kas untuk memfilter transaksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fundBalances.map((fund) => (
            <div 
              key={fund.name}
              className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm ${fund.borderAccent} hover:shadow-md transition flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {fund.icon}
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {fund.name}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${fund.badgeBg}`}>
                    {fund.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {fund.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">Saldo Akumulasi:</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    Rp {fund.balance.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Masuk (Bln Ini):</span>
                    <span className="font-semibold text-emerald-700">+Rp {fund.monthIncome.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Keluar (Bln Ini):</span>
                    <span className="font-semibold text-rose-600">-Rp {fund.monthExpense.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectFundFilter(fund.name);
                    onNavigateTab('transactions');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Jurnal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenAddModal(fund.name)}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-medium px-2 py-1 rounded flex items-center gap-1 transition"
                >
                  <PlusCircle className="w-3 h-3 text-emerald-600" />
                  <span>+ Catat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Split Section: Recent Transactions & Public Transparency Bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                Transaksi Terakhir Recorded
              </h3>
              <p className="text-xs text-slate-500">Mutasi kas terbeli & terverifikasi oleh bendahara DKM</p>
            </div>
            
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <span>Semua Jurnal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kategori & Pos Kas</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{trx.kategori}</div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100 inline-block mt-0.5">
                        {trx.danaKat}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600">
                      {trx.keterangan}
                      {trx.donatur && (
                        <span className="block text-[11px] text-slate-400 italic">
                          Donatur: {trx.donatur}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold">
                      {trx.jenis === 'pemasukan' ? (
                        <span className="text-emerald-700">+Rp {trx.jumlah.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-rose-600">-Rp {trx.jumlah.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 col): Papan Informasi Transparansi Jamaah */}
        <div className="bg-gradient-to-b from-slate-900 to-emerald-950 text-white rounded-xl p-5 border border-emerald-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Transparansi Jamaah</h3>
              </div>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-400/30">
                Papan Pengumuman
              </span>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Ringkasan kas dapat dicetak atau ditampilkan di monitor masjid sebelum Shalat Jumat.
            </p>

            {/* Bank Rekening Info Box */}
            <div className="bg-emerald-900/60 p-3.5 rounded-lg border border-emerald-700/60 space-y-2">
              <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Rekening Resmi DKM</span>
                <span className="text-[10px] text-amber-300">Infaq Transfer</span>
              </div>
              <div className="font-mono text-sm font-bold text-white tracking-wide">
                {mosqueProfile.nomorRekening}
              </div>
              <div className="text-xs text-emerald-200">
                {mosqueProfile.namaBank} a.n <span className="font-semibold text-white">{mosqueProfile.anRekening}</span>
              </div>
            </div>

            {/* Infaq Jumat Highlight */}
            <div className="bg-emerald-950/80 p-3.5 rounded-lg border border-emerald-800 space-y-1">
              <div className="text-xs text-emerald-300 font-medium">
                Penerimaan Infaq Kotak Jumat Terakhir:
              </div>
              <div className="text-base font-bold text-amber-400">
                Rp {(transactions
                  .filter(t => t.kategori.toLowerCase().includes('jumat'))
                  .reduce((max, t) => t.jumlah > max ? t.jumlah : max, 0)
                ).toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-emerald-200/70">
                Amanah dikelola untuk operasional & kemakmuran masjid.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800/60 flex flex-col gap-2">
            <button
              onClick={() => onNavigateTab('monthlyReport')}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak Laporan Bulanan PDF / Buletin</span>
            </button>
            <button
              onClick={() => onNavigateTab('tvMode')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka Layar Display Monitor Masjid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
