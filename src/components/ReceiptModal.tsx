import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Phone, 
  Copy, 
  Check, 
  Share2,
  Calendar, 
  Tag, 
  Wallet, 
  CreditCard, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen || !transaction || !transaction.buktiUrl) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (!transaction.buktiUrl) return;
    const link = document.createElement('a');
    link.href = transaction.buktiUrl;
    const safeName = (transaction.keterangan || 'bukti-transaksi')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    link.download = `bukti-${transaction.id}-${safeName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const mIdx = parseInt(m, 10) - 1;
      return `${parseInt(d, 10)} ${monthNames[mIdx] || m} ${y}`;
    }
    return dateStr;
  };

  const handleShareWhatsApp = async () => {
    if (!transaction.buktiUrl) return;
    setIsSharing(true);

    const waText = 
      `*BUKTI TRANSAKSI KAS DKM*\n` +
      `• No. Ref: *${transaction.id}*\n` +
      `• Tanggal: *${formatDateIndo(transaction.tanggal)}*\n` +
      `• Keterangan: *${transaction.keterangan}*\n` +
      `• Kategori: ${transaction.kategori} (${transaction.danaKat})\n` +
      `• Nominal: *${transaction.jenis === 'pemasukan' ? '+' : '-'} Rp ${transaction.jumlah.toLocaleString('id-ID')}*\n` +
      (transaction.donatur ? `• Donatur/Pihak: *${transaction.donatur}*\n` : '') +
      `• Metode: ${transaction.metodePembayaran || 'Tunai'}\n\n` +
      `_Tercatat pada Sistem Keuangan DKM Masjid_`;

    try {
      // Try fetching the image to create a File for Web Share
      const res = await fetch(transaction.buktiUrl);
      const blob = await res.blob();
      const file = new File([blob], `Bukti-${transaction.id}.jpg`, { type: blob.type || 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Bukti Transaksi - ${transaction.id}`,
            text: waText,
            files: [file],
          });
          setIsSharing(false);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setIsSharing(false);
            return;
          }
        }
      }

      // Fallback: Copy to clipboard + download + open wa.me
      try {
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ [blob.type || 'image/jpeg']: blob });
          await navigator.clipboard.write([item]);
        }
      } catch (_) {}

      // Trigger download
      handleDownload();

      // Open WhatsApp web
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');

      setToastMsg('Gambar telah diunduh! Silakan lampirkan gambar pada chat WhatsApp.');
      setTimeout(() => setToastMsg(null), 5000);
    } catch (e) {
      console.error(e);
      // Direct WA open fallback
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold">
              📷
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                Bukti Lampiran Foto / Struk
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                {transaction.id} · {formatDateIndo(transaction.tanggal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareWhatsApp}
              disabled={isSharing}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1 transition cursor-pointer"
              title="Bagi Gambar ke WhatsApp"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Phone className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200/30" />
              )}
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 transition cursor-pointer"
              title="Unduh Gambar"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast info */}
        {toastMsg && (
          <div className="bg-emerald-700 text-white px-4 py-1.5 text-xs text-center font-medium animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
              title="Perbesar (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition"
              title="Putar (Rotate 90°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            {(zoomLevel !== 1 || rotation !== 0) && (
              <button
                onClick={handleReset}
                className="ml-2 px-2 py-0.5 rounded text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition"
              >
                Reset
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Zoom: {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Image Container */}
        <div className="p-4 bg-slate-950/90 flex-1 overflow-auto flex items-center justify-center min-h-[260px] max-h-[50vh]">
          <div
            className="transition-transform duration-150 ease-out origin-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={transaction.buktiUrl}
              alt={`Bukti transaksi ${transaction.keterangan}`}
              className="max-w-full max-h-[46vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Transaction Summary Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="font-bold text-slate-900 text-sm">
              {transaction.keterangan}
            </div>
            <div
              className={`text-base font-black ${
                transaction.jenis === 'pemasukan'
                  ? 'text-emerald-700'
                  : 'text-rose-600'
              }`}
            >
              {transaction.jenis === 'pemasukan' ? '+' : '-'} Rp{' '}
              {transaction.jumlah.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
            <div>
              <span className="text-slate-500 block">Kategori</span>
              <span className="font-semibold text-slate-800">{transaction.kategori}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pos Kas</span>
              <span className="font-semibold text-slate-800">{transaction.danaKat}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Metode</span>
              <span className="font-semibold text-slate-800">{transaction.metodePembayaran || 'Tunai'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{transaction.donatur ? 'Donatur' : 'Jenis'}</span>
              <span className="font-semibold text-slate-800">
                {transaction.donatur || (transaction.jenis === 'pemasukan' ? 'Pemasukan Kas' : 'Pengeluaran')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
