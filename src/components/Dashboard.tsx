import React, { useState } from "react";
import { 
  PlusCircle, Search, Filter, Phone, CheckCircle, Clock, 
  Lock, RefreshCw, Send, Tag, AlertCircle, FileSpreadsheet,
  Globe, Info, Key, XSquare, MessageSquare, ShieldCheck, ShieldAlert, HelpCircle, Eye, EyeOff,
  Crown, Wallet, ArrowUpRight
} from "lucide-react";
import { SupplyListing, DemandListing, UserSession, UserRole, KYCStatus, ListingStatus, ListingInterest, InterestStatus } from "../types";
import { CATEGORIES } from "../data/mockData";

interface DashboardProps {
  currentUser: UserSession;
  onUserChange: (user: UserSession) => void;
  supplyListings: SupplyListing[];
  demandListings: DemandListing[];
  onAddSupply: (listing: Omit<SupplyListing, "id" | "brokerId" | "brokerName" | "brokerPhone" | "createdAt" | "expiresAt" | "viewsCount">) => void;
  onAddDemand: (listing: Omit<DemandListing, "id" | "brokerId" | "brokerName" | "brokerPhone" | "createdAt" | "expiresAt">) => void;
  onUpdateSupplyStatus: (id: string, status: ListingStatus) => void;
  onUpdateDemandStatus: (id: string, status: ListingStatus) => void;
  onRenewListing: (id: string, type: "supply" | "demand") => void;
  interests: ListingInterest[];
  onCreateInterest: (interestData: Omit<ListingInterest, "id" | "createdAt" | "status">) => void;
  onUpdateInterestStatus: (id: string, status: InterestStatus, adminNotes?: string) => void;
  lastWebhookPayload: any;
  productionViewMode?: "demo" | "real_guest" | "real_member";
}

