import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  sendPasswordReset,
} from '../lib/firebase';

interface AuthAccountTabProps {
  currentUser: User | any | null;
  isSyncing?: boolean;
}

export const AuthAccountTab: React.FC<AuthAccountTabProps> = ({
  currentUser,
  isSyncing = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Berhasil masuk dengan akun Google! Data kas tersinkron otomatis.');
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Alamat email harus diisi.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      const res = await sendPasswordReset(email.trim());
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          `Link instruksi reset password telah dikirim ke email ${email}. Silakan periksa kotak masuk/spam email Anda.`
        );
      }
      return;
    }

    if (!password) {
      setErrorMsg('Password harus diisi.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok. Silakan samakan kedua kolom password.');
        return;
      }

      setIsLoading(true);
      const res = await registerWithEmail(email.trim(), password);
      setIsLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        if (res.isLocalFallback) {
          setSuccessMsg(
            `Akun DKM Pengurus (${email.trim()}) berhasil dibuat & diaktifkan! Anda telah otomatis masuk.`
          );
        } else {
          setSuccessMsg('Akun Firebase DKM baru berhasil dibuat! Anda sekarang telah otomatis masuk.');
        }
        resetForm();
      }
    } else if (mode === 'login') {
      setIsLoading(true);
      const res = await loginWithEmail(email.trim(), password);
      setIsLoading(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Berhasil masuk sebagai ${email.trim()}! Data kas DKM tersinkron.`);
        resetForm();
      }
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const res = await logoutUser();
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Anda telah keluar dari akun.');
    }
  };

  const handleQuickPasswordReset = async () => {
    if (!currentUser?.email) return;
    setIsLoading(true);
    const res = await sendPasswordReset(currentUser.email);
    setIsLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(`Link reset password telah dikirim ke ${currentUser.email}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Messages */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Logged In View */}
      {currentUser ? (
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-800 text-amber-300 rounded-full flex items-center justify-center font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Akun DKM Terhubung
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sync Aktif</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Sinkronisasi Lintas Perangkat Berjalan</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Seluruh perubahan transaksi, profil masjid, dan kategori kas
              tersimpan secara otomatis di cloud Firebase. Buka aplikasi di HP,
              tablet, atau laptop lain dengan akun ini untuk sinkronisasi instan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickPasswordReset}
              disabled={isLoading}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kirim Reset Password via Email</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      ) : (
        /* Not Logged In - Login / Register / Forgot Form */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          {/* Mode Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                mode === 'register'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun Baru</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('forgot')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                mode === 'forgot'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lupa Password</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 italic">
            {mode === 'login' &&
              'Masuk dengan akun DKM untuk mengaktifkan sinkronisasi cloud real-time antar perangkat.'}
            {mode === 'register' &&
              'Daftarkan akun DKM baru untuk dapat mengakses data kas dari mana saja secara otomatis.'}
            {mode === 'forgot' &&
              'Masukkan email Anda untuk menerima pesan instruksi reset password.'}
          </p>

          {/* Quick Google Sign-In Option */}
          {mode !== 'forgot' && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {mode === 'register'
                    ? 'Daftar Instan dengan Akun Google'
                    : 'Masuk Instan dengan Akun Google'}
                </span>
              </button>

              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 absolute">
                  atau via email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email DKM
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="masjid.dkm@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Password Field (for Login / Register) */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  {/* Perlihatkan Password Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Sembunyikan Password' : 'Perlihatkan Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (for Register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Password (Konfirmasi)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  {/* Perlihatkan Password Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showConfirmPassword ? 'Sembunyikan Password' : 'Perlihatkan Password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn className="w-4 h-4" />
                ) : mode === 'register' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? 'Memproses...'
                    : mode === 'login'
                    ? 'Masuk Ke Akun DKM'
                    : mode === 'register'
                    ? 'Daftar Akun Baru'
                    : 'Kirim Link Reset Password'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
