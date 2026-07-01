import React, { useState } from "react";
import { UserCheck, ShieldAlert, CheckCircle, AlertCircle, RefreshCw, Landmark, HelpCircle, CreditCard } from "lucide-react";
import { UserSession, UserRole, KYCStatus } from "../types";
import { DEMO_USERS } from "../data/mockData";

interface RegistrationKYCProps {
  currentUser: UserSession;
  onUserChange: (user: UserSession) => void;
  onUpdateKYC: (status: KYCStatus, data?: Partial<UserSession>) => void;
  productionViewMode?: "demo" | "real_guest" | "real_member";
}

export default function RegistrationKYC({ currentUser, onUserChange, onUpdateKYC, productionViewMode = "demo" }: RegistrationKYCProps) {
  const [roleInput, setRoleInput] = useState<UserRole>(currentUser.role);
  const [ktpInput, setKtpInput] = useState(currentUser.ktpNumber || "");
  const [orgInput, setOrgInput] = useState(currentUser.organization || "");
  const [fullNameInput, setFullNameInput] = useState(currentUser.fullName);
  const [phoneNumberInput, setPhoneNumberInput] = useState(currentUser.phoneNumber);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpInput || ktpInput.length < 16) {
      alert("Nomor NIK KTP harus terdiri dari 16 karakter angka.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateKYC(KYCStatus.PENDING, {
        fullName: fullNameInput,
        phoneNumber: phoneNumberInput,
        role: roleInput,
        ktpNumber: ktpInput,
        organization: orgInput
      });
      setIsSubmitting(false);
      if (productionViewMode === "real_guest") {
        alert("🎉 REGISTRASI SIMULASI BERHASIL!\n\nDi website real, Admin akan memvalidasi NIK Anda dalam 5 menit.\n\nUntuk menguji alur sebagai broker terverifikasi KYC secara langsung, silakan klik tombol 'Member (Broker)' pada panel hitam 'PILIH PERSPEKTIF TAMPILAN WEBSITE' di bagian paling atas!");
      } else {
        alert("🎉 Berhasil Mengajukan Registrasi!");
      }
    }, 1000);
  };

  const simulateAdminApproval = (approve: boolean) => {
    if (approve) {
      onUpdateKYC(KYCStatus.VERIFIED);
    } else {
      onUpdateKYC(KYCStatus.REJECTED);
    }
  };

  const handleDemoUserSelect = (userId: string) => {
    const selected = DEMO_USERS.find(u => u.id === userId);
    if (selected) {
      onUserChange({ ...selected });
      setRoleInput(selected.role);
      setKtpInput(selected.ktpNumber || "");
      setOrgInput(selected.organization || "");
      setFullNameInput(selected.fullName);
      setPhoneNumberInput(selected.phoneNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Selector Box */}
      {productionViewMode === "demo" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold text-amber-700 tracking-wider uppercase">Sandbox Simulator</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mt-1">Uji Coba Multi-Role & Simulasi KYC</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pilih profil demo di bawah ini untuk melihat tampilan web dari sudut pandang peran broker yang berbeda.</p>
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <label className="text-[11px] font-bold text-slate-500 uppercase whitespace-nowrap">Pilih User:</label>
              <select
                onChange={(e) => handleDemoUserSelect(e.target.value)}
                value={currentUser.id}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-700 shadow-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="user-1">Doni Pratama (Belum KYC / Guest)</option>
                <option value="user-2">Hendra Wijaya (Makelar Barang - Verified)</option>
                <option value="user-3">Amiruddin (Makelar Buyer - Verified)</option>
                <option value="user-4">Rudi Siswanto (Makelar Barang - Verified)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration & KYC Submission Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="text-amber-500" size={18} />
              Formulasi Pendaftaran Akun Rejeki Macan
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Sebagai gerbang kredibilitas broker, lengkapi data administratif Anda di bawah ini demi keamanan listing bersama.
            </p>
          </div>

          <form onSubmit={handleSubmitKYC} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap (Sesuai KTP)</label>
                <input
                  type="text"
                  required
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="Contoh: Hendra Wijaya"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">No. WhatsApp Utama (Pembeli & Penjual)</label>
                <input
                  type="text"
                  required
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="Contoh: +628123456789"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Spesialisasi Mediator (Hak Akses)</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                >
                  <option value={UserRole.MAKELAR_BARANG}>Makelar Barang / Mediator Suplier (Cari Pembeli)</option>
                  <option value={UserRole.MAKELAR_BUYER}>Makelar Buyer / Mediator Funder (Cari Barang)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Peran ini membedakan kategori utama menu postingan info di dashboard Anda.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor NIK KTP (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={ktpInput}
                  onChange={(e) => setKtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 3273012345670001"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors font-mono tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">Diperlukan untuk memvalidasi status broker fiktif.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Perusahaan / Asosiasi Broker (Opsional)</label>
              <input
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                placeholder="Contoh: CV Indo Berkah Brokerage / AREBI Jabar"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
              />
            </div>

            {/* Simulated Selfie Upload Placeholder */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 hover:bg-slate-300 transition-colors rounded-lg flex items-center justify-center text-slate-500 shrink-0 select-none">
                <CreditCard size={24} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">Unggah Foto KTP & Selfie Memegang KTP</p>
                <p className="text-[11px] text-slate-400">Format file PNG/JPG maksimal 5MB. Pastikan wajah dan detail NIK terbaca jelas.</p>
              </div>
            </div>

            <div className="pt-3">
              {currentUser.kycStatus === KYCStatus.VERIFIED ? (
                <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-3 rounded-xl border border-emerald-200 flex gap-2">
                  <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Status KYC Saat Ini: Terverifikasi (VERIFIED)</span>
                    Akun Anda telah diaktifkan secara nasional. Anda dapat memposting info A1 Anda dan mengakses kontak langsung seluruh listing terdaftar.
                  </div>
                </div>
              ) : currentUser.kycStatus === KYCStatus.PENDING ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 text-amber-800 text-xs px-4 py-3 rounded-xl border border-amber-200 flex gap-2">
                    <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5 animate-spin" />
                    <div>
                      <span className="font-bold block">Status KYC Saat Ini: Sedang Ditinjau (PENDING)</span>
                      Dokumen pendaftaran KTP Anda sudah kami unduh. Menunggu kecocokan data dari tim kependudukan.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => simulateAdminApproval(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Simulasikan Admin Setujui KYC
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateAdminApproval(false)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Simulasikan Tolak KYC
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Memproses Verifikasi Administrasi..." : "Kirim Pengajuan Dokumen KYC"}
                  </button>
                  {currentUser.kycStatus === KYCStatus.REJECTED && (
                    <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[10px] text-rose-700 flex items-center gap-1.5">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Verifikasi sebelumnya ditolak. Silakan periksa keselarasan NIK KTP Anda.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Status Dashboard & Rule Explanation Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Card UI */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Background Accent */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] tracking-widest text-amber-500 font-mono block uppercase">REJEKI MACAN PLATFORM</span>
                <h5 className="text-base font-bold text-white mt-1 uppercase tracking-wide">{currentUser.fullName}</h5>
              </div>
              <div>
                {currentUser.kycStatus === KYCStatus.VERIFIED ? (
                  <span className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} className="fill-[currentColor] stroke-slate-900" />
                    VERIFIED
                  </span>
                ) : currentUser.kycStatus === KYCStatus.PENDING ? (
                  <span className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full flex items-center gap-1 animate-pulse">
                    <RefreshCw size={10} className="animate-spin" />
                    PENDING KYC
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-full flex items-center gap-1">
                    <ShieldAlert size={10} />
                    UNVERIFIED
                  </span>
                )}
              </div>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">ID Broker</span>
                <span className="font-mono text-slate-200">{currentUser.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Hak Akses Menu</span>
                <span className="font-bold text-amber-500">
                  {currentUser.role === UserRole.MAKELAR_BARANG ? "MAKELAR penawaran BARANG" : "MAKELAR pencarian BUYER"}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Nomor Registrasi KTP</span>
                <span className="font-mono text-slate-200">{currentUser.ktpNumber ? `•••• •••• •••• ${currentUser.ktpNumber.slice(-4)}` : "Belum diisi"}</span>
              </div>
              {currentUser.organization && (
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Lembaga/Asosiasi</span>
                  <span className="text-slate-200">{currentUser.organization}</span>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/80 mt-2 font-mono">
              <span>SECURITY CERTIFIED BY PLATFORM</span>
              <span>EST. 2026</span>
            </div>
          </div>

          {/* Separation of access rights info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-slate-700 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-slate-500" />
              Bagaimana Alur Pemisahan Hak Akses Bekerja?
            </h5>
            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4">
              <li>
                <strong>Verifikasi KYC Mandatory:</strong> Sebagian besar data sensitif seperti info nama pelunasan surat tanah or nomor WA rahasia broker kunci ditutup gembok dari orang yang belum terdaftar KYC secara resmi. Hal ini meminimalisir penodongan informasi ("slacking data").
              </li>
              <li>
                <strong>Hak Posting Dashboard Terfilter:</strong> Makelar Barang hanya difokuskan menginput deskripsi kualitas fisik barang mereka sendiri. Makelar Buyer murni melihat kebutuhan dari korporasi pembeli pendana.
              </li>
              <li>
                <strong>Simetri Notifikasi Otomatis:</strong> Sinyal tawaran kecocokan dikirimkan serentak lewat Telegram, mencantumkan label "Verified Broker" guna meminimalisasi negosiasi ilegal.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
