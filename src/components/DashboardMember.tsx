import React, { useState } from "react";
import { 
  Building2, PlusCircle, User, ShieldCheck, CheckCircle2, Send, 
  Trash2, RefreshCw, Layers, MapPin, Tag, AlertCircle, Sparkles,
  Upload, X, Link as LinkIcon, Image as ImageIcon, Wallet, Clock,
  Calendar, Coins, XCircle, Plus, Info, AlertTriangle, ShieldAlert
} from "lucide-react";
import { UserSession } from "../types";
import { apiTopUpDeposit, apiExtendProject } from "../services/api";

interface DashboardMemberProps {
  currentUser: UserSession;
  supplyListings: any[];
  demandListings: any[];
  interests: any[];
  onCreateProject: (projectData: any) => Promise<boolean>;
  onDeleteProject: (projectId: string) => Promise<boolean>;
  onRefreshData: () => void;
  onUpdateUserSession?: (user: UserSession) => void;
}

export default function DashboardMember({
  currentUser,
  supplyListings,
  demandListings,
  interests,
  onCreateProject,
  onDeleteProject,
  onRefreshData,
  onUpdateUserSession
}: DashboardMemberProps) {
  const [activeSubTab, setActiveSubTab] = useState<"CREATE" | "MY_PROJECTS" | "INTERESTS" | "PROFILE">("MY_PROJECTS");

  // Form State Post Proyek Baru
  const [projectType, setProjectType] = useState<"supply" | "demand">("supply");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Properti & Tanah");
  const [location, setLocation] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [price, setPrice] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("Cash Bertahap");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Deposit Top Up Modal
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);

  // State Perpanjang Posting Modal
  const [extendingProject, setExtendingProject] = useState<any | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(10);
  const [isExtendingLoading, setIsExtendingLoading] = useState<boolean>(false);

  const categories = [
    "Properti & Tanah",
    "Komoditas & Hasil Bumi",
    "Besi & Logam Scrap",
    "Alat Berat & Otomotif",
    "Lainnya"
  ];

  // My listings filtered
  const mySupply = supplyListings.filter((s) => s.brokerId === currentUser.id);
  const myDemand = demandListings.filter((d) => d.brokerId === currentUser.id);
  const myInterests = interests.filter((i) => i.interestedBrokerId === currentUser.id || i.ownerBrokerId === currentUser.id);

  // Helper sisa hari
  const getRemainingDays = (expiresAtStr: string) => {
    if (!expiresAtStr) return 0;
    const expiry = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setImageUrl(resizedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !specifications.trim()) {
      alert("Harap lengkapi judul dan deskripsi spesifikasi proyek.");
      return;
    }

    setIsSubmitting(true);
    const success = await onCreateProject({
      projectType,
      title,
      category,
      location: location || "Indonesia",
      specifications,
      price: price ? Number(price) : 0,
      budgetMin: budgetMin ? Number(budgetMin) : 0,
      budgetMax: budgetMax ? Number(budgetMax) : 0,
      paymentSystem,
      brokerId: currentUser.id,
      imageUrl
    });

    setIsSubmitting(false);

    if (success) {
      alert("🎉 Proyek Anda berhasil diajukan! Menunggu verifikasi/persetujuan Admin sebelum tampil di katalog publik.");
      setTitle("");
      setSpecifications("");
      setPrice("");
      setBudgetMin("");
      setBudgetMax("");
      setImageUrl("");
      setActiveSubTab("MY_PROJECTS");
      onRefreshData();
    } else {
      alert("Gagal memposting proyek. Silakan coba lagi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus proyek ini dari database?")) return;
    const ok = await onDeleteProject(id);
    if (ok) {
      alert("Proyek berhasil dihapus.");
      onRefreshData();
    }
  };

  // Top Up Deposit Submit
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) {
      alert("Jumlah deposit harus lebih dari 0.");
      return;
    }
    setIsTopUpLoading(true);
    const res = await apiTopUpDeposit(currentUser.id, topUpAmount);
    setIsTopUpLoading(false);
    if (res.success && res.user) {
      alert(res.message);
      if (onUpdateUserSession) onUpdateUserSession(res.user);
      setShowTopUpModal(false);
      onRefreshData();
    } else {
      alert(res.message || "Gagal melakukan top up deposit.");
    }
  };

  // Extend Project Submit
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingProject) return;
    const cost = extensionDays * 500;
    if ((currentUser.balance || 0) < cost) {
      alert(`Saldo deposit Anda (Rp ${(currentUser.balance || 0).toLocaleString("id-ID")}) kurang dari biaya perpanjangan Rp ${cost.toLocaleString("id-ID")}. Silakan isi saldo deposit terlebih dahulu.`);
      setShowTopUpModal(true);
      return;
    }

    setIsExtendingLoading(true);
    const res = await apiExtendProject(extendingProject.id, currentUser.id, extensionDays);
    setIsExtendingLoading(false);

    if (res.success) {
      alert(res.message);
      if (res.user && onUpdateUserSession) {
        onUpdateUserSession(res.user);
      }
      setExtendingProject(null);
      onRefreshData();
    } else {
      alert(res.message || "Gagal memperpanjang proyek.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Welcome Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shrink-0">
            {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : "M"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{currentUser.fullName}</h2>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                currentUser.kycStatus === "VERIFIED"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {currentUser.kycStatus === "VERIFIED" ? "✓ Verified Member" : "KYC Pending"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Peran: <strong className="text-amber-400">{currentUser.role === "MAKELAR_BARANG" ? "Broker Penjual" : "Broker Buyer"}</strong> • {currentUser.email} • {currentUser.phoneNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab("CREATE")}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          <span>+ Pasang Proyek Baru</span>
        </button>
      </div>

      {/* SALDO DEPOSIT & ATURAN POSTING IKLAN CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 p-5 rounded-2xl border border-amber-500/30 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md shrink-0 mt-0.5">
            <Wallet size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Saldo Deposit Iklan Anda</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-800 text-[10px] font-bold rounded-full">Fitur Perpanjangan</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              Rp {(currentUser.balance || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-600 max-w-xl">
              Postingan proyek berlaku <strong>Gratis 10 Hari</strong> setelah disetujui Admin. Setelah 10 hari, biaya perpanjangan iklan hanya <strong>Rp 500 / hari</strong> menggunakan saldo deposit ini.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Coins size={15} />
            <span>+ Top Up Saldo Deposit</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab("MY_PROJECTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "MY_PROJECTS" ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={14} />
          <span>Proyek Saya ({mySupply.length + myDemand.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("CREATE")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "CREATE" ? "bg-amber-500 text-slate-950 shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PlusCircle size={14} />
          <span>+ Pasang Proyek Baru</span>
        </button>

        <button
          onClick={() => setActiveSubTab("INTERESTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "INTERESTS" ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Send size={14} />
          <span>Pengajuan Minat Saya ({myInterests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("PROFILE")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "PROFILE" ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User size={14} />
          <span>Profil & Verifikasi NIK</span>
        </button>
      </div>

      {/* TAB CONTENT: MY PROJECTS */}
      {activeSubTab === "MY_PROJECTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Daftar Proyek Yang Anda Posting</h3>
              <p className="text-xs text-slate-500">
                Lacak status persetujuan admin, sisa hari aktif (limit 10 hari gratis), dan perpanjang iklan Rp 500/hari.
              </p>
            </div>
            <button
              onClick={onRefreshData}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {mySupply.length === 0 && myDemand.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Building2 size={40} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Anda belum pernah memposting proyek.</p>
              <button
                onClick={() => setActiveSubTab("CREATE")}
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-xs cursor-pointer"
              >
                + Pasang Proyek Pertama Anda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supply Items */}
              {mySupply.map((item) => {
                const remDays = getRemainingDays(item.expiresAt);
                const modStatus = item.moderationStatus || "APPROVED";
                return (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9.5px] rounded uppercase">
                          📦 Penawaran Barang
                        </span>

                        {/* Moderation Status Badge */}
                        {modStatus === "APPROVED" && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Disetujui (Tayang Publik)
                          </span>
                        )}
                        {modStatus === "PENDING" && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <Clock size={12} className="text-amber-600 animate-pulse" /> Menunggu Persetujuan Admin
                          </span>
                        )}
                        {modStatus === "REJECTED" && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <XCircle size={12} className="text-red-600" /> Ditolak Admin
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-600 line-clamp-2">{item.specifications}</p>
                      
                      <div className="flex items-center justify-between font-mono font-bold text-slate-800 pt-1">
                        <span>Rp {item.price ? item.price.toLocaleString("id-ID") : "Penawaran"}</span>
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <Clock size={11} /> Sisa {remDays} Hari Tayang
                        </span>
                      </div>

                      {modStatus === "REJECTED" && item.rejectionReason && (
                        <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200">
                          <strong>Alasan Penolakan:</strong> {item.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setExtendingProject(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Calendar size={13} />
                        <span>Perpanjang Tayang (Rp 500/hari)</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Demand Items */}
              {myDemand.map((item) => {
                const remDays = getRemainingDays(item.expiresAt);
                const modStatus = item.moderationStatus || "APPROVED";
                return (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-3 text-xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[9.5px] rounded uppercase">
                          💼 Pencarian Buyer
                        </span>

                        {/* Moderation Status Badge */}
                        {modStatus === "APPROVED" && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Disetujui (Tayang Publik)
                          </span>
                        )}
                        {modStatus === "PENDING" && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <Clock size={12} className="text-amber-600 animate-pulse" /> Menunggu Persetujuan Admin
                          </span>
                        )}
                        {modStatus === "REJECTED" && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                            <XCircle size={12} className="text-red-600" /> Ditolak Admin
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-600 line-clamp-2">{item.criteria}</p>

                      <div className="flex items-center justify-between font-mono font-bold text-emerald-800 pt-1">
                        <span>Max: Rp {item.budgetMax ? item.budgetMax.toLocaleString("id-ID") : "Budget"}</span>
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Clock size={11} /> Sisa {remDays} Hari Tayang
                        </span>
                      </div>

                      {modStatus === "REJECTED" && item.rejectionReason && (
                        <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200">
                          <strong>Alasan Penolakan:</strong> {item.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setExtendingProject(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Calendar size={13} />
                        <span>Perpanjang Tayang (Rp 500/hari)</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CREATE PROJECT */}
      {activeSubTab === "CREATE" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-black text-slate-900">Pasang & Publikasikan Proyek Baru</h3>
            <p className="text-xs text-slate-500">
              Isi formulir di bawah ini. Proyek Anda akan diverifikasi oleh Admin sebelum dipublikasikan di katalog publik (Gratis 10 Hari Pertama).
            </p>
          </div>

          <form onSubmit={handlePostProject} className="space-y-4 max-w-2xl text-xs">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Jenis Proyek: <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProjectType("supply")}
                  className={`p-3.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    projectType === "supply"
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs">📦 Penawaran Barang / Aset (Supply)</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-0.5">Memiliki stok barang, lahan, atau komoditas valid.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectType("demand")}
                  className={`p-3.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    projectType === "demand"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 font-black shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs">💼 Pencarian Buyer Siap (Demand)</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-0.5">Memiliki kriteria pembeli A1 yang mencari komoditas/aset.</p>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Judul Proyek / Komoditas: <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Contoh: Stok CPO Off-Spec 500 Ton Medan atau Lahan Industri Cikarang 5 Ha"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Kategori Proyek: <span className="text-red-500">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Lokasi Proyek / Gudang:</label>
                <input
                  type="text"
                  placeholder="Contoh: Surabaya, Jawa Timur"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Price / Budget */}
            {projectType === "supply" ? (
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Harga Penawaran Total / Per Ton (Rp):</label>
                <input
                  type="number"
                  placeholder="Contoh: 15000000000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Budget Min (Rp):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 1000000000"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Budget Max (Rp):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 5000000000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Specifications / Criteria */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                {projectType === "supply" ? "Spesifikasi & Rincian Barang/Aset:" : "Kriteria Pembelian Buyer:"} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan spesifikasi lengkap (kadar, sertifikat, kondisi, legalitas SHM/SHGB)..."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
              ></textarea>
            </div>

            {/* Payment System */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Sistem Pembayaran Diharapkan:</label>
              <select
                value={paymentSystem}
                onChange={(e) => setPaymentSystem(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                <option value="Cash Bertahap">Cash Bertahap / SKBDN</option>
                <option value="CBD (Cash Before Delivery)">CBD (Cash Before Delivery)</option>
                <option value="COD (Cash On Delivery)">COD (Cash On Delivery)</option>
                <option value="LC / Letter of Credit">LC / Letter of Credit</option>
                <option value="Transfer Bank Pelunasan Notaris">Transfer Bank Pelunasan Notaris</option>
              </select>
            </div>

            {/* Image upload / URL */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Foto / Gambar Proyek (Opsional):</label>

              {imageUrl ? (
                <div className="relative inline-block border-2 border-amber-500/40 rounded-2xl overflow-hidden bg-slate-900 group max-w-xs shadow-md">
                  <img
                    src={imageUrl}
                    alt="Preview Proyek"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-lg transition-all cursor-pointer"
                    title="Hapus Foto"
                  >
                    <X size={14} />
                  </button>
                  <div className="p-2 bg-slate-900/90 text-[10px] text-amber-400 font-medium truncate flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>Foto Siap Dipublikasikan</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload dari Perangkat */}
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl bg-slate-50 hover:bg-amber-500/5 transition-all cursor-pointer text-center group">
                    <Upload size={22} className="text-slate-400 group-hover:text-amber-500 mb-1 transition-colors" />
                    <span className="font-bold text-slate-700 group-hover:text-amber-600 text-xs">
                      Upload dari Perangkat
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Pilih file foto dari galeri/komputer (JPG, PNG)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Input URL Foto */}
                  <div className="flex flex-col justify-center p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1.5">
                    <span className="font-bold text-slate-600 text-[11px] flex items-center gap-1">
                      <LinkIcon size={12} className="text-slate-400" /> Atau Tempel Link URL Foto:
                    </span>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              <span>{isSubmitting ? "Mempublikasikan..." : "Ajukan Proyek ke Admin Server"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: MY INTERESTS */}
      {activeSubTab === "INTERESTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Riwayat Pengajuan Minat</h3>
            <p className="text-xs text-slate-500">Daftar minat yang Anda kirimkan ke proyek lain atau yang diterima proyek Anda.</p>
          </div>

          <div className="space-y-3 text-xs">
            {myInterests.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Send size={32} className="mx-auto text-slate-300" />
                <p className="text-slate-500 font-bold">Belum ada riwayat pengajuan minat.</p>
                <p className="text-slate-400 text-[11px]">Anda dapat mengajukan minat pada proyek yang tayang di katalog publik.</p>
              </div>
            ) : (
              myInterests.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{item.listingTitle || "Pengajuan Minat Proyek"}</h4>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px]">
                      {item.status || "TERKIRIM"}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                    "{item.userMessage || item.message}"
                  </p>
                  <p className="text-[10px] text-slate-400 text-right">
                    Dikirim: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "Baru saja"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeSubTab === "PROFILE" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-xl text-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900">Profil & Status Verifikasi NIK Member</h3>
            <p className="text-slate-500 text-[11px]">Informasi identitas akun Anda di database server REJEKI MACAN.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Nama Lengkap:</span>
              <strong className="text-slate-900 font-bold text-sm">{currentUser.fullName}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Email Terdaftar:</span>
              <strong className="text-slate-900 font-mono">{currentUser.email}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Nomor Handphone / WA:</span>
              <strong className="text-slate-900 font-mono">{currentUser.phoneNumber}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Nomor NIK / KTP:</span>
              <strong className="text-slate-900 font-mono">{currentUser.ktpNumber || "3171012345670001"}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Peran Makelar:</span>
              <strong className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                {currentUser.role === "MAKELAR_BARANG" ? "Broker Penjual (Supplier)" : "Broker Buyer"}
              </strong>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Status Verifikasi KYC:</span>
              <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase ${
                currentUser.kycStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}>
                {currentUser.kycStatus === "VERIFIED" ? "✓ Verified Member" : "KYC Pending"}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-900 text-[11px] leading-relaxed">
              Verifikasi NIK & KYC memberikan lencana <strong>✓ Verified Member</strong> pada setiap proyek dan pengajuan minat Anda, meningkatkan kepercayaan calon mediator & buyer A1 di platform REJEKI MACAN.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: TOP UP DEPOSIT SALDO */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
                  <Coins size={20} />
                </div>
                <h3 className="font-black text-slate-900 text-base">Top Up Saldo Deposit Iklan</h3>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <p className="font-bold text-amber-900">Aturan Biaya Perpanjangan Iklan:</p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Postingan yang disetujui tayang <strong>Gratis 10 Hari Pertama</strong>. Setelah lewat 10 hari, biaya perpanjangan iklan hanya <strong>Rp 500 / hari</strong> yang dipotong dari saldo deposit ini.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Pilih Nominal Top Up Cepat:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`p-2.5 rounded-xl border font-bold text-xs font-mono transition-all cursor-pointer ${
                        topUpAmount === amt
                          ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Rp {amt.toLocaleString("id-ID")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Atau Input Nominal Lain (Rp):</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isTopUpLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isTopUpLoading ? <RefreshCw size={14} className="animate-spin" /> : <Coins size={14} />}
                  <span>Konfirmasi Top Up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERPANJANG MASA TAYANG PROYEK */}
      {extendingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
                  <Calendar size={20} />
                </div>
                <h3 className="font-black text-slate-900 text-base">Perpanjang Masa Tayang Proyek</h3>
              </div>
              <button
                onClick={() => setExtendingProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Proyek Yang Dibarui:</span>
                <p className="font-bold text-slate-900 text-xs line-clamp-2">{extendingProject.title}</p>
                <p className="text-[11px] text-slate-600 font-mono pt-1">
                  Sisa Tayang Saat Ini: {getRemainingDays(extendingProject.expiresAt)} Hari
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Pilih Jumlah Hari Perpanjangan:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { days: 5, label: "5 Hari (Rp 2.500)" },
                    { days: 10, label: "10 Hari (Rp 5.000)" },
                    { days: 30, label: "30 Hari (Rp 15.000)" },
                    { days: 60, label: "60 Hari (Rp 30.000)" }
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setExtensionDays(opt.days)}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        extensionDays === opt.days
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Atau Input Jumlah Hari Lain (Rp 500 / Hari):</label>
                <input
                  type="number"
                  min="1"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Biaya (Rp 500 x {extensionDays} Hari):</span>
                  <span className="font-bold">Rp {(extensionDays * 500).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-900 font-bold border-t border-amber-200/60 pt-1 text-xs">
                  <span>Saldo Deposit Anda:</span>
                  <span className={(currentUser.balance || 0) < extensionDays * 500 ? "text-red-600 font-black" : "text-emerald-700 font-black"}>
                    Rp {(currentUser.balance || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {(currentUser.balance || 0) < extensionDays * 500 && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-[11px] font-bold flex items-center justify-between">
                  <span>⚠️ Saldo deposit tidak cukup.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExtendingProject(null);
                      setShowTopUpModal(true);
                    }}
                    className="underline text-red-800 hover:text-red-950 cursor-pointer"
                  >
                    Top Up Saldo Now
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExtendingProject(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isExtendingLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isExtendingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Calendar size={14} />}
                  <span>Proses Perpanjangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
