import React, { useState, useEffect } from 'react';
import { X, PlusCircle, CheckCircle2, DollarSign, Wallet, Calendar, User, FileText, CreditCard, Tag } from 'lucide-react';
import { FundCategory, Transaction, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id'>, editId?: string) => void;
  editingTransaction?: Transaction | null;
  defaultFundCategory?: FundCategory;
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  onOpenCategoryManager?: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultFundCategory = 'Kas Operasional',
  categoriesPemasukan,
  categoriesPengeluaran,
  onOpenCategoryManager,
}) => {
  const [jenis, setJenis] = useState<TransactionType>('pemasukan');
  const [danaKat, setDanaKat] = useState<FundCategory>(defaultFundCategory);
  const [kategori, setKategori] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState<number | ''>('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [petugas, setPetugas] = useState('H. Mohammad Ridwan');
  const [donatur, setDonatur] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState<'Tunai' | 'Transfer Bank' | 'QRIS' | 'Cek'>('Tunai');

  const currentCategoryList = jenis === 'pemasukan' ? categoriesPemasukan : categoriesPengeluaran;

  // Sync state when editing vs adding new
  useEffect(() => {
    if (editingTransaction) {
      setJenis(editingTransaction.jenis);
      setDanaKat(editingTransaction.danaKat);
      setKategori(editingTransaction.kategori);
      setKeterangan(editingTransaction.keterangan);
      setJumlah(editingTransaction.jumlah);
      setTanggal(editingTransaction.tanggal);
      setPetugas(editingTransaction.petugas);
      setDonatur(editingTransaction.donatur || '');
      setMetodePembayaran(editingTransaction.metodePembayaran);
    } else {
      setJenis('pemasukan');
      setDanaKat(defaultFundCategory);
      setKategori(currentCategoryList[0] || 'Infaq Umum');
      setKeterangan('');
      setJumlah('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setPetugas('H. Mohammad Ridwan');
      setDonatur('');
      setMetodePembayaran('Tunai');
    }
  }, [editingTransaction, defaultFundCategory, isOpen, categoriesPemasukan, categoriesPengeluaran]);

  if (!isOpen) return null;

  const handleJenisChange = (newJenis: TransactionType) => {
    setJenis(newJenis);
    const nextList = newJenis === 'pemasukan' ? categoriesPemasukan : categoriesPengeluaran;
    setKategori(nextList[0] || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || Number(jumlah) <= 0) {
      alert('Mohon masukkan jumlah Rupiah transaksi yang valid.');
      return;
    }
    if (!keterangan.trim()) {
      alert('Mohon lengkapi keterangan transaksi.');
      return;
    }

    onSave(
      {
        tanggal,
        jenis,
        danaKat,
        kategori: kategori.trim() || (jenis === 'pemasukan' ? 'Infaq Umum' : 'Pengeluaran Umum'),
        keterangan: keterangan.trim(),
        jumlah: Number(jumlah),
        petugas: petugas.trim() || 'Bendahara DKM',
        donatur: donatur.trim() ? donatur.trim() : undefined,
        metodePembayaran,
        statusVerification: 'Terverifikasi',
      },
      editingTransaction?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              {editingTransaction ? 'Edit Catatan Transaksi Kas' : 'Pencatatan Transaksi Kas Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Jenis Transaksi Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Transaksi Kas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleJenisChange('pemasukan')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                  jenis === 'pemasukan'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                <span>Pemasukan (+) Infaq / Donasi</span>
              </button>

              <button
                type="button"
                onClick={() => handleJenisChange('pengeluaran')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                  jenis === 'pengeluaran'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                <span>Pengeluaran (-) Operasional</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pos/Kategori Kas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pos Dana Kas
              </label>
              <select
                value={danaKat}
                onChange={(e) => setDanaKat(e.target.value as FundCategory)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Kas Operasional">Kas Operasional & Umum</option>
                <option value="Kas Pembangunan">Kas Pembangunan & Renovasi</option>
                <option value="Kas Yatim & Sosial">Kas Santunan Yatim & Sosial</option>
                <option value="Kas Zakat & Shadaqah">Kas Zakat & Shadaqah (ZIS)</option>
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Kategori Spesifik */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Kategori Transaksi
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>+ Kelola Kategori</span>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {currentCategoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jumlah Rp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            {jumlah !== '' && (
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                Terbilang: Rp {Number(jumlah).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Keterangan & Rincian */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Transaksi / Catatan Rincian
            </label>
            <textarea
              required
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Misal: Hasil Infaq Kotak Shalat Jumat Pekan I atau Pembelian 2 Galon Cat Tembok"
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Donatur (opsional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Donatur / Sumber Dana (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: H. Teguh / Hamba Allah"
                value={donatur}
                onChange={(e) => setDonatur(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value as any)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Tunai">Tunai / Kotak Infaq</option>
                <option value="Transfer Bank">Transfer Bank (BSI)</option>
                <option value="QRIS">QRIS Barcode</option>
                <option value="Cek">Cek / Bilyet Giro</option>
              </select>
            </div>
          </div>

          {/* Petugas Pencatat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Petugas DKM Pencatat
            </label>
            <input
              type="text"
              required
              value={petugas}
              onChange={(e) => setPetugas(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Catatan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
