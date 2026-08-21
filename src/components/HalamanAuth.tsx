import React, { useState } from "react";
import { Lock, Mail, Phone, User, Building, ShieldCheck, ArrowRight, UserPlus, LogIn, CheckCircle, CreditCard, Upload, X, FileText, Camera, ShieldAlert, CheckSquare, Square, FileCheck } from "lucide-react";
import { UserRole } from "../types";

interface HalamanAuthProps {
  onLoginSubmit: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; message?: string; user?: any }>;
  onRegisterSubmit: (userData: any) => Promise<{ success: boolean; message?: string; user?: any }>;
  onLoginSuccess: (user: any) => void;
}

export default function HalamanAuth({ onLoginSubmit, onRegisterSubmit, onLoginSuccess }: HalamanAuthProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // State Terms & Conditions
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [termsCheckboxChecked, setTermsCheckboxChecked] = useState<boolean>(false);

  // State Login
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // State Register
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmailOrPhone, setRegEmailOrPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<string>("MAKELAR_BARANG");
  const [regKtp, setRegKtp] = useState("");
  const [regKtpImageUrl, setRegKtpImageUrl] = useState<string>("");
  const [regOrg, setRegOrg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState("");

  const handleKtpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setRegisterError("Ukuran foto KTP terlalu besar (Maksimal 10MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRegKtpImageUrl(reader.result as string);
        setRegisterError("");
      };
      reader.readAsDataURL(file);
    }
  };

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

    if (!regFullName.trim()) {
      setRegisterError("Nama Lengkap (sesuai KTP) wajib diisi.");
      return;
    }

    if (!regEmailOrPhone.trim()) {
      setRegisterError("Email atau Nomor WhatsApp / HP wajib diisi.");
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegisterError("Password wajib diisi minimal 6 karakter.");
      return;
    }

    const cleanKtp = (regKtp || "").replace(/\D/g, "");
    if (cleanKtp.length < 16) {
      setRegisterError("Nomor KTP / NIK wajib diisi (tepat 16 digit angka).");
      return;
    }

    if (!regKtpImageUrl) {
      setRegisterError("Foto KTP / Identitas wajib diunggah untuk proses verifikasi KYC.");
      return;
    }

    setIsRegistering(true);

    const rawContact = regEmailOrPhone.trim();
    const isEmail = rawContact.includes("@");
    const emailVal = isEmail ? rawContact : "";
    const phoneVal = !isEmail ? rawContact : "";

    try {
      const res = await onRegisterSubmit({
        fullName: regFullName.trim(),
        username: (regUsername || regFullName).trim(),
        emailOrPhone: rawContact,
        email: emailVal,
        phoneNumber: phoneVal,
        password: regPassword,
        role: regRole,
        ktpNumber: cleanKtp,
        ktpImageUrl: regKtpImageUrl,
        organization: regOrg.trim()
      });

      setIsRegistering(false);

      if (res && res.success && res.user) {
        setRegisterSuccessMsg("🎉 Pendaftaran berhasil! Akun & data Anda telah tersimpan.");
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1000);
      } else {
        setRegisterError((res && res.message) || "Gagal mendaftar. Silakan periksa kembali data Anda.");
      }
    } catch (err: any) {
      setIsRegistering(false);
      setRegisterError(err?.message || "Terjadi kendala saat mendaftar. Silakan coba kembali.");
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
                  placeholder="Masukkan email atau nomor WhatsApp Anda"
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

            {/* Quick Demo Login Credentials */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Admin Demo:</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmailOrPhone("admin@rejekimacan.com");
                  setLoginPassword("admin123");
                }}
                className="font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Isi Kredensial Super Admin
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REGISTER FLOW: STEP 1 (TERMS & CONDITIONS) OR STEP 2 (REGISTER FORM) */}
      {authMode === "register" && !termsAgreed && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider">
              <FileCheck size={14} className="text-amber-600" />
              <span>Syarat & Ketentuan Penggunaan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Perjanjian Member & Etika Mediator</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Harap baca dan setujui pedoman operasional transaksi, verifikasi KYC, dan etika mediasi sebelum mendaftar ke jaringan REJEKI MACAN.
            </p>
          </div>

          {/* Scrollable Terms Content */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 max-h-72 overflow-y-auto space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-black">1</span>
                <span>Kredensial & Wajib Verifikasi KYC (KTP)</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Setiap member wajib melampirkan Nomor Induk Kependudukan (NIK 16 digit) dan Foto KTP asli yang valid. Member yang belum diverifikasi KYC oleh Admin Central <strong>tidak dapat mempublikasikan proyek penawaran (Supply) maupun permintaan (Demand)</strong> demi menjaga keamanan transaksi.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-black">2</span>
                <span>Integritas & Keabsahan Listing (A1 Valid)</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Dilarang keras mempublikasikan proyek fiktif, komoditas bodong, tanah sengketa, atau klaim kepemilikan tanpa hak kuasa resmi. Seluruh informasi spesifikasi, harga, dan lokasi wajib dapat dipertanggungjawabkan secara hukum.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-black">3</span>
                <span>Etika Mediasi Broker & Larangan Bypass</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Sistem mediasi difasilitasi oleh platform untuk mempertemukan perwakilan Penjual (Supply) dan perwakilan Pembeli (Demand) secara adil. Segala bentuk tindakan bypass, pemotongan komisi sepihak, atau kecurangan relasi akan ditindak tegas.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-black">4</span>
                <span>Kerahasiaan Kontak & Mediasi Terbimbing</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Nomor kontak pemilik aset dilindungi dengan sistem kunci kontak (contact locking). Pembukaan kontak resmi hanya diproses melalui Ruang Chat Mediasi yang diawasi oleh Admin platform setelah kedua pihak terverifikasi siap transaksi.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] flex items-center justify-center font-black">5</span>
                <span>Masa Aktif Iklan & Biaya Perpanjangan</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Setiap proyek yang disetujui Admin mendapatkan durasi tayang <strong>Gratis 10 Hari Pertama</strong>. Setelah 10 hari, perpanjangan masa aktif iklan dikenakan tarif terjangkau <strong>Rp 500 / hari</strong> menggunakan saldo deposit akun.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[10px] flex items-center justify-center font-black">6</span>
                <span>Sanksi & Pemblokiran Akun</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 pl-5.5">
                Penyalahgunaan platform, pemalsuan identitas KTP, penipuan, atau perusakan reputasi transaksi akan berakibat pada pemblokiran akun permanen dan blacklist NIK seumur hidup.
              </p>
            </div>
          </div>

          {/* Interactive Checkbox */}
          <div 
            onClick={() => setTermsCheckboxChecked(!termsCheckboxChecked)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              termsCheckboxChecked 
                ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20" 
                : "bg-slate-50 border-slate-300 hover:border-slate-400"
            }`}
          >
            <div className="shrink-0 mt-0.5 text-amber-600">
              {termsCheckboxChecked ? (
                <CheckSquare size={18} className="text-amber-600 fill-amber-500 text-white" />
              ) : (
                <Square size={18} className="text-slate-400" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Saya telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan di atas.
              </p>
              <p className="text-[11px] text-slate-500">
                Saya bersedia melengkapi data identitas asli & mematuhi kode etik mediator REJEKI MACAN.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setTermsCheckboxChecked(false);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              ← Batal / Kembali ke Login
            </button>

            <button
              type="button"
              disabled={!termsCheckboxChecked}
              onClick={() => {
                if (termsCheckboxChecked) {
                  setTermsAgreed(true);
                }
              }}
              className={`w-full sm:flex-1 py-3 px-4 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                termsCheckboxChecked
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>Saya Menyetujui & Lanjut Daftar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* REGISTER FORM */}
      {authMode === "register" && termsAgreed && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Formulir Pendaftaran Member</h2>
              <p className="text-xs text-slate-500">Lengkapi data identitas & KTP asli untuk pendaftaran broker baru.</p>
            </div>
            <button
              type="button"
              onClick={() => setTermsAgreed(false)}
              className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              title="Lihat Syarat & Ketentuan"
            >
              <FileCheck size={13} />
              <span>Syarat & Ketentuan (✓ Disetujui)</span>
            </button>
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

          <form noValidate onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nama Lengkap (KTP): <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Contoh: Ahmad Subagyo"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>Username / Nickname:</span>
                  <span className="text-[10px] text-amber-600 font-bold">🔒 Tampil di Publik</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-amber-500" size={16} />
                  <input
                    type="text"
                    placeholder="Contoh: Broker_Ahmad / AhmadProp"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-amber-50/20 border border-amber-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Email / WhatsApp & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email atau No. WhatsApp / HP: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Contoh: ahmad@gmail.com atau 081234567890"
                    value={regEmailOrPhone}
                    onChange={(e) => setRegEmailOrPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password: <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Peran Utama Broker & Nama Perusahaan */}
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

            {/* Nomor KTP / NIK */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Nomor KTP / NIK (16 Digit): <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setRegKtp("317101" + Math.floor(1000000000 + Math.random() * 9000000000))}
                  className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  + Contoh NIK Otomatis
                </button>
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Masukkan 16 digit NIK KTP..."
                  value={regKtp}
                  onChange={(e) => setRegKtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* UNGGAH FOTO KTP / IDENTITAS RESMI (WAJIB) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Unggah Foto KTP / Identitas Resmi: <span className="text-red-500">*</span>
                </label>
                {!regKtpImageUrl && (
                  <button
                    type="button"
                    onClick={() => setRegKtpImageUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600")}
                    className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    + Pakai Contoh Foto KTP
                  </button>
                )}
              </div>

              {regKtpImageUrl ? (
                <div className="relative p-3 bg-amber-50/60 border border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={regKtpImageUrl}
                      alt="Foto KTP / Identitas"
                      className="w-16 h-12 object-cover rounded-lg border border-amber-400 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                        <span>Foto KTP Terlampir</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">Selesai diunggah. Siap diverifikasi Admin.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegKtpImageUrl("")}
                    className="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200 cursor-pointer shrink-0"
                    title="Ganti / Hapus Foto KTP"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/70 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleKtpFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-amber-100 text-amber-800 group-hover:scale-110 transition-transform rounded-xl flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Klik / Drag & Drop untuk Unggah Foto KTP
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Format PNG/JPG (Maks 10MB). Pastikan foto identitas terlihat jelas.
                    </p>
                  </div>
                </label>
              )}
            </div>

            {registerError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-center">
                ⚠️ {registerError}
              </div>
            )}

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
