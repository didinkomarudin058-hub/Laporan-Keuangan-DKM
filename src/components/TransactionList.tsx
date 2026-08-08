import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet,
  FileText,
  X,
  Eye
} from 'lucide-react';
import { FundCategory, Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onOpenAddModal: (defaultCategory?: FundCategory) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  initialFundFilter?: FundCategory | 'semua';
  categoriesPemasukan?: string[];
  categoriesPengeluaran?: string[];
  posDanaList?: string[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  initialFundFilter = 'semua',
  categoriesPemasukan = [],
  categoriesPengeluaran = [],
  posDanaList = ['Kas Operasional', 'Kas Pembangunan', 'Kas Yatim & Sosial', 'Kas Zakat & Shadaqah'],
}) => {
  // State filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFund, setSelectedFund] = useState<FundCategory | 'semua'>(initialFundFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedType, setSelectedType] = useState<TransactionType | 'semua'>('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected receipt modal
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaction | null>(null);

  // Delete confirmation
  const [deletingTrxId, setDeletingTrxId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allAvailableCategories = Array.from(
    new Set([
      ...categoriesPemasukan,
      ...categoriesPengeluaran,
      ...transactions.map(t => t.kategori)
    ])
  ).sort();

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    // Search match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      t.kategori.toLowerCase().includes(searchLower) ||
      t.keterangan.toLowerCase().includes(searchLower) ||
      t.petugas.toLowerCase().includes(searchLower) ||
      (t.donatur && t.donatur.toLowerCase().includes(searchLower)) ||
      t.id.toLowerCase().includes(searchLower);

    // Fund Category
    const matchesFund = selectedFund === 'semua' || t.danaKat === selectedFund;

    // Specific Category
    const matchesCategory = selectedCategory === 'semua' || t.kategori === selectedCategory;

    // Type
    const matchesType = selectedType === 'semua' || t.jenis === selectedType;

    // Dates
    const matchesStartDate = !startDate || t.tanggal >= startDate;
    const matchesEndDate = !endDate || t.tanggal <= endDate;

    return matchesSearch && matchesFund && matchesCategory && matchesType && matchesStartDate && matchesEndDate;
  });

  // Sort descending by date
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  // Totals for current filter
  const filteredInflow = sortedTransactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const filteredOutflow = sortedTransactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const filteredNet = filteredInflow - filteredOutflow;

  // Pagination math
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Tanggal", "Jenis", "Pos Kas", "Kategori", "Keterangan", "Jumlah (Rp)", "Petugas DKM", "Donatur", "Metode"];
    const rows = sortedTransactions.map(t => [
      t.id,
      t.tanggal,
      t.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.danaKat}"`,
      `"${t.kategori}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      t.jumlah,
      `"${t.petugas}"`,
      `"${t.donatur || '-'}"`,
      t.metodePembayaran
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Mutasi_Kas_DKM_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Jurnal Mutasi Kas DKM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan riwayat transaksi penerimaan infaq/donasi & pengeluaran operasional masjid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Download CSV / Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={() => onOpenAddModal()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Cari keterangan, donatur..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pos Kas Filter */}
          <div>
            <select
              value={selectedFund}
              onChange={(e) => { setSelectedFund(e.target.value as any); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="semua">Semua Pos Kas ({posDanaList.length})</option>
              {posDanaList.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="semua">Semua Kategori</option>
              {allAvailableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis Transaksi Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value as any); setCurrentPage(1); }}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="semua">Semua Jenis</option>
              <option value="pemasukan">Hanya Pemasukan (+)</option>
              <option value="pengeluaran">Hanya Pengeluaran (-)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              title="Dari Tanggal"
            />
            <span className="text-slate-400 text-xs">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              title="Sampai Tanggal"
            />
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-600">
            Menampilkan <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transaksi terfilter
          </div>

          <div className="flex flex-wrap items-center gap-3 font-medium">
            <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Total Masuk: <span className="font-bold">+Rp {filteredInflow.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
              Total Keluar: <span className="font-bold">-Rp {filteredOutflow.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Neto: <span className="font-bold">Rp {filteredNet.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Pos Kas & Kategori</th>
                <th className="py-3 px-3">Keterangan & Donatur</th>
                <th className="py-3 px-3">Petugas & Metode</th>
                <th className="py-3 px-3 text-right">Jumlah (Rp)</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{trx.tanggal}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{trx.id}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{trx.kategori}</div>
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {trx.danaKat}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-sm">
                      <p className="text-slate-800 font-normal leading-snug">{trx.keterangan}</p>
                      {trx.donatur && (
                        <div className="mt-0.5 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <span>Donatur:</span>
                          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200/60">{trx.donatur}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-700 font-medium">{trx.petugas}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {trx.metodePembayaran}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap font-extrabold text-sm">
                      {trx.jenis === 'pemasukan' ? (
                        <span className="text-emerald-700">+Rp {trx.jumlah.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-rose-600">-Rp {trx.jumlah.toLocaleString('id-ID')}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTransaction(trx)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTrxId(trx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Halaman <span className="font-bold text-slate-900">{currentPage}</span> dari <span className="font-bold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition font-medium"
              >
                &laquo; Sblmnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    currentPage === p
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition font-medium"
              >
                Lanjut &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {deletingTrxId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Transaksi</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan transaksi <span className="font-mono font-bold">{deletingTrxId}</span>? 
              Tindakan ini akan memperbarui saldo kas terkait secara otomatis.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingTrxId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deletingTrxId);
                  setDeletingTrxId(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
