import React, { useState } from "react";
import { 
  Building2, Search, Filter, ShieldCheck, CheckCircle2, Flame, MapPin, 
  Tag, Clock, Eye, ArrowRight, Sparkles, Send, Phone, Lock, ExternalLink, RefreshCw, Layers, User
} from "lucide-react";
import { SupplyListing, DemandListing, UserSession } from "../types";

interface HalamanDepanProps {
  supplyListings: SupplyListing[];
  demandListings: DemandListing[];
  currentUser: UserSession | null;
  onNavigateAuth: () => void;
  onNavigateMemberDashboard: () => void;
  onSubmitInterest: (projectId: string, data: any) => Promise<any>;
  onRefreshData: () => void;
  isLoading: boolean;
  systemStats: any;
}

export default function HalamanDepan({
  supplyListings,
  demandListings,
  currentUser,
  onNavigateAuth,
  onNavigateMemberDashboard,
  onSubmitInterest,
  onRefreshData,
  isLoading,
  systemStats
}: HalamanDepanProps) {
  const [activeTypeTab, setActiveTypeTab] = useState<"ALL" | "SUPPLY" | "DEMAND">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Detail Proyek
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Modal Ajukan Minat
  const [interestProject, setInterestProject] = useState<any | null>(null);
  const [interestMessage, setInterestMessage] = useState<string>("");
  const [isSubmittingInterest, setIsSubmittingInterest] = useState<boolean>(false);

  const categories = [
    "ALL",
    "Properti & Tanah",
    "Komoditas & Hasil Bumi",
    "Besi & Logam Scrap",
    "Alat Berat & Otomotif",
    "Lainnya"
  ];

  // Filter projects
  const filterList = (items: any[], type: "supply" | "demand") => {
    return items.filter((item) => {
      // Must be approved by moderation (or status VERIFIED if moderationStatus not set)
      if (item.moderationStatus && item.moderationStatus !== "APPROVED") {
        return false;
      }
      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchSpec = (item.specifications || item.criteria || "")?.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchSpec) return false;
      }
      return true;
    });
  };

  const filteredSupply = filterList(supplyListings, "supply");
  const filteredDemand = filterList(demandListings, "demand");

  const totalProjectsCount = (activeTypeTab === "DEMAND" ? 0 : filteredSupply.length) + (activeTypeTab === "SUPPLY" ? 0 : filteredDemand.length);

  const handleOpenInterestModal = (project: any, type: "supply" | "demand") => {
    if (!currentUser) {
      alert("Silakan Login atau Daftar Member Baru terlebih dahulu untuk mengajukan minat ke proyek ini.");
      onNavigateAuth();
      return;
    }
    setInterestProject({ ...project, type });
    setInterestMessage("");
  };

  const handleSendInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestProject) return;

    setIsSubmittingInterest(true);
    const res = await onSubmitInterest(interestProject.id, {
      listingType: interestProject.type,
      listingTitle: interestProject.title,
      ownerBrokerId: interestProject.brokerId,
      ownerBrokerName: interestProject.brokerName,
      interestedBrokerId: currentUser?.id,
      interestedBrokerName: currentUser?.fullName,
      interestedBrokerPhone: currentUser?.phoneNumber,
      userMessage: interestMessage
    });

    setIsSubmittingInterest(false);
    if (res?.success) {
      alert(`🎉 ${res.message || "Pengajuan minat Anda berhasil dicatat!\n\nAdmin platform akan memverifikasi kesiapan kualifikasi di Ruang Chat Mediasi."}`);
      setInterestProject(null);
    } else if (res?.message) {
      alert(res.message);
      if (res.message.includes("KYC") || res.message.includes("Saldo")) {
        onNavigateMemberDashboard();
      }
    } else {
      alert("Terjadi kesalahan saat mengajukan minat. Silakan coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER DEPAN */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-amber-500/20">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-400" />
            <span>Platform Mediator & Broker Terpercaya Indonesia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Hubungkan <span className="text-amber-400">Suplai Barang Valid</span> & <span className="text-emerald-400">Buyer Siap Dana</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Rejeki Macan adalah jaringan broker dan mediator profesional dengan sistem database terpusat real-time. Memotong mata rantai berita bohong dan memverifikasi kualifikasi A1 transaksi proyek Anda.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {!currentUser ? (
              <>
                <button
                  onClick={onNavigateAuth}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Daftar / Login Member</span>
                </button>
                <a
                  href="#katalog-proyek"
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Building2 size={14} />
                  <span>Jelajahi Listing Proyek</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="#katalog-proyek"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 size={14} />
                  <span>Jelajahi Listing Proyek</span>
                </a>
                <button
                  onClick={onNavigateMemberDashboard}
                  className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <User size={14} />
                  <span>Ke Dashboard Member</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. KATALOG LIST PROYEK REAL TIME */}
      <div id="katalog-proyek" className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="text-amber-600" size={22} />
              <span>Daftar Proyek & Komoditas Aktif</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih proyek di bawah ini untuk melihat detail atau mengajukan minat kerjasama antar broker.
            </p>
          </div>

          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className="self-start md:self-auto px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>{isLoading ? "Memuat..." : "Refresh Database"}</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
          {/* Tabs Tipe Proyek */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTypeTab("ALL")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTypeTab === "ALL" ? "bg-slate-900 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Proyek ({supplyListings.length + demandListings.length})
              </button>
              <button
                onClick={() => setActiveTypeTab("SUPPLY")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTypeTab === "SUPPLY" ? "bg-amber-500 text-slate-950 shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📦 Penawaran Barang ({supplyListings.length})
              </button>
              <button
                onClick={() => setActiveTypeTab("DEMAND")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTypeTab === "DEMAND" ? "bg-emerald-600 text-white shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                💼 Pencarian Buyer ({demandListings.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] sm:min-w-[320px]">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari judul, lokasi, atau spesifikasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        {totalProjectsCount === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Building2 size={48} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada proyek yang sesuai filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat daftar proyek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SUPPLY LISTINGS */}
            {(activeTypeTab === "ALL" || activeTypeTab === "SUPPLY") &&
              filteredSupply.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Image / Header */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                    {/* Badges top */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-sm">
                        📦 Penawaran Barang
                      </span>
                      {item.isA1Verified && (
                        <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={12} /> A1 Valid
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs text-amber-300 font-medium">{item.category}</p>
                      <p className="text-lg font-black text-white font-mono mt-0.5">
                        {item.price > 0 ? `Rp ${item.price.toLocaleString("id-ID")}` : "Sesuai Penawaran"}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.specifications}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={12} className="text-slate-400" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} className="text-slate-400" />
                          {item.viewsCount}x Dilihat
                        </span>
                      </div>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Broker: <strong className="text-slate-700">{item.brokerName}</strong></span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Kontak Terproteksi
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedProject({ ...item, type: "supply" })}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                        >
                          Detail Proyek
                        </button>
                        <button
                          onClick={() => handleOpenInterestModal(item, "supply")}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Send size={12} />
                          <span>Ajukan Minat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* DEMAND LISTINGS */}
            {(activeTypeTab === "ALL" || activeTypeTab === "DEMAND") &&
              filteredDemand.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Header Header */}
                  <div className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-lg shadow-sm">
                        💼 Pencarian Buyer Siap
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 rounded">
                        ID: {item.id}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-300 font-medium">{item.category}</p>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Estimasi Budget Buyer:</span>
                        <p className="text-sm font-black text-emerald-900 font-mono">
                          Rp {item.budgetMin.toLocaleString("id-ID")} - Rp {item.budgetMax.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Kriteria Pembelian:</span>
                        <p className="text-slate-600 line-clamp-3 leading-relaxed">
                          {item.criteria}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <strong>Sistem Pembayaran:</strong> {item.paymentSystem}
                      </div>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Broker Buyer: <strong className="text-slate-700">{item.brokerName}</strong></span>
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          A1 Buyer Ready
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedProject({ ...item, type: "demand" })}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                        >
                          Detail Kriteria
                        </button>
                        <button
                          onClick={() => handleOpenInterestModal(item, "demand")}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Send size={12} />
                          <span>Tawarkan Suplai</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 3. MODAL DETAIL PROYEK */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedProject.type === "supply" ? "bg-amber-500 text-slate-950" : "bg-emerald-600 text-white"
                }`}>
                  {selectedProject.type === "supply" ? "Penawaran Barang Valid" : "Pencarian Buyer Ready"}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedProject.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Kategori: {selectedProject.category}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {selectedProject.imageUrl && (
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-56 object-cover rounded-2xl border border-slate-200"
                />
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Nilai / Budget:</span>
                  <p className="text-sm font-black text-slate-900">
                    {selectedProject.price
                      ? `Rp ${selectedProject.price.toLocaleString("id-ID")}`
                      : `Rp ${selectedProject.budgetMin?.toLocaleString("id-ID")} - ${selectedProject.budgetMax?.toLocaleString("id-ID")}`}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Lokasi Proyek:</span>
                  <p className="text-xs font-bold text-slate-800">{selectedProject.location || "Indonesia"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs">Spesifikasi / Kriteria Lengkap:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed text-slate-700">
                  {selectedProject.specifications || selectedProject.criteria}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <ShieldCheck size={14} className="text-amber-600" />
                  <span>Aturan Keamanan Kontak Platform:</span>
                </p>
                <p className="text-[11px] leading-normal text-amber-800">
                  Untuk menjaga privasi dan menghindari klaim ganda, nomor kontak pemilik proyek hanya dibuka setelah diajukan minat dan diverifikasi kualifikasinya oleh Admin Platform.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const proj = selectedProject;
                  setSelectedProject(null);
                  handleOpenInterestModal(proj, proj.type);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Ajukan Minat Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL AJUKAN MINAT / MATCHMAKING */}
      {interestProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendInterestSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Form Pengajuan Minat</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Ajukan Minat ke: {interestProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInterestProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Pengaju Minat (Nickname): <strong className="text-slate-800">{currentUser?.username || currentUser?.fullName}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentUser?.kycStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    KYC: {currentUser?.kycStatus || "UNVERIFIED"}
                  </span>
                </div>
                <p className="text-slate-500">Pemilik Proyek: <strong className="text-slate-800">{interestProject.brokerName}</strong></p>
                <p className="text-slate-500">Saldo Saldo Deposit: <strong className="text-emerald-700">Rp {(currentUser?.balance || 0).toLocaleString("id-ID")}</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Pesan / Keterangan Kesiapan Kualifikasi Anda: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan kualifikasi barang/buyer Anda (contoh: Saya punya buyer A1 siap dana LOI, atau Saya punya stok komoditas sesuai kriteria)..."
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                ></textarea>

                {/* Real-time contact detection indicator */}
                {/(?:\+?62|0)[2-9]\d{6,}|wa\.me|whatsapp|t\.me|@|\.com|\.id|08\d+/i.test(interestMessage) && (
                  <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-300 text-[11px] font-medium flex items-center gap-2">
                    <span className="text-amber-600 font-bold">🔒 Sensor Otomatis:</span>
                    <span>Nomor HP/Link kontak dalam teks Anda akan disensor otomatis oleh sistem agar transaksi terproteksi lewat Admin.</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 space-y-1 text-[11px]">
                <div className="flex items-center justify-between font-bold text-amber-400">
                  <span>Sistem Mediasi Rejeki Macan</span>
                  <span>Biaya Komitmen: Rp 5.000</span>
                </div>
                <p className="text-slate-400 text-[10.5px]">
                  🔒 Pengajuan ini memotong biaya komitmen deposit Rp 5.000 untuk mencegah spamming. Seluruh komunikasi difasilitasi oleh Admin Central.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInterestProject(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingInterest}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>{isSubmittingInterest ? "Mengirim..." : "Kirim Pengajuan Minat"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
