import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Calendar,
  Wallet,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Share2,
  QrCode,
  Printer,
  Copy,
  Check,
  Download,
  ExternalLink,
  HeartHandshake,
  FileText,
  CreditCard,
  Building,
  Sparkles,
  Camera,
  X,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Store,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import QRCode from 'qrcode';
import { MosqueProfile, Transaction, MosqueBusinessUnit, BusinessRecord, LandTenant } from '../types';
import { ReceiptModal } from './ReceiptModal';

export interface JamaahReportPortalProps {
  transactions: Transaction[];
  mosqueProfile: MosqueProfile;
  businessUnits?: MosqueBusinessUnit[];
  businessRecords?: BusinessRecord[];
  landTenants?: LandTenant[];
  posDanaList?: string[];
  selectedMonth?: number;
  selectedYear?: number;
  onMonthYearChange?: (month: number, year: number) => void;
  dkmId?: string;
  readOnly?: boolean;
  onOpenLoginModal?: () => void;
}

export const JamaahReportPortal: React.FC<JamaahReportPortalProps> = ({
  transactions,
  mosqueProfile,
  businessUnits = [],
  businessRecords = [],
  landTenants = [],
  posDanaList = ['Kas Operasional', 'Kas Pembangunan'],
  selectedMonth: initialMonth,
  selectedYear: initialYear,
  onMonthYearChange,
  dkmId,
  readOnly = false,
  onOpenLoginModal,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialMonth || currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear || currentDate.getFullYear()
  );

  // Sub Tab inside Jamaah Portal: 'monthly' | 'journal' | 'business' | 'donation'
  const [activeSubTab, setActiveSubTab] = useState<'monthly' | 'journal' | 'business' | 'donation'>('monthly');

  // Filter & Search inside Journal
  const [journalSearch, setJournalSearch] = useState('');
  const [journalTypeFilter, setJournalTypeFilter] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [journalFundFilter, setJournalFundFilter] = useState<string>('semua');

  // Active Receipt Modal
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaction | null>(null);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Year options
  const yearOptions = Array.from(
    new Set([
      currentDate.getFullYear(),
      selectedYear,
      ...transactions.map((t) => new Date(t.tanggal).getFullYear()).filter((y) => !isNaN(y)),
      2025,
      2026,
    ])
  ).sort((a, b) => b - a);

  // Compute public share URL for Jamaah
  const getPublicShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    if (dkmId) {
      url.searchParams.set('dkm', dkmId);
    }
    url.searchParams.set('tab', 'jamaah');
    return url.toString();
  };

  // Generate QR Code for Jamaah URL
  useEffect(() => {
    const url = getPublicShareUrl();
    if (url) {
      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#064e3b', // emerald-900
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate QR Code', err));
    }
  }, [dkmId]);

  const handleMonthYearChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    if (onMonthYearChange) {
      onMonthYearChange(m, y);
    }
  };

  // Total Real-Time Balance (All Time)
  const totalAllTimeIncome = transactions
    .filter((t) => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalAllTimeExpense = transactions
    .filter((t) => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalCurrentBalance = totalAllTimeIncome - totalAllTimeExpense;

  // Real-time balance per fund
  const getFundBalance = (fundName: string) => {
    const fundTrx = transactions.filter((t) => t.danaKat === fundName);
    const inc = fundTrx.filter((t) => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const exp = fundTrx.filter((t) => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    return inc - exp;
  };

  const operasionalBal = getFundBalance('Kas Operasional');
  const pembangunanBal = getFundBalance('Kas Pembangunan');

  // Last Friday Infaq Record
  const fridayInfaqTrx = transactions
    .filter((t) => t.kategori.toLowerCase().includes('jumat') || t.keterangan.toLowerCase().includes('jumat'))
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];

  // Helper date formatting
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const monthIdx = parseInt(m, 10) - 1;
      return `${parseInt(d, 10)} ${monthNames[monthIdx] || m} ${y}`;
    }
    return dateStr;
  };

  const formatDateDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
    return dateStr;
  };

  // Monthly Filter Calculations
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthlyTransactions = transactions.filter((t) => t.tanggal.startsWith(currentMonthPrefix));

  // Prior transactions (before this month)
  const priorTransactions = transactions.filter((t) => t.tanggal < `${currentMonthPrefix}-01`);
  const monthlySaldoAwal =
    priorTransactions.filter((t) => t.jenis === 'pemasukan').reduce((sum, t) => sum + t.jumlah, 0) -
    priorTransactions.filter((t) => t.jenis === 'pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);

  const monthlyPemasukan = monthlyTransactions
    .filter((t) => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const monthlyPengeluaran = monthlyTransactions
    .filter((t) => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const monthlySaldoAkhir = monthlySaldoAwal + monthlyPemasukan - monthlyPengeluaran;

  // Breakdown by Category for the selected month
  const pemasukanByCat: { [cat: string]: number } = {};
  const pengeluaranByCat: { [cat: string]: number } = {};

  monthlyTransactions.forEach((t) => {
    if (t.jenis === 'pemasukan') {
      pemasukanByCat[t.kategori] = (pemasukanByCat[t.kategori] || 0) + t.jumlah;
    } else {
      pengeluaranByCat[t.kategori] = (pengeluaranByCat[t.kategori] || 0) + t.jumlah;
    }
  });

  // Filtered Transactions for Journal Tab
  const filteredJournalTransactions = transactions
    .filter((t) => {
      // Search
      if (journalSearch.trim()) {
        const q = journalSearch.toLowerCase();
        const matchKet = t.keterangan?.toLowerCase().includes(q);
        const matchKat = t.kategori?.toLowerCase().includes(q);
        const matchDonatur = t.donatur?.toLowerCase().includes(q);
        const matchPetugas = t.petugas?.toLowerCase().includes(q);
        const matchDana = t.danaKat?.toLowerCase().includes(q);
        if (!matchKet && !matchKat && !matchDonatur && !matchPetugas && !matchDana) return false;
      }
      // Type
      if (journalTypeFilter !== 'semua' && t.jenis !== journalTypeFilter) return false;
      // Fund
      if (journalFundFilter !== 'semua' && t.danaKat !== journalFundFilter) return false;

      return true;
    })
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Copy Link Handler
  const handleCopyLink = () => {
    const url = getPublicShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Copy Account Number
  const handleCopyAccount = () => {
    if (!mosqueProfile.nomorRekening) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mosqueProfile.nomorRekening);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  // WhatsApp Share Message
  const handleShareWhatsApp = () => {
    const url = getPublicShareUrl();
    const message = `*LAPORAN TRANSPARANSI KAS MASJID*\n🏛️ *${mosqueProfile.namaMasjid}*\n📍 ${mosqueProfile.alamat}, ${mosqueProfile.kota}\n\n📊 *Ringkasan Saldo Kas Real-Time:*\n• Total Saldo Kas: Rp ${totalCurrentBalance.toLocaleString('id-ID')}\n• Kas Operasional: Rp ${operasionalBal.toLocaleString('id-ID')}\n• Kas Pembangunan: Rp ${pembangunanBal.toLocaleString('id-ID')}\n${
      fridayInfaqTrx
        ? `\n🕌 *Infaq Kotak Jumat Terakhir (${formatDateIndo(fridayInfaqTrx.tanggal)}):* Rp ${fridayInfaqTrx.jumlah.toLocaleString('id-ID')}\n`
        : ''
    }\n💳 *Rekening Infaq Resmi:*\n${mosqueProfile.namaBank || 'Bank'} ${mosqueProfile.nomorRekening} a.n. ${mosqueProfile.anRekening}\n\n📱 *Lihat rincian pembukuan lengkap & transparan secara online:*\n${url}\n\n_Jazakumullahu Khairan Katsiran atas keikhlasan infaq & sedekah seluruh Jamaah._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="jamaah-report-portal-view" className="space-y-6 animate-fade-in pb-16">
      {/* Top Hero Banner - Congregation Portal */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Mosque Branding & Title */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-amber-400/50 flex items-center justify-center shrink-0 overflow-hidden">
              {mosqueProfile.logoUrl ? (
                <img
                  src={mosqueProfile.logoUrl}
                  alt="Logo Masjid"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-10 h-10 text-emerald-800" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-emerald-950 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  Portal Transparansi Kas Jamaah
                </span>
                <span className="text-[11px] text-emerald-200/90 font-medium bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                  Pembaruan Real-Time
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {mosqueProfile.namaMasjid}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-normal">
                {[mosqueProfile.alamat, mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '', mosqueProfile.kota].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>

          {/* Quick Action Share & Print Buttons for Congregation & DKM */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              id="jamaah-btn-share-wa"
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 border border-emerald-400/40"
              title="Bagikan ringkasan kas ke WhatsApp Jamaah"
            >
              <MessageCircle className="w-4 h-4 text-emerald-100" />
              <span>Bagikan ke WA</span>
            </button>

            <button
              id="jamaah-btn-qr-modal"
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
              title="Tampilkan QR Code untuk dipindai Jamaah di Mading / HP"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>QR Code Mading</span>
            </button>

            <button
              id="jamaah-btn-copy-link"
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-700/80 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Salin Tautan Laporan untuk Jamaah"
            >
              {copiedLink ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
            </button>

            <button
              id="jamaah-btn-print"
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-700/80 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Cetak format ringkasan jamaah"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Jamaah Info & Security Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <span>Mode Transparansi Kas Jamaah (Hanya Lihat)</span>
              <span className="bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                Akses Terproteksi
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              Tautan dan barcode ini menyajikan laporan keuangan kas, penerimaan infaq, pengeluaran, sewa tanah, serta rekening donasi <strong className="text-slate-900">{mosqueProfile.namaMasjid}</strong> secara transparan tanpa hak akses edit/tambah data.
            </p>
          </div>
        </div>

        {readOnly && onOpenLoginModal && (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="shrink-0 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Masuk Pengurus DKM</span>
          </button>
        )}
      </div>

      {/* Real-time Summary Cards for Jamaah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kas Tersedia */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-700 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Total Saldo Kas Tersedia
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-xs">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              Rp {totalCurrentBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-100 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 inline" />
              Akumulasi Kas Amanah Umat
            </p>
          </div>
        </div>

        {/* Kas Operasional */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Kas Operasional
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rp {operasionalBal.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Listrik, air, kebersihan, sound & honor imam/khatib
            </p>
          </div>
        </div>

        {/* Kas Pembangunan */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Kas Pembangunan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rp {pembangunanBal.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Renovasi fisik, sarana ibadah & fasilitas jamaah
            </p>
          </div>
        </div>

        {/* Kotak Infaq Jumat Terakhir */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Infaq Jumat Terakhir
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {fridayInfaqTrx ? `Rp ${fridayInfaqTrx.jumlah.toLocaleString('id-ID')}` : 'Rp 0'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              {fridayInfaqTrx ? `Pelaksanaan: ${formatDateIndo(fridayInfaqTrx.tanggal)}` : 'Belum ada catatan infaq Jumat'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar for Congregation Mode */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex overflow-x-auto no-scrollbar gap-2 print:hidden">
        <button
          id="jamaah-subtab-monthly"
          type="button"
          onClick={() => setActiveSubTab('monthly')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'monthly'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rekap Bulanan & Narasi</span>
        </button>

        <button
          id="jamaah-subtab-journal"
          type="button"
          onClick={() => setActiveSubTab('journal')}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'journal'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Arus Kas & Kwitansi ({filteredJournalTransactions.length})</span>
        </button>

        <button
          id="jamaah-subtab-business"
          type="button"
          onClick={() => setActiveSubTab('business')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'business'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Sewa Lahan & Aset</span>
        </button>

        <button
          id="jamaah-subtab-donation"
          type="button"
          onClick={() => setActiveSubTab('donation')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'donation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-500" />
          <span>Infaq & QRIS Masjid</span>
        </button>
      </div>

      {/* SUB-VIEW 1: REKAP BULANAN & NARASI RESMI DKM */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          {/* Month & Year Selector Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <span>Laporan Pembukuan Kas Bulan {monthNames[selectedMonth - 1]} {selectedYear}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pilih periode bulan dan tahun untuk melihat rincian pertanggungjawaban kas masjid.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                id="jamaah-select-month"
                value={selectedMonth}
                onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
                className="py-2 px-3 text-xs sm:text-sm font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                id="jamaah-select-year"
                value={selectedYear}
                onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                className="py-2 px-3 text-xs sm:text-sm font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Summary Metric Cards for Selected Month */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Saldo Awal Bulan</span>
              <div className="text-base sm:text-xl font-bold text-slate-800 mt-1">
                Rp {monthlySaldoAwal.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-slate-400">Posisi 1 {monthNames[selectedMonth - 1]}</span>
            </div>

            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Penerimaan Infaq</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base sm:text-xl font-black text-emerald-800 mt-1">
                +Rp {monthlyPemasukan.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-emerald-600">Total pemasukan bulan ini</span>
            </div>

            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase">Pengeluaran Kas</span>
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-base sm:text-xl font-black text-rose-800 mt-1">
                -Rp {monthlyPengeluaran.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-rose-600">Total belanja & operasional</span>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-amber-300 uppercase">Saldo Akhir Bulan</span>
              <div className="text-base sm:text-xl font-black text-amber-300 mt-1">
                Rp {monthlySaldoAkhir.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-slate-300">Siap dialokasikan</span>
            </div>
          </div>

          {/* Detailed Infaq Income vs Expense Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pemasukan Infaq per Kategori */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Rincian Penerimaan Infaq & Donasi</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700">
                  Rp {monthlyPemasukan.toLocaleString('id-ID')}
                </span>
              </div>

              {Object.keys(pemasukanByCat).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Tidak ada catatan penerimaan pada bulan ini.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(pemasukanByCat)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => {
                      const percent = monthlyPemasukan > 0 ? (amount / monthlyPemasukan) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-800">
                            <span>{cat}</span>
                            <span>Rp {amount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Pengeluaran Kas per Kategori */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Rincian Pengeluaran & Operasional</span>
                </h3>
                <span className="text-xs font-bold text-rose-700">
                  Rp {monthlyPengeluaran.toLocaleString('id-ID')}
                </span>
              </div>

              {Object.keys(pengeluaranByCat).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Tidak ada catatan pengeluaran pada bulan ini.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(pengeluaranByCat)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => {
                      const percent = monthlyPengeluaran > 0 ? (amount / monthlyPengeluaran) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-800">
                            <span>{cat}</span>
                            <span>Rp {amount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Transparansi Pertanggungjawaban & Susunan Pengurus DKM */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-emerald-700" />
              <span>Pernyataan Akuntabilitas & Penanggung Jawab DKM</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Seluruh penerimaan infaq, sedekah, wakaf, dan belanja operasional masjid telah diverifikasi dengan bukti nota/kwitansi dan diadministrasikan secara amanah oleh Pengurus Dewan Kemakmuran Masjid <strong>{mosqueProfile.namaMasjid}</strong> demi kemaslahatan seluruh jamaah.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ketua DKM</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">{mosqueProfile.ketuaDKM}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bendahara DKM</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">{mosqueProfile.bendaharaDKM}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sekretaris DKM</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">{mosqueProfile.sekretarisDKM}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ARUS KAS & JURNAL TERVERIFIKASI JAMA'AH */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi (Infaq Jumat, donatur, beli perlengkapan, dll)..."
                value={journalSearch}
                onChange={(e) => setJournalSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={journalTypeFilter}
                onChange={(e) => setJournalTypeFilter(e.target.value as any)}
                className="flex-1 md:flex-none py-2.5 px-3 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
              >
                <option value="semua">Semua Jenis</option>
                <option value="pemasukan">Pemasukan (+)</option>
                <option value="pengeluaran">Pengeluaran (-)</option>
              </select>

              <select
                value={journalFundFilter}
                onChange={(e) => setJournalFundFilter(e.target.value)}
                className="flex-1 md:flex-none py-2.5 px-3 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800"
              >
                <option value="semua">Semua Pos Dana</option>
                {posDanaList.map((fund) => (
                  <option key={fund} value={fund}>
                    {fund}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredJournalTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Tidak ada transaksi yang cocok dengan filter pencarian.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredJournalTransactions.map((trx) => {
                  const isIncome = trx.jenis === 'pemasukan';
                  return (
                    <div
                      key={trx.id}
                      className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {trx.kategori}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {trx.danaKat}
                            </span>
                            {trx.statusVerification === 'Terverifikasi' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Terverifikasi
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {trx.keterangan || '-'}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateIndo(trx.tanggal)}
                            </span>
                            {trx.donatur && (
                              <span>Donatur: <strong className="text-slate-600">{trx.donatur}</strong></span>
                            )}
                            {trx.metodePembayaran && (
                              <span>Metode: {trx.metodePembayaran}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Nominal & View Receipt Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div
                            className={`text-sm sm:text-base font-extrabold tracking-tight ${
                              isIncome ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isIncome ? '+' : '-'} Rp {trx.jumlah.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {trx.buktiUrl && (
                          <button
                            type="button"
                            onClick={() => setActiveReceiptTrx(trx)}
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            title="Lihat Nota / Bukti Pembayaran"
                          >
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Bukti</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TRANSPARANSI SEWA ASET & WAKAF */}
      {activeSubTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-700" />
                  <span>Transparansi Pengelolaan Sewa Lahan & Aset Masjid</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Penerimaan dari sewa unit kios, stan kuliner, dan lahan wakaf produktif yang dialokasikan penuh ke kas masjid.
                </p>
              </div>
            </div>

            {landTenants.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs italic">Belum ada unit sewa aktif yang tercatat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{tenant.namaLahan}</span>
                        <span className="text-[11px] text-slate-500">{tenant.peruntukanUsaha} • Penyewa: {tenant.namaPenyewa}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Rp {tenant.tarifSetelahDiskon?.toLocaleString('id-ID') || tenant.tarifSewa.toLocaleString('id-ID')} / {tenant.tipePeriode}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>Kategori: {tenant.kategori}</span>
                      <span className="font-semibold text-emerald-700">Masuk: {tenant.posDanaTujuan || 'Kas Operasional'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SALURKAN INFAQ / DONASI DIGITAL (REKENING & QRIS) */}
      {activeSubTab === 'donation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-700">
            <div className="max-w-2xl space-y-3">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Infaq & Wakaf Digital
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Mari Makmurkan Rumah Allah
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Salurkan infaq, sedekah jumat, dan donasi pembangunan terbaik Anda melalui rekening resmi atau kode QRIS masjid. Seluruh dana tercatat secara transparan di dalam aplikasi ini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rekening Transfer Bank */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Transfer Rekening Bank</h3>
                    <p className="text-xs text-slate-500">Infaq & Donasi via ATM / Mobile Banking</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nama Bank / Lembaga
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block">
                    {mosqueProfile.namaBank || 'Bank Syariah Indonesia (BSI)'}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">
                    Nomor Rekening
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg sm:text-xl font-mono font-black text-emerald-700 tracking-wider">
                      {mosqueProfile.nomorRekening || '7123456789'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">
                    Atas Nama Rekening
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                    {mosqueProfile.anRekening || mosqueProfile.namaMasjid}
                  </span>
                </div>
              </div>

              {mosqueProfile.telepon && (
                <div className="pt-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${mosqueProfile.telepon.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                      `Assalamu'alaikum Pengurus DKM ${mosqueProfile.namaMasjid}, saya ingin mengonfirmasi donasi/infaq sebesar: `
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Konfirmasi Infaq via WhatsApp Bendahara</span>
                  </a>
                </div>
              )}
            </div>

            {/* QRIS Donasi Digital */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col items-center text-center justify-between">
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">QRIS Resmi Donasi Masjid</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Dukung semua dompet digital: GoPay, OVO, DANA, BCA, BSI, Mandiri, BRI, ShopeePay.
                </p>
              </div>

              <div className="w-56 h-56 bg-slate-50 p-2.5 rounded-2xl border-2 border-dashed border-emerald-300 shadow-sm flex items-center justify-center">
                {mosqueProfile.qrisImageUrl ? (
                  <img
                    src={mosqueProfile.qrisImageUrl}
                    alt="QRIS Donasi Masjid"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : qrDataUrl ? (
                  <div className="space-y-2">
                    <img
                      src={qrDataUrl}
                      alt="QR Code Laporan Kas"
                      className="w-48 h-48 object-contain rounded-xl mx-auto"
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs">QRIS Siap Digunakan</div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 italic">
                *Semoga Allah melipatgandakan pahala kebaikan dan keberkahan bagi Anda dan keluarga.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: QR CODE CETAK MADING & SCAN ACCESS */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative text-center">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pindai Laporan Kas Masjid
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {mosqueProfile.namaMasjid}
              </h3>
              <p className="text-xs text-slate-500">
                Arahkan kamera HP Anda ke QR Code berikut untuk langsung membuka laporan keuangan online tanpa perlu login.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code Akses Laporan Kas Jamaah"
                  className="w-56 h-56 mx-auto object-contain rounded-xl bg-white p-2 shadow-xs"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                  Membuat QR Code...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-mono break-all border border-slate-200">
                {getPublicShareUrl()}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Tersalin ke Clipboard' : 'Salin Tautan'}</span>
                </button>

                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`QR_Laporan_Kas_${mosqueProfile.namaMasjid.replace(/\s+/g, '_')}.png`}
                    className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECEIPT PREVIEW */}
      {activeReceiptTrx && (
        <ReceiptModal
          isOpen={Boolean(activeReceiptTrx)}
          onClose={() => setActiveReceiptTrx(null)}
          receiptUrl={activeReceiptTrx.buktiUrl}
          transactionTitle={`${activeReceiptTrx.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} - ${activeReceiptTrx.kategori}`}
          transactionDate={activeReceiptTrx.tanggal}
          transactionAmount={activeReceiptTrx.jumlah}
        />
      )}
    </div>
  );
};
