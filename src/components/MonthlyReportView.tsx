import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Calendar, 
  Building2, 
  Wallet,
  Filter,
  RotateCcw,
  Tag,
  CalendarDays,
  QrCode
} from 'lucide-react';
import { MosqueProfile, Transaction } from '../types';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (month: number, year: number) => void;
  categoriesPemasukan?: string[];
  categoriesPengeluaran?: string[];
  posDanaList?: string[];
  onOpenQrModal?: () => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  mosqueProfile,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
  categoriesPemasukan = [],
  categoriesPengeluaran = [],
  posDanaList = ['Kas Operasional', 'Kas Pembangunan'],
  onOpenQrModal,
}) => {
  // Period Mode State: 'bulanan' | 'tahunan' | 'custom'
  const [reportPeriodType, setReportPeriodType] = useState<'bulanan' | 'tahunan' | 'custom'>('bulanan');

  // Interactive Filters State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('semua');
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>('semua');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Dynamic Year Options
  const yearOptions = Array.from(
    new Set([
      new Date().getFullYear(),
      selectedYear,
      ...transactions.map((t) => new Date(t.tanggal).getFullYear()).filter((y) => !isNaN(y)),
      2025,
      2026,
    ])
  ).sort((a, b) => b - a);

  // Helper date strings
  const currentMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const [startDateFilter, setStartDateFilter] = useState<string>(`${currentMonthStr}-01`);
  const [endDateFilter, setEndDateFilter] = useState<string>(`${currentMonthStr}-${String(lastDayOfMonth).padStart(2, '0')}`);

  // Automatically adjust start and end date based on reportPeriodType, selectedMonth, selectedYear
  useEffect(() => {
    if (reportPeriodType === 'bulanan') {
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const mStr = String(selectedMonth).padStart(2, '0');
      setStartDateFilter(`${selectedYear}-${mStr}-01`);
      setEndDateFilter(`${selectedYear}-${mStr}-${String(lastDay).padStart(2, '0')}`);
    } else if (reportPeriodType === 'tahunan') {
      setStartDateFilter(`${selectedYear}-01-01`);
      setEndDateFilter(`${selectedYear}-12-31`);
    }
  }, [reportPeriodType, selectedMonth, selectedYear]);

  // Date formatting helper for DD-MM-YYYY (e.g. 28-08-1989)
  const formatDateDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
    return dateStr;
  };

  // Helper for titimangsa location (only village name, no 'Desa' prefix, no kab/prov/kec)
  const getTitimangsaVillage = (profile: MosqueProfile) => {
    if (profile.desa && profile.desa.trim()) {
      let v = profile.desa.trim();
      v = v.replace(/^desa\s+/gi, '').replace(/^kelurahan\s+/gi, '').replace(/^kel\.\s+/gi, '').trim();
      return v;
    }
    const raw = profile.kota || profile.alamat || '';
    if (!raw) return '';

    const parts = raw.split(',');
    for (const part of parts) {
      const p = part.trim();
      if (/kabupaten|kab\b|kab\.|provinsi|prov\b|prov\./i.test(p)) continue;
      if (/kecamatan|kec\b|kec\./i.test(p)) continue;
      const cleaned = p
        .replace(/^desa\s+/gi, '')
        .replace(/^kelurahan\s+/gi, '')
        .replace(/kabupaten\b/gi, '')
        .replace(/kab\.\b/gi, '')
        .replace(/kab\b/gi, '')
        .replace(/provinsi\b/gi, '')
        .replace(/prov\.\b/gi, '')
        .replace(/prov\b/gi, '')
        .trim();
      if (cleaned) return cleaned;
    }
    return '';
  };

  const effectiveStartDate = startDateFilter || `${currentMonthStr}-01`;
  const effectiveEndDate = endDateFilter || `${currentMonthStr}-${String(lastDayOfMonth).padStart(2, '0')}`;

  const periodDateRangeStr = `${formatDateDDMMYYYY(effectiveStartDate)} s/d ${formatDateDDMMYYYY(effectiveEndDate)}`;
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

  // 2. Base Transactions in selected date range
  const periodTransactions = transactions.filter((t) => {
    if (effectiveStartDate && t.tanggal < effectiveStartDate) return false;
    if (effectiveEndDate && t.tanggal > effectiveEndDate) return false;
    return true;
  });

  // 3. Filtered Transactions based on Category & Pos Dana Kas (Sorted Ascending by Date)
  const filteredPeriodTransactions = periodTransactions
    .filter((t) => {
      if (selectedCategoryFilter !== 'semua' && t.kategori !== selectedCategoryFilter) return false;
      if (selectedFundFilter !== 'semua' && t.danaKat !== selectedFundFilter) return false;
      return true;
    })
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const periodIncomeDetails = periodTransactions
    .filter((t) => t.jenis === 'pemasukan')
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const periodExpenseDetails = periodTransactions
    .filter((t) => t.jenis === 'pengeluaran')
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const totalIncome = periodIncomeDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const totalExpense = periodExpenseDetails.reduce((sum, t) => sum + t.jumlah, 0);
  const endingBalance = startingBalance + totalIncome - totalExpense;

  // Filtered Summaries (Ascending by Date)
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

  // 4. Dynamic Breakdown per Pos Kas
  const effectiveFundCategories = posDanaList && posDanaList.length > 0 ? posDanaList : [
    'Kas Operasional',
    'Kas Pembangunan',
  ];

  const fundBreakdown = effectiveFundCategories.map((cat) => {
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
    setReportPeriodType('bulanan');
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    setStartDateFilter(`${currentMonthStr}-01`);
    setEndDateFilter(`${currentMonthStr}-${String(lastDay).padStart(2, '0')}`);
    setSelectedCategoryFilter('semua');
    setSelectedFundFilter('semua');
  };

  const isFilterActive =
    reportPeriodType !== 'bulanan' ||
    selectedCategoryFilter !== 'semua' ||
    selectedFundFilter !== 'semua';

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Laporan Keuangan Kas Masjid
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih jenis laporan (Bulanan / Tahunan), filter rentang tanggal & rekapitulasi kas resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Mode Selector Pill Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setReportPeriodType('bulanan')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                reportPeriodType === 'bulanan'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bulanan</span>
            </button>

            <button
              type="button"
              onClick={() => setReportPeriodType('tahunan')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                reportPeriodType === 'tahunan'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Tahunan</span>
            </button>

            <button
              type="button"
              onClick={() => setReportPeriodType('custom')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                reportPeriodType === 'custom'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Date</span>
            </button>
          </div>

          {/* Quick Month/Year Selector Dropdowns */}
          {reportPeriodType === 'bulanan' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
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
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportPeriodType === 'tahunan' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 pl-1">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => onMonthYearChange(selectedMonth, Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrintReport}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>

          {/* QR Code Barcode Button */}
          {onOpenQrModal && (
            <button
              onClick={onOpenQrModal}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer border border-emerald-600"
              title="Scan atau Cetak QR Barcode Laporan Jamaah"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>QR Laporan Jamaah</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filter Control Panel */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Filter Rentang Tanggal & Kategori ({reportPeriodType === 'tahunan' ? 'Laporan Tahunan' : reportPeriodType === 'bulanan' ? 'Laporan Bulanan' : 'Laporan Custom'})
            </h3>
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
          {/* Filter 1: Rentang Awal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Rentang Awal
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => {
                setStartDateFilter(e.target.value);
                setReportPeriodType('custom');
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          {/* Filter 2: Rentang Akhir */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Rentang Akhir
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => {
                setEndDateFilter(e.target.value);
                setReportPeriodType('custom');
              }}
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
              <option value="semua">Semua Pos Kas ({effectiveFundCategories.length})</option>
              {effectiveFundCategories.map((f) => (
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

      {/* Official Printable Statement Sheet */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-md space-y-6 print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Kop Surat Masjid */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1.5">
          <div className="flex flex-col items-center justify-center gap-2">
            {mosqueProfile.logoUrl ? (
              <img
                src={mosqueProfile.logoUrl}
                alt="Logo Masjid"
                className="w-14 h-14 object-contain rounded-full border-2 border-emerald-600 shrink-0 bg-white p-0.5 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-amber-300 font-bold border-2 border-emerald-600 shrink-0 shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                DEWAN KEMAKMURAN MASJID (DKM)
              </h1>
              <h2 className="text-lg font-black text-emerald-800 uppercase tracking-wide text-center">
                {mosqueProfile.namaMasjid}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium text-center">
            {(() => {
              const parts = [];
              if (mosqueProfile.alamat) parts.push(mosqueProfile.alamat.replace(/,\s*$/, ''));
              if (mosqueProfile.desa) {
                const d = mosqueProfile.desa.replace(/^desa\s+/gi, '').replace(/^kelurahan\s+/gi, '').replace(/^kel\.\s+/gi, '').trim();
                if (d) parts.push(`Desa ${d}`);
              }
              if (mosqueProfile.kecamatan) {
                const k = mosqueProfile.kecamatan.replace(/^kec\.?\s+/gi, '').trim();
                if (k) parts.push(`Kec. ${k}`);
              }
              if (mosqueProfile.kota) parts.push(mosqueProfile.kota);
              return parts.join(' ');
            })()} • Telp: {mosqueProfile.telepon}
          </p>
          <p className="text-[11px] text-slate-500 italic text-center">
            Email: {mosqueProfile.email} | Rekening Infaq: {mosqueProfile.namaBank} {mosqueProfile.nomorRekening} a.n {mosqueProfile.anRekening}
          </p>
        </div>

        {/* Title Statement */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 inline-block px-4 pb-0.5">
            LAPORAN KEUANGAN KAS MASJID {reportPeriodType === 'tahunan' ? `TAHUNAN (TAHUN ${selectedYear})` : reportPeriodType === 'bulanan' ? `BULANAN (${monthNames[selectedMonth - 1].toUpperCase()} ${selectedYear})` : ''}
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
                  <td colSpan={2} className="p-2.5 text-center border-r border-slate-300 uppercase">TOTAL KAS GABUNGAN MASJID</td>
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
                  <th className="p-2 border-r border-slate-300">Keterangan / Donatur</th>
                  <th className="p-2 border-r border-slate-300">Kategori & Pos Kas</th>
                  <th className="p-2 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredIncomeDetails.map((inc) => (
                  <tr key={inc.id}>
                    <td className="p-2 border-r border-slate-300 whitespace-nowrap font-mono">{formatDateDDMMYYYY(inc.tanggal)}</td>
                    <td className="p-2 border-r border-slate-300 font-medium">
                      {inc.keterangan} {inc.donatur ? `[Donatur: ${inc.donatur}]` : ''}
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 mr-1 font-semibold">
                        {inc.kategori}
                      </span>
                      <span className="text-slate-500">({inc.danaKat})</span>
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
                  <th className="p-2 border-r border-slate-300">Keterangan Pengeluaran</th>
                  <th className="p-2 border-r border-slate-300">Kategori & Pos Kas</th>
                  <th className="p-2 text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExpenseDetails.map((exp) => (
                  <tr key={exp.id}>
                    <td className="p-2 border-r border-slate-300 whitespace-nowrap font-mono">{formatDateDDMMYYYY(exp.tanggal)}</td>
                    <td className="p-2 border-r border-slate-300 font-medium">{exp.keterangan}</td>
                    <td className="p-2 border-r border-slate-300">
                      <span className="bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200 mr-1 font-semibold">
                        {exp.kategori}
                      </span>
                      <span className="text-slate-500">({exp.danaKat})</span>
                    </td>
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
        <div className="pt-3 border-t border-slate-300">
          <div className="text-xs text-slate-600 text-right font-medium mb-2">
            {getTitimangsaVillage(mosqueProfile) ? `${getTitimangsaVillage(mosqueProfile)}, ` : ''}{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div className="grid grid-cols-3 text-center gap-4 text-xs font-semibold">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 mt-0.5">Ketua DKM {mosqueProfile.namaMasjid}</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 inline-block px-4">
                ({mosqueProfile.ketuaDKM})
              </p>
            </div>

            <div>
              <p className="text-slate-500">Penyusun Laporan,</p>
              <p className="font-bold text-slate-900 mt-0.5">Bendahara DKM</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 inline-block px-4">
                ({mosqueProfile.bendaharaDKM})
              </p>
            </div>

            <div>
              <p className="text-slate-500">Verifikator,</p>
              <p className="font-bold text-slate-900 mt-0.5">Sekretaris DKM</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 inline-block px-4">
                ({mosqueProfile.sekretarisDKM})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
