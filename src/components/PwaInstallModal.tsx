import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  CheckCircle2,
  Sparkles,
  Share,
  PlusSquare,
  MoreVertical,
  Laptop,
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallClick,
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'desktop' | 'ios'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-800">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Install Kas DKM Masjid</h2>
              <p className="text-xs text-emerald-200">Aplikasi Web Progresif (PWA) Android & Desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Direct One-Click Install Button if Prompt Ready */}
          {deferredPrompt ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
                Perangkat Anda Siap Install Otomatis!
              </div>
              <p className="text-xs text-emerald-800">
                Klik tombol di bawah ini untuk mengunduh dan memasang aplikasi secara instan ke layar utama perangkat Anda.
              </p>
              <button
                onClick={onInstallClick}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Download className="w-5 h-5" />
                INSTALL APLIKASI SEKARANG
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Dukungan PWA Standar Web:</span> Aplikasi ini dapat di-install langsung tanpa melalui Google PlayStore atau AppStore. Gunakan panduan sederhana di bawah sesuai perangkat Anda.
              </div>
            </div>
          )}

          {/* Platform Tabs */}
          <div>
            <div className="flex border-b border-slate-200 gap-2">
              <button
                onClick={() => setActivePlatformTab('android')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                  activePlatformTab === 'android'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android (HP)</span>
              </button>

              <button
                onClick={() => setActivePlatformTab('desktop')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                  activePlatformTab === 'desktop'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>Desktop (PC/Laptop)</span>
              </button>

              <button
                onClick={() => setActivePlatformTab('ios')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                  activePlatformTab === 'ios'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4 text-emerald-600" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4">
              {/* Android Guide */}
              {activePlatformTab === 'android' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Cara Install di HP Android (Google Chrome / Edge):
                  </div>
                  <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed">
                    <li>
                      Buka website ini di browser <span className="font-semibold text-slate-900">Google Chrome</span> HP Android Anda.
                    </li>
                    <li>
                      Ketuk tombol <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border"><MoreVertical className="w-3.5 h-3.5" /> Titik Tiga</span> di pojok kanan atas browser Chrome.
                    </li>
                    <li>
                      Pilih & ketuk menu <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">"Instal Aplikasi"</span> atau <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">"Tambahkan ke Layar Utama"</span>.
                    </li>
                    <li>
                      Konfirmasi dengan menekan tombol <span className="font-bold text-slate-900">Instal</span>. Ikon aplikasi Kas DKM akan muncul di layar utama HP Anda.
                    </li>
                  </ol>
                </div>
              )}

              {/* Desktop Guide */}
              {activePlatformTab === 'desktop' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-600" />
                    Cara Install di Komputer / Laptop (Windows, Mac, Linux):
                  </div>
                  <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed">
                    <li>
                      Gunakan browser <span className="font-semibold text-slate-900">Chrome, Edge, atau Brave</span> di Laptop / PC Anda.
                    </li>
                    <li>
                      Perhatikan bilah alamat URL (Address Bar) di kanan atas, klik ikon <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Install</span>.
                    </li>
                    <li>
                      Atau klik <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border"><MoreVertical className="w-3.5 h-3.5" /> Menu Chrome</span> -&gt; <span className="font-bold text-slate-900">"Simpan dan Bagikan"</span> -&gt; <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">"Install Kas DKM Masjid..."</span>.
                    </li>
                    <li>
                      Aplikasi akan terbuka dalam jendela tersendiri layaknya software desktop bawaan.
                    </li>
                  </ol>
                </div>
              )}

              {/* iOS Guide */}
              {activePlatformTab === 'ios' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Share className="w-4 h-4 text-emerald-600" />
                    Cara Install di iPhone / iPad (Safari):
                  </div>
                  <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed">
                    <li>
                      Buka tautan ini menggunakan browser bawaan <span className="font-semibold text-slate-900">Safari</span>.
                    </li>
                    <li>
                      Ketuk tombol <span className="font-bold text-slate-900 inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border"><Share className="w-3.5 h-3.5 text-blue-600" /> Bagikan (Share)</span> di bagian bawah layar.
                    </li>
                    <li>
                      Gulir ke bawah lalu pilih menu <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" /> Tambah ke Layar Utama</span>.
                    </li>
                    <li>
                      Ketuk <span className="font-bold text-slate-900">Tambah</span> di pojok kanan atas.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