export default function Dashboard({
  currentUser,
  onUserChange,
  supplyListings,
  demandListings,
  onAddSupply,
  onAddDemand,
  onUpdateSupplyStatus,
  onUpdateDemandStatus,
  onRenewListing,
  interests,
  onCreateInterest,
  onUpdateInterestStatus,
  lastWebhookPayload,
  productionViewMode = "demo"
}: DashboardProps) {
  const [boardTab, setBoardTab] = useState<"supply" | "demand">("supply");
  const [showPostModal, setShowPostModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Expiry states
  const [showExpired, setShowExpired] = useState(false);

  // Admin / Lobby states
  const [sidebarTab, setSidebarTab] = useState<"lobby" | "admin">("lobby");
  const [isAdminMode, setIsAdminMode] = useState(currentUser.role === UserRole.ADMIN || currentUser.email === "idealbisnis@gmail.com");

  // Post form state variables
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [specOrCriteria, setSpecOrCriteria] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("Cash Keras");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [isA1Verified, setIsA1Verified] = useState(false);
  const [fundingCriteria, setFundingCriteria] = useState("");

  // Premium Paid Ads states
  const [isPremiumSelected, setIsPremiumSelected] = useState(false);
  const [premiumDays, setPremiumDays] = useState(3); // Default 3 Hari (Rp 15.000)
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000); // Default isi saldo Rp 100k

  // Automated Phone & Contact Bypass Pattern Detection
  const getBypassDetections = () => {
    const combinedText = `${title} ${specOrCriteria} ${fundingCriteria}`.toLowerCase();
    const flags: string[] = [];
    
    // Clean spaces/hyphens/dots/symbols to find continuous Indonesian phone numbers
    const cleanNumbers = combinedText.replace(/[^0-9]/g, "");
    if (cleanNumbers.length >= 8 && /(?:08|62)\d{6,}/.test(cleanNumbers)) {
      flags.push("Format rangkaian angka berurutan terdeteksi (Indikasi penulisan nomor HP).");
    }

    // Check for spaces-separated telephone numbers (e.g. 0 8 1 2 3) or dashes (0-8-1-2) or "0 8 1" pattern
    const spacedPattern = /(?:\d[\s\.-]{1,3}){8,}/;
    if (spacedPattern.test(combinedText) || combinedText.includes("0 8 1")) {
      flags.push("Nomor terpisah spasi/simbol terdeteksi (Penyelundupan sandi/digit kontak - e.g., '0 8 1').");
    }

    // Check for obvious contact terms or phrases
    const directKeywords = [
      "whatsapp", "wa ", "w a ", "no. hp", "nomor hp", "no hp", 
      "hubungi kami", "ke nomor", "telepon langsung", "hub langsung", 
      "tele:", "t.me/", "hubungi nomor kami", "hubungi kontak", "kontak wa"
    ];
    directKeywords.forEach(word => {
      if (combinedText.includes(word)) {
        flags.push(`Kata kunci penyerobotan kontak terdeteksi: "${word}"`);
      }
    });

    return flags;
  };

  const bypassFlags = getBypassDetections();

  // Interest flow state
  const [interestedListing, setInterestedListing] = useState<SupplyListing | DemandListing | null>(null);
  const [interestedListingType, setInterestedListingType] = useState<"supply" | "demand" | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [successInterestModal, setSuccessInterestModal] = useState(false);

  // Admin Verification state
  const [verifyingInterestId, setVerifyingInterestId] = useState<string | null>(null);
  const [adminVerificationNotes, setAdminVerificationNotes] = useState("");

  const handlePostListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.kycStatus !== KYCStatus.VERIFIED) {
      alert("⚠️ Maaf, Anda harus menyelesaikan verifikasi KYC terlebih dahulu untuk memposting listing transaksi baru di platform Rejeki Macan.");
      return;
    }

    if (!disclaimerChecked) {
      alert("⚠️ Anda wajib menyatakan persetujuan Disclaimer Hukum & Anti-Bypass sebelum mengirim postingan.");
      return;
    }

    // Role-based validation checks from CORE ENGINE (V1.0)
    if (currentUser.role === UserRole.MAKELAR_BARANG) {
      if (!isA1Verified) {
        alert("⚠️ MAKELAR_BARANG wajib melolosi validasi kepemilikan langsung (A1/Pemilik Lahan) untuk memastikan keaslian penawaran!");
        return;
      }
    } else {
      if (!fundingCriteria || fundingCriteria.trim().length < 8) {
        alert("⚠️ MAKELAR_BUYER wajib mencantumkan kriteria pendanaan konkret (misalnya: LOI Resmi, Bukti Dana Mandiri, Bank Statement, SKBDN, dll)!");
        return;
      }
      const bMin = Number(budgetMin);
      const bMax = Number(budgetMax);
      if (isNaN(bMin) || isNaN(bMax) || bMin <= 0 || bMax < bMin) {
        alert("⚠️ MAKELAR_BUYER wajib mengunci rentang anggaran (budget) yang valid! Pastikan budget max >= budget min dan bernilai positif.");
        return;
      }
    }

    const isBypassSuspect = bypassFlags.length > 0;
    const finalStatus: ListingStatus = isBypassSuspect ? "ON_PROGRESS" : "VERIFIED";

    // Deduct balance if premium selected
    let finalIsPremium = false;
    let finalPremiumUntil: string | undefined = undefined;

    if (isPremiumSelected) {
      const premiumCost = premiumDays * 5000;
      const currentBalance = currentUser.balance || 0;
      if (currentBalance < premiumCost) {
        alert(`🚨 SALDO TIDAK CUKUP!\n\nSaldo Anda saat ini: Rp ${currentBalance.toLocaleString("id-ID")}\nKebutuhan untuk premium ${premiumDays} hari: Rp ${premiumCost.toLocaleString("id-ID")}\n\nSilakan kurangi durasi premium atau lakukan Top Up terlebih dahulu.`);
        return;
      }

      // Deduct balance
      onUserChange({
        ...currentUser,
        balance: currentBalance - premiumCost
      });

      finalIsPremium = true;
      const now = new Date();
      finalPremiumUntil = new Date(now.getTime() + premiumDays * 24 * 60 * 60 * 1000).toISOString();
    }

    if (currentUser.role === UserRole.MAKELAR_BARANG) {
      onAddSupply({
        title,
        category,
        specifications: specOrCriteria,
        location,
        price: Number(price),
        status: finalStatus,
        isPremium: finalIsPremium,
        premiumUntil: finalPremiumUntil,
        isSuspicious: isBypassSuspect,
        isA1Verified: isA1Verified
      });
    } else {
      onAddDemand({
        title,
        category,
        criteria: specOrCriteria,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        paymentSystem,
        status: finalStatus,
        isPremium: finalIsPremium,
        premiumUntil: finalPremiumUntil,
        isSuspicious: isBypassSuspect,
        fundingCriteria: fundingCriteria
      });
    }

    // Reset Form
    setTitle("");
    setSpecOrCriteria("");
    setLocation("");
    setPrice("");
    setBudgetMin("");
    setBudgetMax("");
    setPaymentSystem("Cash Keras");
    setDisclaimerChecked(false);
    setIsPremiumSelected(false);
    setPremiumDays(3);
    setIsA1Verified(false);
    setFundingCriteria("");
    setShowPostModal(false);

    if (isBypassSuspect) {
      alert(
        `🚨 PERINGATAN DETEKSI KONTAK!\n\nSistem mengidentifikasi adanya indikasi info kontak langsung/WhatsApp/digit sandi tersembunyi. Iklan Anda tetap kami simpan di database, tetapi statusnya dialihkan ke 'ON_PROGRESS' (Ditangguhkan) untuk ditinjau secara manual oleh Admin sebelum dapat ditayangkan untuk umum.`
      );
    } else {
      if (finalIsPremium) {
        const costStr = (premiumDays * 5000).toLocaleString("id-ID");
        alert(`✅ BERHASIL SEBAGAI PREMIUM!\n\nIklan Anda berhasil dikirim dan diaktifkan sebagai IKLAN PREMIUM selama ${premiumDays} hari! Biaya Rp ${costStr} telah didebet dari saldo Anda. Iklan Anda diposisikan di baris teratas.`);
      } else {
        alert("✅ Iklan Anda berhasil ditayangkan secara publik!");
      }
    }
  };

  const handleRequestInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestedListing || !interestedListingType) return;

    onCreateInterest({
      listingId: interestedListing.id,
      listingTitle: interestedListing.title,
      listingType: interestedListingType,
      ownerBrokerId: interestedListing.brokerId,
      ownerBrokerName: interestedListing.brokerName,
      interestedBrokerId: currentUser.id,
      interestedBrokerName: currentUser.fullName,
      interestedBrokerPhone: currentUser.phoneNumber,
      userMessage: interestMessage
    });

    setInterestMessage("");
    setInterestedListing(null);
    setInterestedListingType(null);
    setSuccessInterestModal(true);
  };

  // Helper to calculate expiration status based on internal simulated current time
  const getExpirationStatus = (expiresAtStr: string) => {
    const now = new Date("2026-06-16T21:43:21-07:00").getTime(); // fixed UTC-7 simulation current time
    const expiresAt = new Date(expiresAtStr).getTime();
    const diffMs = expiresAt - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs <= 0) {
      return { status: "EXPIRED", daysLeft: 0, label: "KADALUARSA (Disembunyikan)", color: "bg-rose-50 text-rose-700 border-rose-500/20" };
    } else if (diffMs <= 24 * 60 * 60 * 1000) {
      return { status: "WARNING", daysLeft: 1, label: "⚠️ KADALUARSA BESOK!", color: "bg-red-50 text-red-600 border-red-500/25 animate-pulse font-bold" };
    } else {
      return { status: "ACTIVE", daysLeft: diffDays, label: `Sisa ${diffDays} Hari`, color: "bg-emerald-50 text-emerald-850 border-emerald-500/15" };
    }
  };

  const filteredSupply = supplyListings.filter(item => {
    const matchesCat = categoryFilter === "Semua" || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.specifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const expiryStr = item.expiresAt || new Date(new Date(item.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const expInfo = getExpirationStatus(expiryStr);
    const matchesExpiry = showExpired || expInfo.status !== "EXPIRED";

    return matchesCat && matchesSearch && matchesExpiry;
  });

  const filteredDemand = demandListings.filter(item => {
    const matchesCat = categoryFilter === "Semua" || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.criteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.paymentSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const expiryStr = item.expiresAt || new Date(new Date(item.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const expInfo = getExpirationStatus(expiryStr);
    const matchesExpiry = showExpired || expInfo.status !== "EXPIRED";

    return matchesCat && matchesSearch && matchesExpiry;
  });

  // Priority queue: Premium first, then chronological order
  const sortedFilteredSupply = [...filteredSupply].sort((a, b) => {
    const aPre = a.isPremium ? 1 : 0;
    const bPre = b.isPremium ? 1 : 0;
    if (bPre !== aPre) return bPre - aPre;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedFilteredDemand = [...filteredDemand].sort((a, b) => {
    const aPre = a.isPremium ? 1 : 0;
    const bPre = b.isPremium ? 1 : 0;
    if (bPre !== aPre) return bPre - aPre;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatIDRCurrency = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Miliar`;
    } else if (val >= 1000000) {
      return `Rp ${(val / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Juta`;
    }
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const isVerifiedUser = currentUser.kycStatus === KYCStatus.VERIFIED;

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Beginner Step-by-Step Multi-Role Guide */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-900/[0.02] border border-amber-500/20 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider text-nowrap">🔥 FITUR BARU & PREMIUM</span>
              <span className="text-xs font-bold text-slate-500">•</span>
              <span className="text-xs font-bold text-slate-600">Premium Ads & Wallet</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Promosikan Iklan Anda Menjadi Iklan Premium Unggulan!</h3>
            <p className="text-xs text-slate-500 leading-normal max-w-2xl">
              Sebagai mediator, dapatkan eksposur maksimal dengan meletakkan iklan penawaran barang atau kebutuhan buyer Anda di bagian <strong className="text-slate-850">teratas papan pencarian</strong>. Biaya iklan premium sangat terjangkau, hanya <strong>Rp 5.000 / hari</strong>. Anda bisa membuat promosi jangka panjang (long-term) sesuai dengan isi saldo dompet deposit broker Anda di samping ini!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
            {/* Peran Switcher Card */}
            <div className="flex flex-col items-center justify-center bg-white border border-slate-200/80 p-3.5 rounded-xl text-center shadow-xs flex-1 sm:min-w-[180px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Peran Aktif Saat Ini</span>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border mb-2.5 ${
                currentUser.role === UserRole.MAKELAR_BARANG 
                  ? "bg-amber-50 text-amber-700 border-amber-300/30" 
                  : "bg-indigo-50 text-indigo-700 border-indigo-300/30"
              }`}>
                {currentUser.role === UserRole.MAKELAR_BARANG ? "💰 Broker Supply" : "🛒 Broker Demand"}
              </div>
              <button
                onClick={() => {
                  const nextRole = currentUser.role === UserRole.MAKELAR_BARANG ? UserRole.MAKELAR_BUYER : UserRole.MAKELAR_BARANG;
                  onUserChange({ ...currentUser, role: nextRole });
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-400 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer w-full"
              >
                <RefreshCw size={12} className="stroke-[2.5]" />
                Switch Peran
              </button>
            </div>

            {/* Dompet Deposit Card */}
            <div className="flex flex-col items-center justify-center bg-amber-50/20 border border-amber-500/25 p-3.5 rounded-xl text-center shadow-xs flex-1 sm:min-w-[200px] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-[8px] font-black text-slate-950 px-2.5 py-0.5 rounded-bl uppercase">
                VIP Wallet
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Dompet Deposit Broker</span>
              <div className="text-base font-black text-slate-950 mb-2.5 tracking-tight flex items-center justify-center gap-1">
                <Wallet className="text-amber-600 shrink-0 animate-bounce" size={16} />
                <span>Rp {(currentUser.balance || 0).toLocaleString("id-ID")}</span>
              </div>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer w-full"
              >
                <ArrowUpRight size={12} className="stroke-[3]" />
                Isi Saldo (Top Up)
              </button>
            </div>
          </div>
        </div>

        {/* Step by Step instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/50 text-xs">
          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
            <span className="text-amber-600 font-extrabold font-mono text-[13px] block">Langkah 1: Cek Tombol Posting</span>
            <p className="text-slate-500 leading-normal text-[11px]">
              Klik tombol <strong className="text-slate-800">+ Posting</strong> di kanan bawah bar aksi. Bidang isian formulir otomatis disesuaikan dengan peran aktif Anda saat ini.
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
            <span className="text-amber-600 font-extrabold font-mono text-[13px] block">Langkah 2: Switch & Bandingkan</span>
            <p className="text-slate-500 leading-normal text-[11px]">
              Klik tombol <strong className="text-slate-800">Beralih Peran</strong>. Lihat bagaimana tombol posting berubah menjadi <i>Posting Kebutuhan Buyer</i> atau <i>Posting Info Barang</i>.
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
            <span className="text-amber-600 font-extrabold font-mono text-[13px] block">Langkah 3: Ajukan Minat Lintas-Peran</span>
            <p className="text-slate-500 leading-normal text-[11px]">
              Jika Anda sedang mengaktifkan peran <strong>Broker Buyer</strong>, Anda bebas melihat-lihat papan listing dan mengajukan minat ke properti/suplai milik seller lain lewat Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle Boards Section */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200 select-none shrink-0 w-full md:w-auto">
          <button
            onClick={() => setBoardTab("supply")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              boardTab === "supply" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag size={14} />
            Info Barang (Supply: {supplyListings.length})
          </button>
          <button
            onClick={() => setBoardTab("demand")}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              boardTab === "demand" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileSpreadsheet size={14} />
            Info Buyer (Demand: {demandListings.length})
          </button>
        </div>

        {/* Action Button: Post Listing */}
        <div className="w-full md:w-auto text-right">
          <button
            onClick={() => {
              if (productionViewMode === "real_guest") {
                alert("⚠️ AKUN BELUM TERDAFTAR!\n\nDi website real nanti, pengunjung umum wajib mendaftar dan memverifikasi KYC terlebih dahulu sebelum dapat memposting penawaran atau kebutuhan di platform.\n\nSilakan klik tab 'Registrasi & KYC' di bagian atas untuk mendaftarkan akun secara real!");
                return;
              }
              if (!isVerifiedUser) {
                alert("⚠️ Mohon verifikasi KYC terlebih dahulu dari tab 'Alur Registrasi & KYC' untuk membuka akses menulis listing!");
              } else {
                setShowPostModal(true);
              }
            }}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide cursor-pointer shadow-sm ${
              isVerifiedUser || productionViewMode === "real_guest"
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95" 
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            <PlusCircle size={15} />
            + Posting {currentUser.role === UserRole.MAKELAR_BARANG ? "Info Barang" : "Kebutuhan Buyer"}
          </button>
          {!isVerifiedUser && productionViewMode !== "real_guest" && (
            <p className="text-[10px] text-amber-700 font-medium mt-1 leading-normal flex items-center gap-1 justify-center md:justify-end">
              <AlertCircle size={11} />
              Fitur posting terkunci. Wajib verifikasi KYC terlebih dahulu.
            </p>
          )}
          {productionViewMode === "real_guest" && (
            <p className="text-[10px] text-rose-600 font-bold mt-1 leading-normal flex items-center gap-1 justify-center md:justify-end">
              <Key size={11} className="animate-pulse" />
              Mode Publik Guest: Wajib Daftar untuk Menulis
            </p>
          )}
        </div>
      </div>

      {/* Grid containing listings and side info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Board List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari kata kunci, lokasi, spek, atau kode broker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0 md:border-r md:pr-3 md:border-slate-100">
              <Filter className="text-slate-400" size={14} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors text-slate-700 font-medium"
              >
                <option value="Semua">Semua Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Toggle to see expired advertisements */}
            <div className="flex items-center gap-2 pl-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock size={12} className="text-slate-400" />
                  Lihat Kadaluarsa {showExpired ? "👁️" : "🙈"}
                </span>
              </label>
            </div>
          </div>

          {/* Expiration Notice Bar */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">Kebijakan Anti-Zombi & Kerahasian Rejeki Macan</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Setiap iklan berumur maksimal <strong>14 Hari</strong>. Melewati batas itu iklan otomatis hilang dari papan pencarian utama untuk menjamin informasi segar <i>anti-listing zombi</i>. Pemilik harus klik <strong>Update</strong> untuk lanjut mengiklan. Semua komunikasi minat diproses via <strong>Admin Verifikator</strong> terlebih dahulu sebelum kontak aman diteruskan, menjaga kerahasiaan Anda.
              </p>
            </div>
          </div>

          {/* Core Listing Container */}
          {boardTab === "supply" ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedFilteredSupply.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                  <AlertCircle size={28} className="mx-auto text-slate-400" />
                  <p className="text-slate-500 text-xs font-bold">Tidak ditemukan data supply info barang.</p>
                  <p className="text-slate-400 text-[10px]">Coba cari dengan kata kunci lain atau aktifkan centang "Lihat Kadaluarsa".</p>
                </div>
              ) : (
                sortedFilteredSupply.map((item) => {
                  const expiryStr = item.expiresAt || new Date(new Date(item.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
                  const expInfo = getExpirationStatus(expiryStr);
                  const isMyListing = item.brokerId === currentUser.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row gap-5 relative overflow-hidden ${
                        item.isPremium
                          ? "border-amber-400 bg-amber-500/[0.02] shadow-sm shadow-amber-300/10 hover:border-amber-500 hover:shadow-md ring-1 ring-amber-400/20"
                          : expInfo.status === "EXPIRED" 
                          ? "opacity-60 border-slate-300 bg-slate-50/50" 
                          : expInfo.status === "WARNING"
                          ? "border-amber-400/80 bg-amber-50/15 hover:border-amber-500"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Status corner tag */}
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        {item.isPremium && (
                          <span className="flex items-center gap-1 text-[9.5px] font-black uppercase py-0.5 px-2 rounded-full border bg-amber-500 text-slate-950 border-amber-600/30 animate-pulse tracking-wide">
                            <Crown size={9} className="fill-slate-950 stroke-none" />
                            <span>PREMIUM</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-full border ${
                          item.status === "VERIFIED" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-500/20" 
                            : item.status === "ON_PROGRESS"
                            ? "bg-amber-50 text-amber-700 border-amber-500/20"
                            : "bg-slate-100 text-slate-500 border-slate-300"
                        }`}>
                          {item.status === "VERIFIED" ? "🟢 Verified" : item.status === "ON_PROGRESS" ? "🟠 On Progress" : "🔴 Closed"}
                        </span>
                      </div>

                      {/* Image thumb */}
                      <div className="w-full md:w-36 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">{item.category}</span>
                        )}
                      </div>

                      {/* Listing Info */}
                      <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                              {item.category}
                            </span>
                            
                            {/* Expiry Badge */}
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${expInfo.color}`}>
                              <Clock size={10} />
                              <span>{expInfo.label}</span>
                            </span>

                            {isMyListing && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-300 font-bold uppercase px-1.5 py-0.5 rounded">
                                Iklan Anda
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>📍 {item.location}</span>
                            <span>•</span>
                            <span>Kode: {item.id}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                              item.isA1Verified || item.id === "sup-101" || item.id === "sup-103"
                                ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/20"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                              <ShieldCheck size={11} className={item.isA1Verified || item.id === "sup-101" || item.id === "sup-103" ? "text-emerald-600" : "text-slate-400"} />
                              <span>{item.isA1Verified || item.id === "sup-101" || item.id === "sup-103" ? "A1 / Pemilik Lahan Terverifikasi" : "Verifikasi Kepemilikan Lahan"}</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {item.specifications}
                        </p>

                        <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Harga Penawaran</span>
                            <span className="text-sm font-extrabold text-slate-900">{formatIDRCurrency(item.price)}</span>
                          </div>

                          {/* Secure Intermediated Admin Contact Action */}
                          <div className="flex items-center gap-2">
                            {/* Renewal Button (for owner or admin) */}
                            {(isMyListing || currentUser.role === UserRole.ADMIN) && (
                              <button
                                onClick={() => {
                                  onRenewListing(item.id, "supply");
                                  alert(`🔄 Iklan "${item.title}" diperpanjang sukses selama 14 hari kedepan!`);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <RefreshCw size={11} />
                                <span>Perpanjang (14H)</span>
                              </button>
                            )}

                            {/* Contact Intermediary */}
                            {!isMyListing ? (
                              <button
                                onClick={() => {
                                  if (productionViewMode === "real_guest") {
                                    alert("⚠️ WAJIB DAFTAR & KYC TERLEBIH DAHULU!\n\nUntuk memutus rantai penipuan informasi makelar bodong, Anda wajib mendaftar dan memverifikasi identitas Anda via KYC terlebih dahulu sebelum dapat mengajukan mediasi/menghubungi pengiklan.\n\nSilakan klik tab 'Registrasi & KYC' di bagian atas untuk mendaftar akun!");
                                    return;
                                  }
                                  setInterestedListing(item);
                                  setInterestedListingType("supply");
                                  setInterestMessage(`Halo Admin Rejeki Macan,\n\nSaya berminat dengan penawaran "${item.title}" (ID: ${item.id}) yang dipasarkan oleh ${item.brokerName}.\n\nSaya adalah makelar pembeli yang kredibel dan memegang jalur pembeli langsung (A1) bersertifikat. Mohon verifikasikan kami dan hubungkan ke pengiklan.\n\nSalam,\n${currentUser.fullName}`);
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                <MessageSquare size={12} className="stroke-[2.5]" />
                                <span>Ajukan Minat (Intermediasi Admin)</span>
                              </button>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic font-semibold px-2">
                                Iklan Anda Terpublikasi
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedFilteredDemand.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                  <AlertCircle size={28} className="mx-auto text-slate-400" />
                  <p className="text-slate-500 text-xs font-bold">Tidak ditemukan data demand pembeli.</p>
                  <p className="text-slate-400 text-[10px]">Coba cari dengan kata kunci lain atau aktifkan centang "Lihat Kadaluarsa".</p>
                </div>
              ) : (
                sortedFilteredDemand.map((item) => {
                  const expiryStr = item.expiresAt || new Date(new Date(item.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
                  const expInfo = getExpirationStatus(expiryStr);
                  const isMyListing = item.brokerId === currentUser.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden space-y-4 ${
                        item.isPremium
                          ? "border-amber-400 bg-amber-500/[0.02] shadow-sm shadow-amber-300/10 hover:border-amber-500 hover:shadow-md ring-1 ring-amber-400/20"
                          : expInfo.status === "EXPIRED" 
                          ? "opacity-60 border-slate-300 bg-slate-50/50" 
                          : expInfo.status === "WARNING"
                          ? "border-amber-400/85 bg-amber-50/15 hover:border-amber-500"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Status corner tag */}
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        {item.isPremium && (
                          <span className="flex items-center gap-1 text-[9.5px] font-black uppercase py-0.5 px-2 rounded-full border bg-amber-500 text-slate-950 border-amber-600/30 animate-pulse tracking-wide">
                            <Crown size={9} className="fill-slate-950 stroke-none" />
                            <span>PREMIUM</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-full border ${
                          item.status === "VERIFIED" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-500/20" 
                            : item.status === "ON_PROGRESS"
                            ? "bg-amber-50 text-amber-700 border-amber-500/20"
                            : "bg-slate-100 text-slate-500 border-slate-300"
                        }`}>
                          {item.status === "VERIFIED" ? "🟢 Verified" : item.status === "ON_PROGRESS" ? "🟠 On Progress" : "🔴 Closed"}
                        </span>
                      </div>

                      {/* Header */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                            {item.category}
                          </span>
                          
                          {/* Expiry Badge */}
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${expInfo.color}`}>
                            <Clock size={10} />
                            <span>{expInfo.label}</span>
                          </span>

                          {isMyListing && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-300 font-bold uppercase px-1.5 py-0.5 rounded animate-bounce">
                              Iklan Anda
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1 font-medium">
                          <span>💳 Skema Bayar: {item.paymentSystem}</span>
                          <span>•</span>
                          <span>Kode: {item.id}</span>
                        </div>
                      </div>

                      {/* Criteria Spec */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong>Kriteria Buyer:</strong> {item.criteria}
                      </p>

                      {/* Funding Criteria */}
                      <div className="text-[11px] bg-amber-500/5 text-amber-900 px-2.5 py-1.5 rounded-lg border border-amber-500/10 flex items-start gap-1.5">
                        <span className="font-extrabold uppercase text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shrink-0">DANA A1</span>
                        <p className="leading-normal">
                          <strong>Kriteria Pendanaan Konkret:</strong> {item.fundingCriteria || "Bukti Rekening Mandiri / SKBDN Term 100% Validated (A1)"}
                        </p>
                      </div>

                      {/* Footer Row */}
                      <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Rentang Anggaran Belanja</span>
                          <span className="text-sm font-extrabold text-slate-950">
                            {formatIDRCurrency(item.budgetMin)} s/d {formatIDRCurrency(item.budgetMax)}
                          </span>
                        </div>

                        {/* Secure Contact Action */}
                        <div className="flex items-center gap-2">
                          {/* Renewal Button */}
                          {(isMyListing || currentUser.role === UserRole.ADMIN) && (
                            <button
                              onClick={() => {
                                onRenewListing(item.id, "demand");
                                alert(`🔄 Kebutuhan Buyer "${item.title}" diperpanjang berkas sukses selama 14 hari!`);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <RefreshCw size={11} />
                              <span>Perpanjang (14H)</span>
                            </button>
                          )}

                          {!isMyListing ? (
                            <button
                              onClick={() => {
                                if (productionViewMode === "real_guest") {
                                  alert("⚠️ WAJIB DAFTAR & KYC TERLEBIH DAHULU!\n\nUntuk memutus rantai penipuan informasi makelar bodong, Anda wajib mendaftar dan memverifikasi identitas Anda via KYC terlebih dahulu sebelum dapat mengajukan mediasi/menghubungi pengiklan.\n\nSilakan klik tab 'Registrasi & KYC' di bagian atas untuk mendaftar akun!");
                                  return;
                                }
                                setInterestedListing(item);
                                setInterestedListingType("demand");
                                setInterestMessage(`Halo Admin Rejeki Macan,\n\nSaya tertarik menawarkan barang untuk memenuhi kriteria pencari/buyernya "${item.title}" (ID: ${item.id}) yang diinput oleh ${item.brokerName}.\n\nSaya memegang suplai barang tangan pertama (A1) orisinil dan valid untuk ditransaksikan. Mohon verifikasi data barang saya dan hubungkan ke pengelola buyer.\n\nSalam,\n${currentUser.fullName}`);
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <MessageSquare size={12} className="stroke-[2.5]" />
                              <span>Hubungi Admin (Sampaikan Suplai)</span>
                            </button>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic font-semibold px-2">
                              Permintaan Anda Aktif
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Sidebar Panel containing integration consoles */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active User Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
              Profil Anda
            </h5>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
              <p className="font-bold text-slate-800">{currentUser.fullName}</p>
              <p className="text-[11px] text-slate-500">Peran: {currentUser.role === UserRole.MAKELAR_BARANG ? "Makelar Barang (A1 Supplier)" : "Makelar Buyer"}</p>
              <hr className="my-2 border-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Status KYC</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  currentUser.kycStatus === KYCStatus.VERIFIED 
                    ? "bg-emerald-50 border-emerald-500/20 text-emerald-600" 
                    : "bg-red-50 border-red-500/20 text-red-500 animate-pulse"
                }`}>
                  {currentUser.kycStatus === KYCStatus.VERIFIED ? "Verified (Diberi Izin Penuh)" : "Belum KYC"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Secure admin Desk Workspace */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-500" />
                Intermediasi Admin
              </h5>
              {productionViewMode === "demo" && (
                <div className="flex bg-slate-150 p-0.5 rounded-lg border border-slate-200/80">
                  <button
                    onClick={() => setSidebarTab("lobby")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      sidebarTab === "lobby" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Lobby Saya
                  </button>
                  <button
                    onClick={() => setSidebarTab("admin")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      sidebarTab === "admin" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Admin Desk
                  </button>
                </div>
              )}
            </div>

            {sidebarTab === "lobby" ? (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">
                  Daftar minat terenkripsi. Kontak asli pengiklan & peminat disembunyikan. Admin harus memverifikasi data sebelum diteruskan agar aman dan rahasia!
                </p>

                {interests.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium">Belum ada pengajuan minat.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {interests.map((int) => {
                      const isOwner = int.ownerBrokerId === currentUser.id;
                      const isInterested = int.interestedBrokerId === currentUser.id;

                      // Only show interests relevant to current user
                      if (!isOwner && !isInterested) return null;

                      return (
                        <div key={int.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-[11px] space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-slate-400">ID: {int.id}</span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                              int.status === "PENDING_VERIFICATION"
                                ? "bg-amber-50 border-amber-300/30 text-amber-700"
                                : "bg-emerald-50 border-emerald-300/30 text-emerald-700 font-extrabold"
                            }`}>
                              {int.status === "PENDING_VERIFICATION" && "⏱️ Antre Admin"}
                              {int.status === "RELAYED_TO_OWNER" && "📬 Diteruskan"}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-slate-800 leading-tight line-clamp-1">{int.listingTitle}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {isOwner ? (
                                <span>Peminat: 👤 <strong>[Nama Dirahasiakan Admin]</strong></span>
                              ) : (
                                <span>Pemilik Iklan: 👤 <strong>[Ad Owner Dirahasiakan]</strong></span>
                              )}
                            </p>
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 italic whitespace-pre-line leading-relaxed">
                            "{int.userMessage}"
                          </div>

                          {int.adminNotes ? (
                            <div className="bg-slate-100 p-2.5 rounded-lg text-[10px] text-slate-600 border-l-2 border-amber-500 space-y-1 text-xs">
                              <p className="font-extrabold text-slate-800">🗣️ Catatan Verifikasi Admin:</p>
                              <p className="leading-normal">{int.adminNotes}</p>
                              {isOwner && (
                                <div className="mt-2 bg-emerald-50 text-emerald-800 p-1.5 rounded text-[9.5px] font-bold border border-emerald-250">
                                  📞 Kontak Peminat Terbuka Mandiri: {int.interestedBrokerName} ({int.interestedBrokerPhone})
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">
                              *Menunggu verifikasi admin untuk melindungi kerahasiaan nomor HP sebelum dikoordinasikan.
                            </div>
                          )}

                          {int.status === "PENDING_VERIFICATION" && isInterested && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[9.5px] text-amber-800">
                              📢 Admin sedang menghubungi Anda untuk memverifikasi keseriusan pihak pertama buyer/suplai.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : productionViewMode === "demo" ? (
              <div className="space-y-3 animate-fade-in font-sans">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 leading-relaxed md:max-w-[65%]">
                    Meja Verifikasi Admin (Simulasi). Klik loloskan untuk mentransfer kontak secara rahasia kepada pemilik iklan.
                  </p>
                  <label className="flex items-center gap-1 cursor-pointer select-none text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-500/10 hover:bg-amber-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={isAdminMode}
                      onChange={(e) => setIsAdminMode(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 accent-amber-500 scale-75"
                    />
                    <span>Admin Mode</span>
                  </label>
                </div>

                {!isAdminMode ? (
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-center space-y-2">
                    <Lock size={16} className="mx-auto text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-600">Akses Admin Disk Terkunci</p>
                    <p className="text-[10px] text-slate-400">Silakan centang "Admin Mode" di atas untuk bertindak sebagai Verifikator Admin.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interests.filter(i => i.status === "PENDING_VERIFICATION").length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-medium">
                        ✓ Semua antrean audit peminat rahasia beres!
                      </div>
                    ) : (
                      interests.filter(i => i.status === "PENDING_VERIFICATION").map(int => (
                        <div key={int.id} className="p-3 bg-slate-900 text-slate-100 rounded-xl shadow-md border border-slate-800 text-[11px] space-y-2.5">
                          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                            <span>🎫 Tiket ID: {int.id}</span>
                            <span className="font-bold text-amber-400 animate-pulse text-[10px]">⏱️ Perlu Verifikasi</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400">
                              Listing: <strong className="text-white text-xs block truncate">{int.listingTitle}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Pengaju Minat: <strong className="text-amber-400">{int.interestedBrokerName}</strong> ({int.interestedBrokerPhone})
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Pemilik Ad: <strong className="text-slate-300">{int.ownerBrokerName}</strong>
                            </p>
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300 italic text-[11px] leading-relaxed whitespace-pre-wrap">
                            "{int.userMessage}"
                          </div>

                          {verifyingInterestId === int.id ? (
                            <div className="space-y-2 pt-2 border-t border-slate-800 animate-fade-in">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase">Input Catatan Kelolosan Admin</label>
                              <textarea
                                value={adminVerificationNotes}
                                onChange={(e) => setAdminVerificationNotes(e.target.value)}
                                placeholder="Contoh: Pembeli valid, telah menunjukkan bukti cek dana Rp 35M di bank Danamon. Info diteruskan."
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 rounded p-1.5 text-[10px] text-slate-200 transition-colors"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setVerifyingInterestId(null)}
                                  className="px-2 py-1 bg-slate-800 text-slate-450 rounded hover:text-white transition-colors cursor-pointer text-[10px]"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateInterestStatus(
                                      int.id, 
                                      "RELAYED_TO_OWNER", 
                                      adminVerificationNotes || `Telah diverifikasi Admin. Profil peminat "${int.interestedBrokerName}" valid & aman untuk dikoordinasikan.`
                                    );
                                    setVerifyingInterestId(null);
                                    setAdminVerificationNotes("");
                                    alert(`🔔 Kontak diteruskan ke ${int.ownerBrokerName}! Admin telah menyambungkan jalur secara rahasia.`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors cursor-pointer text-[10px] font-bold"
                                >
                                  Lolos & Hubungi Pemilik
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setVerifyingInterestId(int.id);
                                setAdminVerificationNotes(`Laporan Mediasi: Admin Rejeki Macan telah memverifikasi makelar peminat "${int.interestedBrokerName}". Bukti ketersediaan sirkuit dana telah divalidasi. Berikut nomor HP pemegang minat: ${int.interestedBrokerPhone}. Silakan langsung hubungi secara aman.`);
                              }}
                              className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg transition-all text-[10px] cursor-pointer"
                            >
                              ✓ Hubungi Peminat & Verifikasi Manual
                            </button>
                          )}
                        </div>
                      ))
                    )}

                    {/* Verified list */}
                    {interests.filter(i => i.status === "RELAYED_TO_OWNER").length > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">✓ Arsip Mediasi Sukses:</p>
                        {interests.filter(i => i.status === "RELAYED_TO_OWNER").map(int => (
                          <div key={int.id} className="p-1.5 px-2 bg-slate-100 rounded text-[9.5px] text-slate-500 mb-1 leading-tight flex items-center justify-between border border-slate-200">
                            <span className="truncate max-w-[130px] font-medium text-slate-700">{int.listingTitle}</span>
                            <span className="text-emerald-600 font-extrabold text-[8.5px] bg-emerald-50 px-1 border border-emerald-200 rounded">SENT TO OWNER</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Integration Live Webhook Terminal */}
          {productionViewMode === "demo" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-slate-200 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-xs uppercase font-bold tracking-wider text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live n8n Webhook Console
                  </h5>
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">PORT: 3000 (Proxy)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Simulasi log paket keluar n8n setiap kali ada penambahan, perpanjangan iklan, atau perubahan status minat.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[9.5px] text-emerald-400 h-64 overflow-y-auto scrollbar-thin">
                {lastWebhookPayload ? (
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">// [OK] Webhook Event Dispatched:</span>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(lastWebhookPayload, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center text-[11px] px-4 space-y-2">
                    <Globe size={24} className="stroke-[1.5]" />
                    <p>Menunggu aktivitas... Coba klik "Ajukan Minat", perpanjang iklan, atau buat postingan baru untuk mentrigger otomatisasi.</p>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 text-center">
                *Webhook di-trigger menggunakan RESTful standard.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posting Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                  {currentUser.role === UserRole.MAKELAR_BARANG ? "PROSES INPUT SUPPLY" : "PROSES INPUT DEMAND"}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Posting {currentUser.role === UserRole.MAKELAR_BARANG ? "Info Penawaran Barang" : "Pencarian Buyer"} baru
                </h3>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XSquare size={20} />
              </button>
            </div>

            <form onSubmit={handlePostListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Postingan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={currentUser.role === UserRole.MAKELAR_BARANG ? "Contoh: Jual Tanah Strategis BSD Tangerang..." : "Contoh: Dicari Unit Excavator Komatsu PC200..."}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Bidang</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl p-2 text-xs transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {currentUser.role === UserRole.MAKELAR_BARANG ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Harga Penawaran (IDR Rupiah)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Contoh: 1200000000"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sistem Pembayaran</label>
                    <select
                      value={paymentSystem}
                      onChange={(e) => setPaymentSystem(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl p-2 text-xs transition-colors"
                    >
                      <option value="Cash Keras">Cash Keras</option>
                      <option value="SKBDN - lokal">SKBDN (Surat Kredit Berdokumen Dalam Negeri)</option>
                      <option value="LC Term 100%">LC Term 100% (Letter of Credit)</option>
                      <option value="Cash Bertahap">Cash Bertahap (Termin)</option>
                    </select>
                  </div>
                )}
              </div>

              {currentUser.role === UserRole.MAKELAR_BUYER && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Anggaran Min (Rupiah)</label>
                    <input
                      type="number"
                      required
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Anggaran Minimal"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Anggaran Max (Rupiah)</label>
                    <input
                      type="number"
                      required
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Anggaran Maksimal"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                    />
                  </div>
                </div>
              )}

              {currentUser.role === UserRole.MAKELAR_BARANG && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lokasi Fisik Barang / Lahan</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: BSD City, Tangerang Selatan"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {currentUser.role === UserRole.MAKELAR_BARANG ? "Spesifikasi Detail" : "Kriteria Buyer & Persyaratan Teknis"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={specOrCriteria}
                  onChange={(e) => setSpecOrCriteria(e.target.value)}
                  placeholder={
                    currentUser.role === UserRole.MAKELAR_BARANG 
                      ? "Masukan spesifikasi lengkap, nomor sertifikat, surat-surat kelengkapan, dll... (Dilarang mencantumkan nomor HP langsung!)"
                      : "Masukan kriteria lengkap, batas tahun perakitan alat berat ... (Dilarang cantumkan kode kontak langsung!)"
                  }
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs transition-colors"
                />
              </div>

              {currentUser.role === UserRole.MAKELAR_BARANG && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="a1-verified-check"
                      required
                      checked={isA1Verified}
                      onChange={(e) => setIsA1Verified(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
                    />
                    <label htmlFor="a1-verified-check" className="text-xs text-slate-800 font-bold select-none cursor-pointer">
                      Pernyataan Kepemilikan Langsung (A1 / Kuasa Lahan) <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-6 leading-relaxed">
                    Saya menyatakan secara hukum bahwa saya memegang hak milik langsung atas lahan/barang tersebut atau bertindak sebagai A1 (Kuasa Penuh Pemilik Lahan/Barang).
                  </p>
                </div>
              )}

              {currentUser.role === UserRole.MAKELAR_BUYER && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kriteria Pendanaan Konkret <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fundingCriteria}
                    onChange={(e) => setFundingCriteria(e.target.value)}
                    placeholder="Contoh: Surat Kredit Berdokumen (SKBDN), LOI Resmi Perusahaan, Cash Mandiri, Bukti Rekening Bank..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl px-3 py-2 text-xs transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Wajib mencantumkan kriteria pendanaan yang valid sesuai regulasi Rejeki Macan Core Engine.
                  </p>
                </div>
              )}

              {/* Live Bypass Security Scanner Visualized */}
              {bypassFlags.length > 0 ? (
                <div className="bg-red-50 border border-red-500/20 p-3.5 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-red-700 font-extrabold">
                    <ShieldAlert size={14} className="animate-bounce" />
                    <span>ALARM DETEKSI BYPASS AKTIF!</span>
                  </div>
                  <p className="text-[11px] text-red-600/95 leading-relaxed">
                    Sistem mendeteksi adanya indikasi penulisan kontak langsung atau sandi sandi angka tersembunyi.
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 font-mono bg-white/60 p-2 rounded-lg border border-red-200/40">
                    {bypassFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-800 italic leading-relaxed">
                    ⚠️ <strong>Efek Tindakan:</strong> Postingan Anda tetap diperbolehkan masuk database, tetapi statusnya akan otomatis kami set ke <strong>&quot;Tinjau Manual oleh Admin (On Progress)&quot;</strong> dan disembunyikan sementara dari beranda umum hingga disetujui Admin.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-500/10 p-2.5 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Scantekst Aman: Tidak ada pola penyerobotan kontak langsung terdeteksi.</span>
                </div>
              )}

              {/* paid Premium Ads Section */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="premium-ads-toggle"
                    checked={isPremiumSelected}
                    onChange={(e) => setIsPremiumSelected(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
                  />
                  <div className="text-[11px] select-none cursor-pointer flex-1" onClick={() => setIsPremiumSelected(!isPremiumSelected)}>
                    <label htmlFor="premium-ads-toggle" className="font-extrabold text-amber-800 flex items-center gap-1 cursor-pointer">
                      <Crown size={12} className="fill-amber-600 stroke-none" />
                      <span>AKTIFKAN PROMOSI IKLAN PREMIUM (Rp 5.000 / Hari)</span>
                    </label>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed mt-0.5">
                      Iklan Anda akan ditempatkan di barisan teratas pencarian agar dilihat terlebih dahulu oleh investor/buyer potensial. Jangka panjang bisa disesuaikan sesuai isi saldo deposit Anda.
                    </p>
                  </div>
                </div>

                {isPremiumSelected && (
                  <div className="pl-6.5 pt-1 space-y-2 border-t border-amber-200/50 mt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="text-[10px] font-bold text-slate-600">Pilih Durasi Premium:</span>
                      <div className="flex gap-1.5">
                        {[3, 7, 14, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setPremiumDays(days)}
                            className={`py-1 px-2 border rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              premiumDays === days
                                ? "bg-amber-500 border-amber-600 text-slate-950"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-755"
                            }`}
                          >
                            {days} Hari
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white px-2.5 py-2 rounded-lg border border-amber-250 text-[10.5px]">
                      <div>
                        <span className="text-slate-500 font-bold block text-[9.5px] uppercase">Rincian Estimasi Biaya</span>
                        <span className="font-extrabold text-slate-800">Rp 5.000 x {premiumDays} Hari = </span>
                        <strong className="text-amber-700 font-black">Rp {(premiumDays * 5000).toLocaleString("id-ID")}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Saldo Dompet Anda</span>
                        <span className={`font-extrabold ${currentUser.balance && currentUser.balance >= premiumDays * 5000 ? "text-emerald-600" : "text-rose-600"}`}>
                          Rp {(currentUser.balance || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {(currentUser.balance || 0) < premiumDays * 5000 && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[9.5px] text-red-700 font-medium">
                        ⚠️ Saldo tidak mencukupi. Silakan kurangi hari promosi atau lakukan{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setShowPostModal(false);
                            setShowTopUpModal(true);
                          }}
                          className="font-black text-red-800 underline hover:text-red-900 cursor-pointer"
                        >
                          Top Up Saldo Terlebih Dahulu
                        </button>
                        .
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Platform Legal Safeguard Disclaimer Checkbox */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="legal-disclaimer-check"
                    required
                    checked={disclaimerChecked}
                    onChange={(e) => setDisclaimerChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="legal-disclaimer-check" className="text-[11px] text-slate-800 font-medium leading-relaxed select-none cursor-pointer">
                    <strong className="text-amber-700 block text-[11.5px] font-black uppercase mb-0.5">DISCLAIMER PERLINDUNGAN KOMISI (WAJIB SETUJU)</strong>
                    Saya menyetujui jika bertransaksi langsung secara ilegal tanpa sepengetahuan pengelola, Admin Rejeki Macan <strong>dibebaskan dari segala tanggung jawab sengketa</strong> (disalip/ditikung) dan berhak <strong>memblokir keanggotaan broker saya</strong> secara sepihak.
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer animate-fade-in"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Post & Kirim Webhook n8n
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appoint Interest / Intermediation Submission Modal */}
      {interestedListing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-amber-500" size={20} />
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Ajukan Minat Lewat Intermediasi Admin
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Layanan Jaminan Perlindungan Privasi Rejeki Macan</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setInterestedListing(null);
                  setInterestedListingType(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XSquare size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-950">📦 Listing Sasaran:</p>
              <div className="pl-3 border-l-2 border-slate-300">
                <p className="font-extrabold text-slate-900">{interestedListing.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pemilik Posting: 👤 {interestedListing.brokerName} (Identitas Rahasia)</p>
              </div>
              <p className="text-[10.5px] text-slate-500 leading-normal pt-2">
                Kontak Anda dan pengiklan tidak akan langsung dibuka ke publik. Formulir ini mendaftarkan tiket audit di <strong>Admin Workspace</strong>. Admin kami akan memeriksa kesiapan Anda terlebih dahulu dan meneruskan koordinasi secara rahasia.
              </p>
            </div>

            <form onSubmit={handleRequestInterest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pesan Detail Minat & Penawaran Konkrit</label>
                <textarea
                  required
                  rows={4}
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  placeholder="Misalnya: 'Saya memegang buyer langsung untuk tanah kavling ini. Cek dana Rp 35M siap diajukan dalam bentuk SKBDN. Mohon Admin hubungkan.'"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs transition-colors leading-relaxed text-slate-800"
                />
                <p className="text-[10px] text-slate-400 italic mt-1.5">
                  *Tuliskan pesan penawaran selengkap mungkin. Ini meningkatkan skor kepercayaan verifikasi admin.
                </p>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInterestedListing(null);
                    setInterestedListingType(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Kirim ke Admin (Antrean Verifikasi)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Interest Submission Notice */}
      {successInterestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-950">Tiket Minat Terkirim ke Admin!</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Pengajuan transaksional Anda telah dialihkan ke antrean <strong>Lobby Admin Workspace</strong> secara aman. Anda dapat melacak tingkat kelolosan verifikasi langsung pada tab <strong>"Lobby Saya"</strong> di sebelah kanan dashboard.
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-500/10 text-xs font-medium text-left leading-relaxed">
              💡 <strong>Simulasi Demo Interaktif:</strong> Anda dapat beralih ke tab <strong>"Admin Desk"</strong> di panel kanan dan menyalakan <strong>"Admin Mode"</strong> untuk mensimulasikan persetujuan tiket minat Anda langsung dari layar ini!
            </div>
            <button
              onClick={() => setSuccessInterestModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
            >
              OK, Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Simulation Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="top-up-modal">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="text-amber-500 animate-pulse" size={20} />
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Isi Saldo Dompet</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Top Up Saldo Simulasi Iklan Premium</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XSquare size={20} />
              </button>
            </div>

            <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-550/15 space-y-0.5">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-700 block">Sisa Saldo Saat Ini</span>
              <p className="text-lg font-black text-slate-900">Rp {(currentUser.balance || 0).toLocaleString("id-ID")}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-700">Pilih Nominal Cepat (IDR)</label>
              <div className="grid grid-cols-3 gap-2">
                {[15000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 px-1 border rounded-xl text-[11px] font-black tracking-tight transition-all cursor-pointer text-center ${
                      topUpAmount === amt 
                        ? "bg-amber-550 border-amber-600 text-slate-950 bg-amber-500 shadow-xs" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                    }`}
                  >
                    Rp {amt >= 1000 ? `${amt / 1000}rb` : amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nominal Kustom (Rp)</label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-none rounded-xl p-2.5 text-xs font-bold text-slate-900 transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  *Min. Rp 5.000. Cukup untuk iklan premium selama yang didepositkan.
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (topUpAmount < 5000) {
                    alert("⚠️ Minimal nominal top up adalah Rp 5.000");
                    return;
                  }
                  onUserChange({
                    ...currentUser,
                    balance: (currentUser.balance || 0) + topUpAmount
                  });
                  alert(`✅ Sukses! Saldo simulasi Anda berhasil ditambahkan sebesar Rp ${topUpAmount.toLocaleString("id-ID")}`);
                  setShowTopUpModal(false);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Konfirmasi Top Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
