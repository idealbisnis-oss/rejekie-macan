import React, { useState } from "react";
import { Lock, Mail, Phone, User, Building, ShieldCheck, ArrowRight, UserPlus, LogIn, CheckCircle } from "lucide-react";
import { UserRole } from "../types";

interface HalamanAuthProps {
  onLoginSubmit: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  onRegisterSubmit: (userData: any) => Promise<{ success: boolean; message?: string; user?: any }>;
  onLoginSuccess: (user: any) => void;
}

export default function HalamanAuth({ onLoginSubmit, onRegisterSubmit, onLoginSuccess }: HalamanAuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // State Login
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // State Register
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<string>("MAKELAR_BARANG");
  const [regKtp, setRegKtp] = useState("");
  const [regOrg, setRegOrg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    const res = await onLoginSubmit(loginEmailOrPhone, loginPassword);
    setIsLoggingIn(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.message || "Gagal masuk. Periksa email/No HP dan password.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccessMsg("");
    setIsRegistering(true);

    const res = await onRegisterSubmit({
      fullName: regFullName,
      email: regEmail,
      phoneNumber: regPhone,
      password: regPassword,
      role: regRole,
      ktpNumber: regKtp,
      organization: regOrg
    });

    setIsRegistering(false);

    if (res.success && res.user) {
      setRegisterSuccessMsg("🎉 Pendaftaran berhasil! Akun Anda telah tersimpan ke Server Database.");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1200);
    } else {
      setRegisterError(res.message || "Gagal mendaftar. Silakan coba lagi.");
    }
  };

  // Quick demo login helpers
  const handleQuickLogin = async (email: string, pass: string) => {
    setLoginEmailOrPhone(email);
    setLoginPassword(pass);
    setIsLoggingIn(true);
    const res = await onLoginSubmit(email, pass);
    setIsLoggingIn(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4">
      {/* Tab Switcher */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80">
        <button
          onClick={() => {
            setAuthMode("login");
            setLoginError("");
          }}
          className={`w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            authMode === "login"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LogIn size={16} />
          <span>Login Member</span>
        </button>

        <button
          onClick={() => {
            setAuthMode("register");
            setRegisterError("");
            setRegisterSuccessMsg("");
          }}
          className={`w-1/2 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            authMode === "register"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserPlus size={16} />
          <span>Daftar Member Baru</span>
        </button>
      </div>

      {/* LOGIN FORM */}
      {authMode === "login" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Masuk ke Akun Rejeki Macan</h2>
            <p className="text-xs text-slate-500">
              Gunakan email atau nomor WhatsApp yang telah terdaftar di database server.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email atau Nomor WhatsApp:</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="admin@rejekimacan.com atau 08123456789"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Password:</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Password akun Anda..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoggingIn ? "Memverifikasi..." : "Masuk ke Server"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Akses Cepat Uji Coba Demo:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@rejekimacan.com", "admin123")}
                className="p-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-left border border-slate-700 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] text-amber-400 font-black">👑 Super Admin</p>
                  <p className="text-[10px] text-slate-300">admin@rejekimacan.com</p>
                </div>
                <ArrowRight size={14} className="text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("hendra@broker.id", "user123")}
                className="p-2.5 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all text-left border border-slate-300 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] text-emerald-700 font-black">👤 Broker Hendra</p>
                  <p className="text-[10px] text-slate-500">hendra@broker.id</p>
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER FORM */}
      {authMode === "register" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Pendaftaran Member Baru</h2>
            <p className="text-xs text-slate-500">
              Daftarkan identitas broker/mediator Anda untuk mulai bertransaksi di Rejeki Macan.
            </p>
          </div>

          {registerError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-center">
              {registerError}
            </div>
          )}

          {registerSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-center flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{registerSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Nama Lengkap: <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Subagyo"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="ahmad@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">No. WhatsApp / HP: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Peran Utama Broker: <span className="text-red-500">*</span></label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="MAKELAR_BARANG">Makelar / Broker Barang (Penjual)</option>
                  <option value="MAKELAR_BUYER">Makelar / Broker Buyer (Pembeli)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nomor KTP / NIK (Opsional):</label>
                <input
                  type="text"
                  placeholder="16 digit NIK..."
                  value={regKtp}
                  onChange={(e) => setRegKtp(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nama Perusahaan / PT (Opsional):</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Contoh: PT Broker Sejahtera"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{isRegistering ? "Mendaftarkan..." : "Daftar & Simpan ke Database"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
