import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Camera,
  Upload,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Building2,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { MosqueProfile } from '../types';

interface QrScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueProfile: MosqueProfile;
  onOpenPublicBoard: () => void;
  onOpenMonthlyReport: () => void;
}

export const QrScanModal: React.FC<QrScanModalProps> = ({
  isOpen,
  onClose,
  mosqueProfile,
  onOpenPublicBoard,
  onOpenMonthlyReport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scan' | 'generate'>('scan');
  
  // Camera scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // QR Code Generation state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Report URL to share/scan
  const publicReportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=public`
    : 'https://masjid-keuangan.app?view=public';

  // Generate QR Data URL
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        publicReportUrl,
        {
          width: 400,
          margin: 2,
          color: {
            dark: '#064e3b', // Emerald 900
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, publicReportUrl]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Camera Scanning start/stop
  useEffect(() => {
    if (isOpen && activeSubTab === 'scan') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      stopScanner();
    };
  }, [isOpen, activeSubTab]);

  const startScanner = async () => {
    setScanError(null);
    setScanResult(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Wait for DOM container
    timerRef.current = setTimeout(async () => {
      const element = document.getElementById('qr-reader-container');
      if (!element) return;

      try {
        if (html5QrcodeRef.current) {
          await stopScanner();
        }

        const html5Qrcode = new Html5Qrcode('qr-reader-container', {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
        });
        html5QrcodeRef.current = html5Qrcode;

        setIsScanning(true);

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success scan
            setScanResult(decodedText);
            setIsScanning(false);
            if (html5QrcodeRef.current) {
              html5QrcodeRef.current.stop().catch(() => {});
            }
            // Vibration feedback if supported
            try {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(200);
              }
            } catch (_) {}
          },
          () => {
            // Ignore scan failure frame errors
          }
        );
      } catch (err: any) {
        setIsScanning(false);
        const errMsg = err?.message || String(err || '');
        if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
          setScanError(
            'Akses kamera ditolak atau tidak diizinkan. Silakan beri izin kamera pada peramban Anda, atau gunakan opsi Upload Foto QR dari Galeri di bawah.'
          );
        } else if (errMsg.includes('NotFoundError') || errMsg.includes('Requested device not found')) {
          setScanError(
            'Kamera tidak ditemukan pada perangkat ini. Silakan gunakan opsi Upload Foto QR dari Galeri.'
          );
        } else {
          setScanError(
            'Tidak dapat memulai pemindai kamera. Gunakan opsi Upload Foto QR dari Galeri atau akses langsung tombol di bawah.'
          );
        }
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      const instance = html5QrcodeRef.current;
      html5QrcodeRef.current = null;
      try {
        if (instance.isScanning) {
          await instance.stop().catch(() => {});
        }
        try {
          instance.clear();
        } catch (_) {}
      } catch (err) {
        // Suppress stop scanner error
      }
    }
    setIsScanning(false);
  };

  // Handle file scan (upload photo of barcode/QR)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScanResult(null);

    try {
      const html5Qrcode = new Html5Qrcode('qr-reader-container-temp', { verbose: false });
      const result = await html5Qrcode.scanFile(file, true);
      setScanResult(result);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.error('Error scanning file:', err);
      setScanError('QR Code atau Barcode tidak terdeteksi pada gambar. Coba gambar lain yang lebih jelas.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicReportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Laporan-Keuangan-${mosqueProfile.namaMasjid.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintQrPoster = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-[#0] z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Scan Barcode & QR Laporan Keuangan
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                Kemudahan akses transparansi kas masjid bagi jamaah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-2 shrink-0 print:hidden">
          <button
            onClick={() => setActiveSubTab('scan')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'scan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Scan Kamera (Masyarakat)
          </button>

          <button
            onClick={() => setActiveSubTab('generate')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'generate'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Cetak QR Laporan DKM
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === 'scan' ? (
            <div className="space-y-5">
              {/* Camera Scanner View */}
              <div className="bg-slate-950 rounded-2xl p-4 text-center border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Pemindai Kamera Aktif
                  </span>
                  <button
                    onClick={startScanner}
                    className="text-slate-400 hover:text-white flex items-center gap-1 underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Muat Ulang
                  </button>
                </div>

                {/* Html5Qrcode Scanner Target */}
                <div
                  id="qr-reader-container"
                  className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black min-h-[220px] flex items-center justify-center border-2 border-emerald-500/50"
                >
                  {!isScanning && !scanResult && !scanError && (
                    <div className="text-slate-400 text-xs p-6 flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-emerald-400 animate-bounce" />
                      Membuka kamera... Mohon izinkan akses kamera pada peramban Anda.
                    </div>
                  )}
                </div>
                <div id="qr-reader-container-temp" className="hidden"></div>

                <p className="text-[11px] text-slate-400">
                  Arahkan kamera smartphone ke Barcode / QR Code Laporan Keuangan Masjid.
                </p>
              </div>

              {/* Error Message */}
              {scanError && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Perhatian Pemindaian</span>
                  </div>
                  <p className="text-[11px] text-amber-800">{scanError}</p>
                </div>
              )}

              {/* Successful Scan Result */}
              {scanResult && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-xl text-slate-900 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Barcode / QR Terdeteksi!
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs font-mono break-all text-slate-700">
                    {scanResult}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPublicBoard();
                      }}
                      className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Buka Papan Transparansi
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMonthlyReport();
                      }}
                      className="flex-1 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      Lihat Laporan Bulanan
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Image Option */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Atau Scan dari Galeri Foto / File Gambar Barcode
                </label>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Pilih File Gambar / Foto QR Barcode</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct Access Quick Buttons */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Akses Langsung Tanpa Scan Kamera:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPublicBoard();
                    }}
                    className="py-2 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 rounded-lg text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Papan Transparansi Kas
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMonthlyReport();
                    }}
                    className="py-2 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 rounded-lg text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Laporan Cetak Bulanan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Generate / Printable Poster QR Tab */
            <div className="space-y-5">
              {/* Printable Poster Banner */}
              <div
                id="qr-printable-poster"
                className="bg-white border-2 border-emerald-800 rounded-2xl p-6 shadow-md text-center space-y-4 print:p-8 print:border-4 print:shadow-none print:m-0"
              >
                {/* Header Poster */}
                <div className="space-y-1 pb-3 border-b-2 border-slate-800">
                  <div className="inline-block bg-emerald-800 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                    Transparansi Keuangan Masjid
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                    DEWAN KEMAKMURAN MASJID (DKM)
                  </h3>
                  <h4 className="text-lg font-black text-emerald-800 uppercase">
                    {mosqueProfile.namaMasjid}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {[
                      mosqueProfile.alamat,
                      mosqueProfile.desa ? `Desa ${mosqueProfile.desa}` : '',
                      mosqueProfile.kota,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                </div>

                {/* QR Code Big Canvas Image */}
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="p-3 bg-white rounded-2xl border-2 border-emerald-600 shadow-md inline-block">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Laporan Keuangan Masjid"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                        Memuat QR Code...
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-widest pt-1">
                    SCAN QR UNTUK MELIHAT LAPORAN KEUANGAN
                  </span>
                  <p className="text-[11px] text-slate-600 max-w-sm">
                    Gunakan kamera smartphone atau aplikasi pemindai QR untuk mengakses laporan rincian pemasukan & pengeluaran kas masjid secara langsung.
                  </p>
                </div>

                {/* Infaq Account Info */}
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center space-y-0.5 text-xs text-slate-800">
                  <div className="font-bold text-emerald-900">Rekening Resmi Infaq Masjid:</div>
                  <div className="font-mono font-extrabold text-emerald-800 text-sm">
                    {mosqueProfile.namaBank} {mosqueProfile.nomorRekening}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    a.n {mosqueProfile.anRekening}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2 print:hidden">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Gambar QR (PNG)
                  </button>

                  <button
                    onClick={handlePrintQrPoster}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Poster QR (A4)
                  </button>
                </div>

                {/* Copy Link Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicReportUrl}
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        Salin Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
