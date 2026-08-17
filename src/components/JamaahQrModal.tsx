import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  ShieldCheck,
  Eye,
  Building2,
  Smartphone,
  Share2,
  FileText,
  Tv,
  ListFilter
} from 'lucide-react';
import QRCode from 'qrcode';
import { MosqueProfile } from '../types';

interface JamaahQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueProfile: MosqueProfile;
  onOpenJamaahView?: (tab?: 'dashboard' | 'transactions' | 'monthlyReport' | 'analytics' | 'tvMode') => void;
}

export const JamaahQrModal: React.FC<JamaahQrModalProps> = ({
  isOpen,
  onClose,
  mosqueProfile,
  onOpenJamaahView,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<
    'portal' | 'monthlyReport' | 'transactions' | 'tvMode'
  >('portal');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>('');

  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      setBaseUrl(`${origin}${pathname}`);
    }
  }, []);

  // Compute full URL for Jamaah
  const getFullJamaahUrl = () => {
    if (!baseUrl) return '';
    if (selectedDestination === 'portal') {
      return `${baseUrl}?view=jamaah`;
    }
    return `${baseUrl}?view=jamaah&tab=${selectedDestination}`;
  };

  const currentUrl = getFullJamaahUrl();

  // Generate high-resolution QR Code data URL whenever target URL changes
  useEffect(() => {
    if (!currentUrl) return;

    QRCode.toDataURL(currentUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#064e3b', // emerald-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    const safeName = (mosqueProfile.namaMasjid || 'masjid')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    link.download = `qrcode-transparansi-kas-${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPoster = () => {
    window.print();
  };

  const handleOpenDirect = () => {
    if (onOpenJamaahView) {
      onClose();
      if (selectedDestination === 'portal') {
        onOpenJamaahView('dashboard');
      } else {
        onOpenJamaahView(selectedDestination);
      }
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header (Hidden when printing poster) */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                <span>Barcode Transparansi Kas Jamaah</span>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/50">
                  Read-Only (Hanya Lihat)
                </span>
              </h3>
              <p className="text-xs text-emerald-200/90">
                Pindai untuk melihat laporan keuangan & bukti kas tanpa izin edit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Printable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
          {/* Destination Selector (Screen only) */}
          <div className="space-y-2 print:hidden">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Halaman Tujuan Saat Barcode Dipindai:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDestination('portal')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  selectedDestination === 'portal'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className={`w-4 h-4 ${selectedDestination === 'portal' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {selectedDestination === 'portal' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Portal Utama</div>
                  <div className="text-[10px] text-slate-500">Ikhtisar & seluruh kas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('monthlyReport')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  selectedDestination === 'monthlyReport'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className={`w-4 h-4 ${selectedDestination === 'monthlyReport' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {selectedDestination === 'monthlyReport' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Laporan Bulanan</div>
                  <div className="text-[10px] text-slate-500">Rincian & narasi AI</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('transactions')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  selectedDestination === 'transactions'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ListFilter className={`w-4 h-4 ${selectedDestination === 'transactions' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {selectedDestination === 'transactions' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Jurnal & Foto Bukti</div>
                  <div className="text-[10px] text-slate-500">Mutasi & nota struk</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDestination('tvMode')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  selectedDestination === 'tvMode'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Tv className={`w-4 h-4 ${selectedDestination === 'tvMode' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  {selectedDestination === 'tvMode' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Papan Display TV</div>
                  <div className="text-[10px] text-slate-500">Layar mading digital</div>
                </div>
              </button>
            </div>
          </div>

          {/* Poster Preview Card (Designed for Screen & Print) */}
          <div
            ref={posterRef}
            className="bg-gradient-to-b from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border-2 border-amber-400/40 shadow-xl space-y-6 relative overflow-hidden print:bg-white print:text-black print:border-2 print:border-slate-800 print:rounded-none print:shadow-none print:p-8"
          >
            {/* Mosque Header in Poster */}
            <div className="text-center space-y-2 border-b border-emerald-800/80 pb-5 print:border-slate-300">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-widest print:text-slate-800 print:bg-slate-100 print:border-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Transparansi Kas Jamaah</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-slate-900">
                {mosqueProfile.namaMasjid}
              </h2>

              <p className="text-xs text-emerald-200/90 max-w-md mx-auto print:text-slate-600">
                {[mosqueProfile.alamat, mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '', mosqueProfile.kota].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Middle QR Code Display */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              {/* QR Container */}
              <div className="bg-white p-3.5 rounded-2xl shadow-2xl border-4 border-amber-400/60 shrink-0 print:border-2 print:border-slate-800 print:shadow-none">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Barcode Transparansi ${mosqueProfile.namaMasjid}`}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400">
                    Memuat Barcode...
                  </div>
                )}
                <div className="text-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    SCAN DENGAN KAMERA HP
                  </span>
                </div>
              </div>

              {/* Instructions & Features for Jamaah */}
              <div className="space-y-3.5 max-w-xs text-center sm:text-left">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-300 print:text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400 print:text-slate-700" />
                    <span>Akses Keuangan Real-Time</span>
                  </h4>
                  <p className="text-xs text-emerald-100/90 print:text-slate-700 leading-relaxed">
                    Arahkan kamera smartphone Anda ke Barcode / QR Code di samping untuk membuka laporan keuangan masjid kapan saja.
                  </p>
                </div>

                <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/60 space-y-1.5 text-xs text-emerald-100 print:bg-slate-50 print:text-slate-800 print:border-slate-300">
                  <div className="font-bold text-amber-300 print:text-slate-900 text-[11px] uppercase tracking-wider">
                    Informasi Yang Dapat Dilihat:
                  </div>
                  <ul className="space-y-1 text-[11px] list-disc list-inside">
                    <li>Sisa Saldo Kas & Mutasi Terkini</li>
                    <li>Laporan Kas Bulanan & Tahunan</li>
                    <li>Foto Lampiran Nota / Bukti Transaksi</li>
                    <li>Status Infaq & Sedekah Jamaah</li>
                  </ul>
                </div>

                <div className="text-[11px] text-emerald-300/80 print:text-slate-500 font-medium italic">
                  *Akses bersifat Hanya Lihat (Read-Only) yang terverifikasi resmi oleh DKM.
                </div>
              </div>
            </div>

            {/* Poster Footer: Rekening Infaq */}
            <div className="bg-emerald-950/90 p-4 rounded-xl border border-emerald-800 text-center space-y-1 print:bg-slate-100 print:border-slate-300 print:text-slate-900">
              <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider print:text-slate-700">
                Rekening Resmi Infaq & Shodaqoh Masjid:
              </div>
              <div className="text-sm font-mono font-bold text-amber-300 print:text-slate-900">
                {mosqueProfile.namaBank}: {mosqueProfile.nomorRekening} (a.n {mosqueProfile.anRekening})
              </div>
            </div>
          </div>

          {/* Quick URL Box & Actions (Screen only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 print:hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Tautan Akses Langsung Jamaah:</span>
              <span className="text-[11px] text-emerald-700 font-medium">Bisa dibagikan ke WhatsApp Jamaah</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Screen only) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh Gambar QR (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPoster}
              className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>Cetak Poster Mading (A4)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDirect}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buka Tampilan Jamaah</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
