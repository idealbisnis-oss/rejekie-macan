import React, { useState, useEffect } from "react";
import { 
  Building2, PlusCircle, User, ShieldCheck, CheckCircle2, Send, 
  Trash2, RefreshCw, Layers, MapPin, Tag, AlertCircle, Sparkles,
  Upload, X, Link as LinkIcon, Image as ImageIcon, Wallet, Clock,
  Calendar, Coins, XCircle, Plus, Info, AlertTriangle, ShieldAlert,
  QrCode, Building, CreditCard, Copy, Check, FileCheck, ArrowRight, History,
  MessageSquare, Lock, Unlock
} from "lucide-react";
import { UserSession, DepositRequest, PaymentMethod } from "../types";
import { apiTopUpDeposit, apiExtendProject, apiSubmitDeposit, apiGetDeposits, apiSendInterestChatMessage, apiUpdateUserKYC, apiUpdateInterest } from "../services/api";

import { PROJECT_CATEGORIES } from "../data/categories";

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

  // State Deposit Top Up Modal & Payment Flow
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpStep, setTopUpStep] = useState<1 | 2 | 3>(1); // 1: Nominal & Method, 2: Instructions & Confirm, 3: History/Status
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [senderName, setSenderName] = useState<string>(currentUser.fullName || "");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofNotes, setProofNotes] = useState<string>("");
  const [myDeposits, setMyDeposits] = useState<DepositRequest[]>([]);
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Load My Deposits History
  const loadMyDeposits = async () => {
    try {
      const res = await apiGetDeposits(currentUser.id);
      if (res.success && res.deposits) {
        setMyDeposits(res.deposits);
      }
    } catch (err) {
      console.error("Gagal mengambil riwayat deposit:", err);
    }
  };

  useEffect(() => {
    if (showTopUpModal) {
      loadMyDeposits();
    }
  }, [showTopUpModal]);

  // State Perpanjang Posting Modal
  const [extendingProject, setExtendingProject] = useState<any | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(10);
  const [isExtendingLoading, setIsExtendingLoading] = useState<boolean>(false);

  // State Member Mediation Chat Modal & Interest Name Editing
  const [activeChatInterest, setActiveChatInterest] = useState<any | null>(null);
  const [memberChatMessage, setMemberChatMessage] = useState<string>("");
  const [editingInterestItem, setEditingInterestItem] = useState<any | null>(null);
  const [editOwnerName, setEditOwnerName] = useState<string>("");
  const [editInterestedName, setEditInterestedName] = useState<string>("");
  const [isSavingInterestName, setIsSavingInterestName] = useState<boolean>(false);

  // State Edit Username Profile
  const [editUsername, setEditUsername] = useState<string>(currentUser.username || currentUser.fullName);
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);

  useEffect(() => {
    setEditUsername(currentUser.username || currentUser.fullName);
  }, [currentUser]);

  const handleSaveUsername = async () => {
    if (!editUsername.trim()) return;
    setIsSavingUsername(true);
    try {
      const res = await apiUpdateUserKYC(currentUser.id, { username: editUsername.trim() });
      if (res.success && res.user) {
        if (onUpdateUserSession) onUpdateUserSession(res.user);
        alert("✓ Username / Nickname Broker berhasil diperbarui!");
      } else {
        alert(res.message || "Gagal memperbarui username.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui username.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSaveInterestNames = async () => {
    if (!editingInterestItem) return;
    setIsSavingInterestName(true);
    try {
      const res = await apiUpdateInterest(editingInterestItem.id, {
        ownerBrokerName: editOwnerName,
        interestedBrokerName: editInterestedName
      });
      if (res.success && res.interest) {
        setEditingInterestItem(null);
        if (activeChatInterest?.id === editingInterestItem.id) {
          setActiveChatInterest(res.interest);
        }
        onRefreshData();
      } else {
        alert(res.message || "Gagal memperbarui nama pihak mediasi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memperbarui nama pihak.");
    } finally {
      setIsSavingInterestName(false);
    }
  };

  const handleSendMemberChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatInterest || !memberChatMessage.trim()) return;

    const isOwner = activeChatInterest.ownerBrokerId === currentUser.id;
    const role = isOwner ? "OWNER" : "REQUESTER";

    try {
      const res = await apiSendInterestChatMessage(activeChatInterest.id, {
        senderId: currentUser.id,
        senderName: currentUser.username || currentUser.fullName,
        senderRole: role,
        message: memberChatMessage.trim()
      });

      if (res.success && res.interest) {
        setActiveChatInterest(res.interest);
        setMemberChatMessage("");
        onRefreshData();
      } else if (res.message) {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal mengirim pesan chat mediasi.");
    }
  };

  const categories = PROJECT_CATEGORIES;

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
      brokerName: currentUser.fullName || currentUser.username,
      brokerUsername: currentUser.username || currentUser.fullName,
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

  // Proof Image Upload Handler
  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran bukti transfer maksimal 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Top Up Deposit Submit (Send confirmation request to Admin)
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) {
      alert("Jumlah deposit harus lebih dari 0.");
      return;
    }

    setIsTopUpLoading(true);
    const res = await apiSubmitDeposit({
      userId: currentUser.id,
      amount: topUpAmount,
      paymentMethod: selectedPaymentMethod,
      senderName: senderName || currentUser.fullName,
      proofUrl,
      notes: proofNotes || `Top up via ${selectedPaymentMethod}`
    });
    setIsTopUpLoading(false);

    if (res.success) {
      alert(res.message);
      await loadMyDeposits();
      setTopUpStep(3); // Switch to status history view
      onRefreshData();
    } else {
      alert(res.message || "Gagal melakukan konfirmasi top up deposit.");
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
      <div
        onClick={() => {
          setTopUpStep(3);
          setShowTopUpModal(true);
          loadMyDeposits();
        }}
        className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 p-5 rounded-2xl border border-amber-500/30 hover:border-amber-500/70 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-5"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
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
            <p className="text-[10.5px] font-bold text-amber-700 flex items-center gap-1 pt-0.5">
              <History size={13} />
              <span>Klik di sini untuk melihat riwayat mutasi & status deposit Anda →</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTopUpStep(3);
              setShowTopUpModal(true);
              loadMyDeposits();
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <History size={15} className="text-amber-600" />
            <span>📜 Riwayat Deposit</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTopUpStep(1);
              setShowTopUpModal(true);
            }}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Riwayat Pengajuan Minat & Ruang Chat Mediasi</h3>
              <p className="text-xs text-slate-500">Seluruh pesan terlindungi oleh Admin. Diskusi kualifikasi berjalan di Ruang Chat Mediasi 3-Arah.</p>
            </div>
            <button
              onClick={onRefreshData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Refresh Minat
            </button>
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
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID MINAT: {item.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{item.listingTitle || "Pengajuan Minat Proyek"}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.status === "VERIFIED_BY_ADMIN"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {item.status === "VERIFIED_BY_ADMIN" ? "✓ Mediasi Disetujui Admin" : "⏳ Menunggu Mediasi Admin"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 relative">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Pemilik Proyek (Nickname/Nama):</span>
                      <p className="font-bold text-slate-800">{item.ownerBrokerName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">Pengaju Minat (Nickname/Nama):</span>
                      <p className="font-bold text-slate-800">{item.interestedBrokerName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInterestItem(item);
                        setEditOwnerName(item.ownerBrokerName || "");
                        setEditInterestedName(item.interestedBrokerName || "");
                      }}
                      className="absolute top-2 right-2 text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      ✏️ Ubah Nama Pihak
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pesan Kualifikasi Anda:</span>
                    <p className="text-slate-800 font-medium italic">"{item.userMessage || item.message}"</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveChatInterest(item)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare size={13} />
                      <span>💬 Buka Ruang Chat Mediasi ({item.chatMessages?.length || 0} Pesan)</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : ""}
                    </span>
                  </div>
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
              <span className="text-slate-500">Nama Lengkap (KTP):</span>
              <strong className="text-slate-900 font-bold text-sm">{currentUser.fullName}</strong>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-2 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
              <div>
                <span className="text-amber-900 font-bold block text-[11px]">Username / Nickname Broker:</span>
                <span className="text-[10px] text-amber-700">Nama yang tampil publik di katalog & chat mediasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 w-36"
                />
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shadow-2xs cursor-pointer"
                >
                  {isSavingUsername ? "..." : "Simpan"}
                </button>
              </div>
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

      {/* MODAL: TOP UP DEPOSIT SALDO & SISTEM PEMBAYARAN */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
                  <Coins size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Top Up Saldo Deposit Iklan</h3>
                  <p className="text-[11px] text-slate-500">Pilihan pembayaran QRIS, Virtual Account & Transfer Bank</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpStep(1);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-center">
              <button
                onClick={() => setTopUpStep(1)}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  topUpStep === 1 ? "bg-slate-900 text-amber-400 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Pilih Nominal
              </button>
              <button
                onClick={() => setTopUpStep(2)}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  topUpStep === 2 ? "bg-slate-900 text-amber-400 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. Bayar & Konfirmasi
              </button>
              <button
                onClick={() => {
                  setTopUpStep(3);
                  loadMyDeposits();
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  topUpStep === 3 ? "bg-slate-900 text-amber-400 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <History size={13} />
                <span>Status ({myDeposits.length})</span>
              </button>
            </div>

            {/* STEP 1: PILIH NOMINAL & METODE PEMBAYARAN */}
            {topUpStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <p className="font-bold text-amber-900">Ketentuan Deposit Iklan:</p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Setiap postingan proyek mendapatkan <strong>Gratis 10 Hari Pertama</strong>. Setelah 10 hari, biaya perpanjangan tayang hanya <strong>Rp 500 / hari</strong> yang akan dipotong langsung dari saldo ini.
                  </p>
                </div>

                {/* Pilih Nominal Top Up Cepat */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block">Pilih Nominal Top Up Deposit:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[10000, 25000, 50000, 100000, 250000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`p-2.5 rounded-xl border font-bold text-xs font-mono transition-all cursor-pointer ${
                          topUpAmount === amt
                            ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm font-black"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        Rp {amt.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Custom Nominal */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Atau Input Nominal Bebas (Rp):</label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Pilih Sistem Pembayaran */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-800 block">Pilih Metode Pembayaran:</label>
                  <div className="space-y-2">
                    {/* QRIS */}
                    <div
                      onClick={() => setSelectedPaymentMethod("QRIS")}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPaymentMethod === "QRIS"
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
                          <QrCode size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">QRIS Instant Scan All Payment</p>
                          <p className="text-[10.5px] text-slate-500">BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "QRIS" ? "border-amber-600 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selectedPaymentMethod === "QRIS" && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                      </div>
                    </div>

                    {/* VA BCA */}
                    <div
                      onClick={() => setSelectedPaymentMethod("VA_BCA")}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPaymentMethod === "VA_BCA"
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900 text-white font-black text-[11px] rounded-xl font-mono">
                          BCA
                        </div>
                        <div>
                          <p className="font-black text-slate-900">Virtual Account BCA</p>
                          <p className="text-[10.5px] text-slate-500">Konfirmasi otomatis dengan kode VA khusus</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "VA_BCA" ? "border-amber-600 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selectedPaymentMethod === "VA_BCA" && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                      </div>
                    </div>

                    {/* VA Mandiri */}
                    <div
                      onClick={() => setSelectedPaymentMethod("VA_MANDIRI")}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPaymentMethod === "VA_MANDIRI"
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-700 text-white font-black text-[10px] rounded-xl font-mono">
                          MANDIRI
                        </div>
                        <div>
                          <p className="font-black text-slate-900">Virtual Account Mandiri</p>
                          <p className="text-[10.5px] text-slate-500">Transfer via Mandiri Livin' atau ATM Mandiri</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "VA_MANDIRI" ? "border-amber-600 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selectedPaymentMethod === "VA_MANDIRI" && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                      </div>
                    </div>

                    {/* VA BRI */}
                    <div
                      onClick={() => setSelectedPaymentMethod("VA_BRI")}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPaymentMethod === "VA_BRI"
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-700 text-white font-black text-[11px] rounded-xl font-mono">
                          BRI
                        </div>
                        <div>
                          <p className="font-black text-slate-900">Virtual Account BRI (BRIVA)</p>
                          <p className="text-[10.5px] text-slate-500">Transfer via BRImo atau ATM BRI</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "VA_BRI" ? "border-amber-600 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selectedPaymentMethod === "VA_BRI" && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                      </div>
                    </div>

                    {/* Direct Bank Transfer */}
                    <div
                      onClick={() => setSelectedPaymentMethod("BANK_TRANSFER")}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPaymentMethod === "BANK_TRANSFER"
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-800 text-white rounded-xl">
                          <Building size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">Transfer Bank Langsung (BCA)</p>
                          <p className="text-[10.5px] text-slate-500">Transfer ke Rekening Bank REJEKI MACAN PLATFORM</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "BANK_TRANSFER" ? "border-amber-600 bg-amber-500" : "border-slate-300"
                      }`}>
                        {selectedPaymentMethod === "BANK_TRANSFER" && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <span className="font-mono text-slate-600">
                    Total: <strong className="text-slate-900 text-sm">Rp {topUpAmount.toLocaleString("id-ID")}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopUpStep(2)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>Lanjut Ke Instruksi Pembayaran</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: INSTRUKSI PEMBAYARAN & KONFIRMASI KE ADMIN */}
            {topUpStep === 2 && (
              <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
                {/* Visual Header Payment Instructions */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Instruksi Pembayaran</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono rounded font-bold">
                      {selectedPaymentMethod}
                    </span>
                  </div>

                  {/* Payment Info Render */}
                  {selectedPaymentMethod === "QRIS" && (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2 text-center">
                      <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200 inline-block">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=REJEKI_MACAN_DEPOSIT_${topUpAmount}_${currentUser.phoneNumber}`}
                          alt="QRIS Rejeki Macan"
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                      <p className="text-[11px] text-slate-300 font-bold">
                        Scan QRIS di atas menggunakan M-Banking / GoPay / OVO / Dana / ShopeePay
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "VA_BCA" && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Nomor Virtual Account BCA:</span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                        <span className="text-base font-black text-amber-400 tracking-wider">
                          880010{currentUser.phoneNumber || "08123456789"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`880010${currentUser.phoneNumber || "08123456789"}`);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10.5px] cursor-pointer flex items-center gap-1"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? "Tersalin" : "Salin VA"}</span>
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-400">Atas Nama: REJEKI MACAN PLATFORM</p>
                    </div>
                  )}

                  {selectedPaymentMethod === "VA_MANDIRI" && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Nomor Virtual Account Mandiri:</span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                        <span className="text-base font-black text-amber-400 tracking-wider">
                          890080{currentUser.phoneNumber || "08123456789"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`890080${currentUser.phoneNumber || "08123456789"}`);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10.5px] cursor-pointer flex items-center gap-1"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? "Tersalin" : "Salin VA"}</span>
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-400">Atas Nama: REJEKI MACAN PLATFORM</p>
                    </div>
                  )}

                  {selectedPaymentMethod === "VA_BRI" && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Nomor BRIVA (BRI Virtual Account):</span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                        <span className="text-base font-black text-amber-400 tracking-wider">
                          888100{currentUser.phoneNumber || "08123456789"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`888100${currentUser.phoneNumber || "08123456789"}`);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10.5px] cursor-pointer flex items-center gap-1"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? "Tersalin" : "Salin VA"}</span>
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-400">Atas Nama: REJEKI MACAN PLATFORM</p>
                    </div>
                  )}

                  {selectedPaymentMethod === "BANK_TRANSFER" && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold">Rekening Bank BCA Resmi:</span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                        <div>
                          <span className="text-base font-black text-amber-400 tracking-wider block">8830-1928-33</span>
                          <span className="text-[10px] text-slate-400 block font-sans">A/N PT REJEKI MACAN NUSANTARA</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("8830192833");
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10.5px] cursor-pointer flex items-center gap-1"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? "Tersalin" : "Salin Rek"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2 font-mono text-xs">
                    <span>Total Transfer:</span>
                    <strong className="text-emerald-400 font-black text-sm">Rp {topUpAmount.toLocaleString("id-ID")}</strong>
                  </div>
                </div>

                {/* Form Konfirmasi Ke Admin */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-slate-900 font-black">
                    <FileCheck size={16} className="text-amber-600" />
                    <span>Form Konfirmasi Pembayaran Ke Admin</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Nama Pemilik Rekening / Pengirim:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Hendra Wijaya"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs"
                    />
                  </div>

                  {/* Upload Bukti Transfer */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Upload Bukti Transfer / Resi (Opsional):</label>
                    {proofUrl ? (
                      <div className="relative inline-block border border-amber-500 rounded-xl overflow-hidden bg-slate-900 max-w-xs">
                        <img src={proofUrl} alt="Bukti Transfer" className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => setProofUrl("")}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl bg-slate-50 hover:bg-amber-500/5 transition-all cursor-pointer text-slate-600 font-bold text-xs">
                        <Upload size={16} className="text-amber-600" />
                        <span>Pilih Foto Bukti Transfer dari Galeri</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">Catatan Tambahan (Opsional):</label>
                    <input
                      type="text"
                      placeholder="Contoh: Transfer via M-Banking BCA pk 14.30"
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setTopUpStep(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isTopUpLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isTopUpLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Kirim Konfirmasi Deposit Ke Admin</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: RIWAYAT & STATUS PENGASUHAN DEPOSIT */}
            {topUpStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">Riwayat & Status Pengajuan Deposit</h4>
                  <button
                    onClick={loadMyDeposits}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                  >
                    <RefreshCw size={12} /> Sync Status
                  </button>
                </div>

                {myDeposits.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Coins size={32} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">Belum Ada Riwayat Deposit</p>
                    <p className="text-[11px] text-slate-400">Silakan lakukan top up saldo deposit pertama Anda.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {myDeposits.map((dep) => (
                      <div key={dep.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{dep.id} • {new Date(dep.createdAt).toLocaleDateString("id-ID")}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            dep.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : dep.status === "REJECTED"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                          }`}>
                            {dep.status === "APPROVED" ? "✓ Saldo Masuk" : dep.status === "REJECTED" ? "✕ Ditolak" : "⏳ Menunggu Admin"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-mono">
                          <span className="font-black text-slate-900 text-sm">Rp {dep.amount?.toLocaleString("id-ID")}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded">{dep.paymentMethod}</span>
                        </div>

                        {dep.notes && <p className="text-[11px] text-slate-600">Catatan: {dep.notes}</p>}
                        {dep.rejectionReason && (
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[10.5px] border border-red-200">
                            <strong>Alasan Penolakan:</strong> {dep.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setTopUpStep(1)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    + Buat Top Up Baru
                  </button>
                </div>
              </div>
            )}
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

      {/* MODAL: RUANG CHAT MEDIASI 3-ARAH MEMBER */}
      {activeChatInterest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 max-w-2xl w-full space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold rounded">
                    RUANG MEDIASI 3-ARAH
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeChatInterest.isContactRevealed ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    {activeChatInterest.isContactRevealed ? "🔓 Akses Kontak Terbuka Resmi" : "🔒 Disensor Sistem"}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base">{activeChatInterest.listingTitle}</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-bold pt-0.5">
                  <span>Pemilik: <span className="text-slate-900">{activeChatInterest.ownerBrokerName}</span></span>
                  <span>|</span>
                  <span>Pengaju: <span className="text-slate-900">{activeChatInterest.interestedBrokerName}</span></span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInterestItem(activeChatInterest);
                      setEditOwnerName(activeChatInterest.ownerBrokerName || "");
                      setEditInterestedName(activeChatInterest.interestedBrokerName || "");
                    }}
                    className="text-[10px] text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 cursor-pointer"
                  >
                    ✏️ Edit Nama Pihak
                  </button>
                </div>
              </div>

              <button
                onClick={() => setActiveChatInterest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Protection Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs flex items-start gap-2">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed text-[11px]">
                <strong className="block text-amber-900 font-bold">Proteksi Mediasi Central:</strong>
                <span>
                  Nomor HP, email, & link WA disensor otomatis oleh sistem sampai kualifikasi transaksi disetujui Admin. Admin mendampingi seluruh proses negosiasi.
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[260px] max-h-[360px]">
              {(!activeChatInterest.chatMessages || activeChatInterest.chatMessages.length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada pesan mediasi. Mulai kirim pesan kualifikasi Anda di bawah.
                </div>
              ) : (
                activeChatInterest.chatMessages.map((msg: any, idx: number) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isAdmin = msg.senderRole === "ADMIN";
                  const isSystem = msg.senderRole === "SYSTEM";

                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center my-2">
                        <span className="inline-block px-3 py-1 bg-amber-500/15 text-amber-900 border border-amber-300 text-[10.5px] font-mono font-bold rounded-full">
                          🛡️ {msg.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col space-y-1 ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold px-1">
                        <span>{msg.senderName} ({msg.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                        {msg.hasContactAttempt && (
                          <span className="text-amber-600 font-extrabold flex items-center gap-0.5 bg-amber-100 px-1.5 py-0.2 rounded">
                            <Lock size={10} /> Disensor
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed font-medium shadow-xs ${
                          isMe
                            ? "bg-amber-500 text-slate-950 rounded-tr-xs font-bold"
                            : isAdmin
                            ? "bg-slate-900 text-amber-400 border border-amber-500/30 rounded-tl-xs"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMemberChatMessage} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                required
                placeholder="Tuliskan pesan / pertanyaan kualifikasi Anda..."
                value={memberChatMessage}
                onChange={(e) => setMemberChatMessage(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-xs font-medium"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer text-xs flex items-center gap-1.5 shadow"
              >
                <Send size={13} />
                <span>Kirim Pesan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UBAH NAMA PIHAK MEDIASI (USERNAME / NICKNAME) */}
      {editingInterestItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Ubah Nama Pihak Mediasi</h3>
                <p className="text-xs text-slate-500">Ubah penamaan Pemilik Proyek & Pengaju Minat menjadi Username / Nickname.</p>
              </div>
              <button
                onClick={() => setEditingInterestItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Username Pemilik Proyek:</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  placeholder="Contoh: Hendra_A1 / Broker_Hendra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Username Pengaju Minat:</label>
                <input
                  type="text"
                  value={editInterestedName}
                  onChange={(e) => setEditInterestedName(e.target.value)}
                  placeholder="Contoh: Amiruddin_Broker / Amir_Property"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingInterestItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveInterestNames}
                disabled={isSavingInterestName}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSavingInterestName ? "Menyimpan..." : "✓ Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
