import React, { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, CheckCircle2, DollarSign, Wallet, Calendar, User, FileText, CreditCard, Tag, Camera, Image as ImageIcon, Trash2, Eye, UploadCloud, Loader2 } from 'lucide-react';
import { FundCategory, Transaction, TransactionType } from '../types';
import { compressImageFile } from '../lib/imageUtils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id'>, editId?: string) => void;
  editingTransaction?: Transaction | null;
  defaultFundCategory?: FundCategory;
  categoriesPemasukan: string[];
  categoriesPengeluaran: string[];
  posDanaList?: string[];
  metodePembayaranList?: string[];
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
  posDanaList = ['Kas Operasional', 'Kas Pembangunan'],
  metodePembayaranList = ['Tunai', 'Transfer Bank', 'QRIS', 'Cek'],
  onOpenCategoryManager,
}) => {
  const [jenis, setJenis] = useState<TransactionType>('pemasukan');
  const [danaKat, setDanaKat] = useState<FundCategory>(defaultFundCategory);
  const [kategori, setKategori] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState<number | ''>('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [donatur, setDonatur] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState<string>('Tunai');
  const [buktiUrl, setBuktiUrl] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDonatur(editingTransaction.donatur || '');
      setMetodePembayaran(editingTransaction.metodePembayaran || 'Tunai');
      setBuktiUrl(editingTransaction.buktiUrl || undefined);
    } else {
      setJenis('pemasukan');
      setDanaKat(posDanaList.includes(defaultFundCategory) ? defaultFundCategory : (posDanaList[0] || 'Kas Operasional'));
      setKategori(categoriesPemasukan[0] || '');
      setKeterangan('');
      setJumlah('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setDonatur('');
      setMetodePembayaran(metodePembayaranList[0] || 'Tunai');
      setBuktiUrl(undefined);
    }
  }, [editingTransaction, isOpen, defaultFundCategory, posDanaList, metodePembayaranList, categoriesPemasukan]);

  // When changing transaction type, set default category to first in list
  const handleJenisChange = (newJenis: TransactionType) => {
    setJenis(newJenis);
    const catList = newJenis === 'pemasukan' ? categoriesPemasukan : categoriesPengeluaran;
    if (catList.length > 0) {
      setKategori(catList[0]);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.78);
      setBuktiUrl(compressedDataUrl);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses file gambar bukti transaksi.');
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBukti = () => {
    setBuktiUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || Number(jumlah) <= 0) {
      alert('Mohon masukkan jumlah nominal uang yang valid.');
      return;
    }

    onSave(
      {
        tanggal,
        jenis,
        danaKat: danaKat || posDanaList[0] || 'Kas Operasional',
        kategori: kategori || (jenis === 'pemasukan' ? 'Infaq Kotak Jumat' : 'Kebersihan & Perlengkapan'),
        keterangan,
        jumlah: Number(jumlah),
        donatur: donatur.trim() ? donatur.trim() : undefined,
        metodePembayaran: metodePembayaran || 'Tunai',
        buktiUrl: buktiUrl || undefined,
        statusVerification: 'Terverifikasi',
      },
      editingTransaction?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                {editingTransaction ? 'Edit Catatan Transaksi Kas' : 'Catat Transaksi Kas Baru'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                Laporan Kas Keuangan DKM Real-Time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Jenis Transaksi Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Alur Transaksi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleJenisChange('pemasukan')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                  jenis === 'pemasukan'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                <span>Pemasukan (+) Kas</span>
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
                onChange={(e) => setDanaKat(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {posDanaList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
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
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  <span>+ Kelola Master Data</span>
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
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                {metodePembayaranList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lampiran Bukti Gambar / Struk (Opsional) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Foto Bukti Transaksi / Nota / Struk <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              {buktiUrl && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Foto Terlampir</span>
                </span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageFileChange}
              className="hidden"
              id="bukti-transaksi-input"
            />

            {!buktiUrl ? (
              <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3.5 sm:p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isCompressing
                    ? 'border-emerald-300 bg-emerald-50/50 cursor-wait'
                    : 'border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/40 bg-slate-50'
                }`}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-1 text-emerald-700 py-1">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-semibold">Mengoptimalkan ukuran gambar bukti...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk Ambil Foto / Upload Gambar Bukti
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Format JPG, PNG, WEBP · Otomatis dikompresi agar hemat memori
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => setPreviewModalOpen(true)}
                    className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex-shrink-0 cursor-pointer group relative"
                  >
                    <img
                      src={buktiUrl}
                      alt="Pratinjau Bukti"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Bukti Foto Terlampir
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Siap disimpan bersama catatan kas
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Ukuran Penuh</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Ganti</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveBukti}
                    className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                    title="Hapus Bukti"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Catatan Transaksi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Internal Preview Lightbox Modal */}
      {previewModalOpen && buktiUrl && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Pratinjau Foto Bukti Transaksi
              </h4>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-900 rounded-xl p-2">
              <img
                src={buktiUrl}
                alt="Pratinjau Bukti"
                className="max-h-[55vh] max-w-full object-contain rounded"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
