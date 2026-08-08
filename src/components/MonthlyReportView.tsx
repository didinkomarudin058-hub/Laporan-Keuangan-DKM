import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Calendar, 
  Building2, 
  Loader2, 
  Copy, 
  Check, 
  Wallet,
  Filter,
  RotateCcw,
  Tag
} from 'lucide-react';
import { MosqueProfile, Transaction, FundCategory } from '../types';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (month: number, year: number) => void;
  categoriesPemasukan?: string[];
  categoriesPengeluaran?: string[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  mosqueProfile,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
  categoriesPemasukan = [],
  categoriesPengeluaran = [],
}) => {
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Interactive Filters State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('semua');
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>('semua');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Helper date strings
  const currentMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const [startDateFilter, setStartDateFilter] = useState<string>(`${currentMonthStr}-01`);
  const [endDateFilter, setEndDateFilter] = useState<string>(`${currentMonthStr}-${String(lastDayOfMonth).padStart(2, '0')}`);

  // Reset date range filters when quick month/year selector changes
  useEffect(() => {
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    setStartDateFilter(`${currentMonthStr}-01`);
    setEndDateFilter(`${currentMonthStr}-${String(lastDay).padStart(2, '0')}`);
  }, [selectedMonth, selectedYear, currentMonthStr]);

  // Date formatting helper
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const mIdx = parseInt(m, 10) - 1;
    if (mIdx < 0 || mIdx > 11) return dateStr;
    return `${parseInt(d, 10)} ${monthNames[mIdx]} ${y}`;
  };

  const effectiveStartDate = startDateFilter || `${currentMonthStr}-01`;
  const effectiveEndDate = endDateFilter || `${currentMonthStr}-${String(lastDayOfMonth).padStart(2, '0')}`;

  const periodDateRangeStr = `${formatDateIndo(effectiveStartDate)} s/d ${formatDateIndo(effectiveEndDate)}`;
  const periodDateRangeStrUpper = periodDateRangeStr.toUpperCase();

  // 1. Calculate Saldo Awal (Transactions before effectiveStartDate)
  const priorTransactions = transactions.filter((t) => t.tanggal < effectiveStartDate);
  const priorIncome = priorTransactions
    .filter((t) => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);
  const priorExpense = priorTransactions
    .filter((t) => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);
  const startingBalance = priorIncome - priorExpense;

  // 2. Base Transactions in selected date range (spans across any months / years freely)
  const periodTransactions = transactions.filter((t) => {
    if (effectiveStartDate && t.tanggal < effectiveStartDate) return false;
    if (effectiveEndDate && t.tanggal > effectiveEndDate) return false;
    return true;
  });

  // 3. Filtered Transactions based on Category & Pos Dana Kas
  const filteredPeriodTransactions = periodTransactions.filter((t) => {
    if (selectedCategoryFilter !== 'semua' && t.kategori !== selectedCategoryFilter) return false;
    if (selectedFundFilter !== 'semua' && t.danaKat !== selectedFundFilter) return false;
    return true;
  });

  const periodIncomeDetails = periodTransactions.filter((t) => t.jenis === 'pemasukan');
  const periodExpenseDetails = periodTransactions.filter((t) => t.jenis === 'pengeluaran');

  const totalIncome = periodIncomeDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const totalExpense = periodExpenseDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const endingBalance = startingBalance + totalIncome - totalExpense;

  // Filtered Summaries
  const filteredIncomeDetails = filteredPeriodTransactions.filter((t) => t.jenis === 'pemasukan');
  const filteredExpenseDetails = filteredPeriodTransactions.filter((t) => t.jenis === 'pengeluaran');

  const filteredIncomeTotal = filteredIncomeDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const filteredExpenseTotal = filteredExpenseDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const filteredNetFlow = filteredIncomeTotal - filteredExpenseTotal;

  // Dynamic list of categories present
  const availableCategories = Array.from(
    new Set([
      ...categoriesPemasukan,
      ...categoriesPengeluaran,
      ...periodTransactions.map((t) => t.kategori),
    ])
  ).sort();

  // 4. Breakdown per Pos Kas for selected date range
  const fundCategories: FundCategory[] = [
    'Kas Operasional',
    'Kas Pembangunan',
    'Kas Yatim & Sosial',
    'Kas Zakat & Shadaqah',
  ];

  const fundBreakdown = fundCategories.map((cat) => {
    // Prior balance
    const pT = priorTransactions.filter((t) => t.danaKat === cat);
    const pInc = pT.filter((t) => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const pExp = pT.filter((t) => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    const catStart = pInc - pExp;

    // Period
    const pPeriod = periodTransactions.filter((t) => t.danaKat === cat);
    const catInc = pPeriod.filter((t) => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const catExp = pPeriod.filter((t) => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    const catEnd = catStart + catInc - catExp;

    return {
      kategori: cat,
      saldoAwal: catStart,
      pemasukan: catInc,
      pengeluaran: catExp,
      saldoAkhir: catEnd,
    };
  });

  // Reset interactive filters
  const handleResetFilters = () => {
    setSelectedCategoryFilter('semua');
    setSelectedFundFilter('semua');
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    setStartDateFilter(`${currentMonthStr}-01`);
    setEndDateFilter(`${currentMonthStr}-${String(lastDay).padStart(2, '0')}`);
  };

  const defaultStart = `${currentMonthStr}-01`;
  const defaultEnd = `${currentMonthStr}-${String(new Date(selectedYear, selectedMonth, 0).getDate()).padStart(2, '0')}`;
  const isFilterActive =
    selectedCategoryFilter !== 'semua' ||
    selectedFundFilter !== 'semua' ||
    startDateFilter !== defaultStart ||
    endDateFilter !== defaultEnd;

  // Call Gemini API server endpoint
  const handleGenerateAiNarrative = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/summarize-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masjidName: mosqueProfile.namaMasjid,
          monthYear: periodDateRangeStr,
          startingBalance,
          totalIncome,
          totalExpense,
          endingBalance,
          fundBreakdown,
          incomeDetails: periodIncomeDetails,
          expenseDetails: periodExpenseDetails,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal terhubung ke layanan AI Gemini.');
      }

      setAiNarrative(data.narrative);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Terjadi kesalahan saat memproses narasi AI.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyNarrative = () => {
    if (!aiNarrative) return;
    navigator.clipboard.writeText(aiNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Laporan Keuangan Kas Interaktif
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis rekapitulasi kas, filter bebas rentang awal/akhir (antar bulan & tahun), serta narasi AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Month/Year Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200" title="Pilih Bulan & Tahun Cepat">
            <Calendar className="w-4 h-4 text-emerald-700 ml-1" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthYearChange(Number(e.target.value), selectedYear)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onMonthYearChange(selectedMonth, Number(e.target.value))}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer border-l border-slate-300 pl-2"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* AI Narration Generator Button */}
          <button
            onClick={handleGenerateAiNarrative}
            disabled={isLoadingAi}
            className="bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-amber-300 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-2 border border-emerald-700/80 transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingAi ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isLoadingAi ? 'Menyusun Narasi AI...' : 'Buat Narasi AI Shalat Jumat'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrintReport}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Buletin</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Control Panel */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Filter Rentang Tanggal & Kategori Laporan</h3>
            <span className="text-xs text-amber-300 font-mono font-semibold">({periodDateRangeStr})</span>
          </div>
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter 1: Rentang Awal ( Bebas antar bulan / tahun ) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Rentang Awal
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Filter 2: Rentang Akhir ( Bebas antar bulan / tahun ) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Rentang Akhir
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Filter 3: Kategori Transaksi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-400" /> Kategori Transaksi
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="semua">Semua Kategori ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Pos Dana Kas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Wallet className="w-3 h-3 text-emerald-400" /> Pos Dana Kas
            </label>
            <select
              value={selectedFundFilter}
              onChange={(e) => setSelectedFundFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="semua">Semua Pos Kas</option>
              {fundCategories.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Filter Metric KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pemasukan Tersaring</span>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5">
              +Rp {filteredIncomeTotal.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400">{filteredIncomeDetails.length} Transaksi</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pengeluaran Tersaring</span>
            <div className="text-base font-extrabold text-rose-400 mt-0.5">
              -Rp {filteredExpenseTotal.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400">{filteredExpenseDetails.length} Transaksi</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Arus Net Filter</span>
            <div className={`text-base font-extrabold mt-0.5 ${filteredNetFlow >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              Rp {filteredNetFlow.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400">Selisih Net Periode</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Saldo Kas Akhir</span>
            <div className="text-base font-extrabold text-white mt-0.5">
              Rp {endingBalance.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Akumulasi Kas Periode</span>
          </div>
        </div>
      </div>

      {/* AI Narrative Section */}
      {aiNarrative && (
        <div className="bg-emerald-950 text-white rounded-xl p-5 border border-emerald-800 shadow-md space-y-3 print:hidden">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                Narasi Resmi AI Pengumuman Shalat Jumat & Buletin
              </h3>
            </div>
            <button
              onClick={handleCopyNarrative}
              className="bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1 border border-emerald-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-emerald-100/90 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-emerald-900/50 p-4 rounded-lg border border-emerald-800">
            {aiNarrative}
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs print:hidden">
          <span className="font-bold">Error Gemini AI:</span> {aiError}
        </div>
      )}

      {/* Official Printable Statement Sheet */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-md space-y-6 print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Kop Surat Masjid */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-amber-300 font-bold border-2 border-emerald-600 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                DEWAN KEMAKMURAN MASJID (DKM)
              </h1>
              <h2 className="text-lg font-bold text-emerald-800 uppercase tracking-wide">
                {mosqueProfile.namaMasjid}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {mosqueProfile.alamat}, {mosqueProfile.kota} • Telp: {mosqueProfile.telepon}
          </p>
          <p className="text-[11px] text-slate-500 italic">
            Email: {mosqueProfile.email} | Rekening Infaq: {mosqueProfile.namaBank} {mosqueProfile.nomorRekening} a.n {mosqueProfile.anRekening}
          </p>
        </div>

        {/* Title Statement */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 inline-block px-4 pb-0.5">
            LAPORAN KEUANGAN KAS MASJID
          </h3>
          <p className="text-xs font-semibold text-slate-700">
            PERIODE: {periodDateRangeStrUpper}
            {isFilterActive && (
              <span className="text-emerald-700 font-bold ml-2">
                (Tersaring: {selectedCategoryFilter !== 'semua' ? `Kat: ${selectedCategoryFilter}` : ''} {selectedFundFilter !== 'semua' ? `Pos: ${selectedFundFilter}` : ''})
              </span>
            )}
          </p>
        </div>

        {/* Top Summary Table (Rekapitulasi Utama) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded">
            I. REKAPITULASI POSISI KAS MASJID PER POS DANA
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">No</th>
                  <th className="p-2 border-r border-slate-300">Pos Dana Kas</th>
                  <th className="p-2 text-right border-r border-slate-300">Saldo Awal (Rp)</th>
                  <th className="p-2 text-right border-r border-slate-300">Pemasukan (Rp)</th>
                  <th className="p-2 text-right border-r border-slate-300">Pengeluaran (Rp)</th>
                  <th className="p-2 text-right">Saldo Akhir (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                {fundBreakdown.map((item, idx) => (
                  <tr key={item.kategori} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-semibold">{item.kategori}</td>
                    <td className="p-2 border-r border-slate-300 text-right">{item.saldoAwal.toLocaleString('id-ID')}</td>
                    <td className="p-2 border-r border-slate-300 text-right text-emerald-800 font-medium">+{item.pemasukan.toLocaleString('id-ID')}</td>
                    <td className="p-2 border-r border-slate-300 text-right text-rose-800 font-medium">-{item.pengeluaran.toLocaleString('id-ID')}</td>
                    <td className="p-2 text-right font-bold">{item.saldoAkhir.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-100/80 font-bold border-t-2 border-slate-900 text-slate-900 text-xs">
                  <td colSpan={2} className="p-2.5 text-center border-r border-slate-300 uppercase">TOTAL KAS GABUNGAN</td>
                  <td className="p-2.5 border-r border-slate-300 text-right">{startingBalance.toLocaleString('id-ID')}</td>
                  <td className="p-2.5 border-r border-slate-300 text-right text-emerald-900">+{totalIncome.toLocaleString('id-ID')}</td>
                  <td className="p-2.5 border-r border-slate-300 text-right text-rose-900">-{totalExpense.toLocaleString('id-ID')}</td>
                  <td className="p-2.5 text-right font-extrabold text-sm">{endingBalance.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Income Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              II. RINCIAN PEMASUKAN DANA ({periodDateRangeStr})
            </h4>
            <span className="text-xs font-bold text-emerald-800">
              Total: +Rp {filteredIncomeTotal.toLocaleString('id-ID')}
            </span>
          </div>

          {filteredIncomeDetails.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-2">Tidak ada transaksi pemasukan sesuai kriteria filter.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Tgl</th>
                  <th className="p-2 border-r border-slate-300">Kategori & Pos Kas</th>
                  <th className="p-2 border-r border-slate-300">Keterangan / Donatur</th>
                  <th className="p-2 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIncomeDetails.map((inc) => (
                  <tr key={inc.id}>
                    <td className="p-2 border-r border-slate-300 whitespace-nowrap font-mono">{inc.tanggal}</td>
                    <td className="p-2 border-r border-slate-300 font-medium">
                      <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 mr-1 font-semibold">
                        {inc.kategori}
                      </span>
                      <span className="text-slate-500">({inc.danaKat})</span>
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      {inc.keterangan} {inc.donatur ? `[Donatur: ${inc.donatur}]` : ''}
                    </td>
                    <td className="p-2 text-right font-semibold text-emerald-800">
                      +{inc.jumlah.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detailed Expense Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              III. RINCIAN PENGELUARAN DANA ({periodDateRangeStr})
            </h4>
            <span className="text-xs font-bold text-rose-800">
              Total: -Rp {filteredExpenseTotal.toLocaleString('id-ID')}
            </span>
          </div>

          {filteredExpenseDetails.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-2">Tidak ada transaksi pengeluaran sesuai kriteria filter.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Tgl</th>
                  <th className="p-2 border-r border-slate-300">Kategori & Pos Kas</th>
                  <th className="p-2 border-r border-slate-300">Keterangan Pengeluaran</th>
                  <th className="p-2 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExpenseDetails.map((exp) => (
                  <tr key={exp.id}>
                    <td className="p-2 border-r border-slate-300 whitespace-nowrap font-mono">{exp.tanggal}</td>
                    <td className="p-2 border-r border-slate-300 font-medium">
                      <span className="bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200 mr-1 font-semibold">
                        {exp.kategori}
                      </span>
                      <span className="text-slate-500">({exp.danaKat})</span>
                    </td>
                    <td className="p-2 border-r border-slate-300">{exp.keterangan}</td>
                    <td className="p-2 text-right font-semibold text-rose-800">
                      -{exp.jumlah.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Signatures Section */}
        <div className="pt-8 border-t border-slate-300">
          <div className="text-xs text-slate-600 text-right font-medium mb-6">
            {mosqueProfile.kota}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div className="grid grid-cols-3 text-center gap-4 text-xs font-semibold">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 mt-0.5">Ketua DKM {mosqueProfile.namaMasjid}</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4">
                ({mosqueProfile.ketuaDKM})
              </p>
            </div>

            <div>
              <p className="text-slate-500">Penyusun Laporan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Bendahara DKM</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4">
                ({mosqueProfile.bendaharaDKM})
              </p>
            </div>

            <div>
              <p className="text-slate-500">Verifikator,</p>
              <p className="font-bold text-slate-900 mt-0.5">Sekretaris DKM</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4">
                ({mosqueProfile.sekretarisDKM})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
