import React, { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, XCircle, ShieldAlert, FileText, Database, 
  Trash2, RefreshCw, Send, Check, AlertTriangle, Layers, Building2, UserCheck, Clock, CheckCircle,
  Coins, Eye, QrCode, Building, ExternalLink, History, MessageSquare, Lock, Unlock, ShieldCheck,
  Settings, Key, UserPlus, RotateCcw, PlusCircle, Upload, Sparkles, MapPin, Tag, DollarSign, Image as ImageIcon
} from "lucide-react";
import { 
  apiGetUsers, apiUpdateUserKYC, apiDeleteUser, apiGetAdminStats, 
  apiDeleteProject, apiGetInterests, apiUpdateInterest, apiModerateProject,
  apiGetDeposits, apiApproveDeposit, apiRejectDeposit, apiSendInterestChatMessage,
  apiAdminResetWebsite, apiAdminUpdateCredentials, apiAdminCreateAccount,
  apiCreateProject
} from "../services/api";
import { PROJECT_CATEGORIES } from "../data/categories";
import { RupiahInput } from "./RupiahInput";
import { parseRupiahInput } from "../utils/currencyUtils";

interface DashboardAdminProps {
  supplyListings: any[];
  demandListings: any[];
  onRefreshData: () => void;
  currentUser?: any;
  onUpdateUserSession?: (updatedUser: any) => void;
}

export default function DashboardAdmin({ supplyListings, demandListings, onRefreshData, currentUser, onUpdateUserSession }: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState<"DEPOSITS" | "USERS" | "PROJECTS" | "INTERESTS" | "DATABASE" | "SETTINGS">("DEPOSITS");
  const [projectFilter, setProjectFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [depositFilter, setDepositFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const [users, setUsers] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // State Form Edit Credential Admin (Username & Password)
  const [adminFullName, setAdminFullName] = useState<string>(currentUser?.fullName || "");
  const [adminUsername, setAdminUsername] = useState<string>(currentUser?.username || currentUser?.fullName || "");
  const [adminEmail, setAdminEmail] = useState<string>(currentUser?.email || "");
  const [adminPhone, setAdminPhone] = useState<string>(currentUser?.phoneNumber || "");
  const [adminCurrentPassword, setAdminCurrentPassword] = useState<string>("");
  const [adminNewPassword, setAdminNewPassword] = useState<string>("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>("");
  const [isUpdatingCreds, setIsUpdatingCreds] = useState<boolean>(false);

  // State Form Tambah Admin Baru
  const [newAdminFullName, setNewAdminFullName] = useState<string>("");
  const [newAdminUsername, setNewAdminUsername] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [newAdminPhone, setNewAdminPhone] = useState<string>("");
  const [newAdminPassword, setNewAdminPassword] = useState<string>("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>(false);

  // State Reset Website Modal
  const [resetModalType, setResetModalType] = useState<"FULL_FACTORY_RESET" | "TRANSACTIONS_ONLY" | "LISTINGS_ONLY" | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState<string>("");
  const [isExecutingReset, setIsExecutingReset] = useState<boolean>(false);

  // State Admin Pos Project (Supply & Demand)
  const [showAdminPostModal, setShowAdminPostModal] = useState<boolean>(false);
  const [adminProjectType, setAdminProjectType] = useState<"supply" | "demand">("supply");
  const [adminTitle, setAdminTitle] = useState<string>("");
  const [adminCategory, setAdminCategory] = useState<string>("Lahan / Tanah Komersial");
  const [adminLocation, setAdminLocation] = useState<string>("Jakarta & Sekitarnya");
  const [adminPrice, setAdminPrice] = useState<string>("");
  const [adminBudgetMin, setAdminBudgetMin] = useState<string>("");
  const [adminBudgetMax, setAdminBudgetMax] = useState<string>("");
  const [adminPaymentSystem, setAdminPaymentSystem] = useState<string>("Cash Keras / Bertahap");
  const [adminSpecifications, setAdminSpecifications] = useState<string>("");
  const [adminImageUrl, setAdminImageUrl] = useState<string>("");
  const [adminIsPremium, setAdminIsPremium] = useState<boolean>(true);
  const [isSubmittingAdminProject, setIsSubmittingAdminProject] = useState<boolean>(false);

  // Handler Upload Foto Proyek Admin
  const handleAdminImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 10MB", "error");
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
        setAdminImageUrl(resizedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler Submit Proyek Admin
  const handleAdminSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || !adminSpecifications.trim()) {
      showToast("Harap isi judul dan deskripsi spesifikasi proyek!", "error");
      return;
    }

    setIsSubmittingAdminProject(true);
    try {
      const res = await apiCreateProject({
        projectType: adminProjectType,
        title: adminTitle.trim(),
        category: adminCategory,
        location: adminLocation || "Indonesia",
        specifications: adminSpecifications.trim(),
        criteria: adminSpecifications.trim(),
        price: adminPrice ? parseRupiahInput(adminPrice) : 0,
        budgetMin: adminBudgetMin ? parseRupiahInput(adminBudgetMin) : 0,
        budgetMax: adminBudgetMax ? parseRupiahInput(adminBudgetMax) : 0,
        paymentSystem: adminPaymentSystem,
        brokerId: currentUser?.id || "admin-1",
        imageUrl: adminImageUrl || (adminProjectType === "supply" ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" : undefined),
        isPremium: adminIsPremium
      });

      if (res.success) {
        showToast(res.message || "✓ Proyek berhasil dipublikasikan sebagai Admin Terverifikasi (A1)!");
        setShowAdminPostModal(false);
        setAdminTitle("");
        setAdminSpecifications("");
        setAdminPrice("");
        setAdminBudgetMin("");
        setAdminBudgetMax("");
        setAdminImageUrl("");
        onRefreshData();
      } else {
        showToast(res.message || "Gagal memposting proyek admin.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memposting proyek.", "error");
    } finally {
      setIsSubmittingAdminProject(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setAdminFullName(currentUser.fullName || "");
      setAdminUsername(currentUser.username || currentUser.fullName || "");
      setAdminEmail(currentUser.email || "");
      setAdminPhone(currentUser.phoneNumber || "");
    }
  }, [currentUser]);

  // Handler Update Admin Profile & Password
  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword) {
      if (!adminCurrentPassword) {
        showToast("Harap masukkan password saat ini (lama) untuk mengubah password baru!", "error");
        return;
      }
      if (adminNewPassword !== adminConfirmPassword) {
        showToast("Konfirmasi password baru tidak cocok dengan password baru!", "error");
        return;
      }
    }

    setIsUpdatingCreds(true);
    try {
      const res = await apiAdminUpdateCredentials({
        adminId: currentUser?.id,
        fullName: adminFullName,
        username: adminUsername,
        email: adminEmail,
        phoneNumber: adminPhone,
        currentPassword: adminCurrentPassword || undefined,
        newPassword: adminNewPassword || undefined,
      });

      if (res.success && res.user) {
        showToast(res.message || "✓ Profile & Kredensial Admin berhasil diperbarui!");
        if (onUpdateUserSession) onUpdateUserSession(res.user);
        setAdminCurrentPassword("");
        setAdminNewPassword("");
        setAdminConfirmPassword("");
        loadData();
      } else {
        showToast(res.message || "Gagal memperbarui profil admin.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat memperbarui profil.", "error");
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Handler Tambah Akun Admin Baru
  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminFullName || !newAdminEmail || !newAdminPhone || !newAdminPassword) {
      showToast("Harap isi semua kolom wajib untuk pendaftaran admin baru!", "error");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const res = await apiAdminCreateAccount({
        fullName: newAdminFullName,
        username: newAdminUsername || newAdminFullName,
        email: newAdminEmail,
        phoneNumber: newAdminPhone,
        password: newAdminPassword,
      });

      if (res.success) {
        showToast(res.message || "✓ Akun Admin baru berhasil ditambahkan!");
        setNewAdminFullName("");
        setNewAdminUsername("");
        setNewAdminEmail("");
        setNewAdminPhone("");
        setNewAdminPassword("");
        loadData();
      } else {
        showToast(res.message || "Gagal menambahkan akun admin baru.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menambahkan akun admin.", "error");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Handler Eksekusi Reset Website
  const handleExecuteResetWebsite = async () => {
    if (!resetModalType) return;
    if (resetConfirmText.trim().toUpperCase() !== "RESET") {
      showToast("Harap ketik kata 'RESET' dengan huruf kapital untuk konfirmasi!", "error");
      return;
    }

    setIsExecutingReset(true);
    try {
      const res = await apiAdminResetWebsite(resetModalType);
      if (res.success) {
        showToast(res.message || "✓ Reset Website berhasil dilakukan!");
        setResetModalType(null);
        setResetConfirmText("");
        loadData();
        onRefreshData();
      } else {
        showToast(res.message || "Gagal melakukan reset website.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mereset website.", "error");
    } finally {
      setIsExecutingReset(false);
    }
  };

  // Load Admin Data from Server API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uRes, iRes, sRes, dRes] = await Promise.all([
        apiGetUsers(),
        apiGetInterests(),
        apiGetAdminStats(),
        apiGetDeposits()
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (iRes.success) setInterests(iRes.interests);
      if (sRes.success) setStats(sRes);
      if (dRes.success) setDeposits(dRes.deposits || []);
    } catch (err) {
      console.error("Failed loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Action Modals & Notification State
  const [approveDepositTarget, setApproveDepositTarget] = useState<any | null>(null);
  const [rejectDepositTarget, setRejectDepositTarget] = useState<any | null>(null);
  const [depositRejectReason, setDepositRejectReason] = useState<string>("Bukti transfer tidak valid atau dana belum masuk ke rekening.");

  const [rejectProjectTarget, setRejectProjectTarget] = useState<string | null>(null);
  const [projectRejectReason, setProjectRejectReason] = useState<string>("Spesifikasi postingan belum memenuhi kriteria kelengkapan.");

  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<any | null>(null);
  const [selectedMemberForDepositHistory, setSelectedMemberForDepositHistory] = useState<any | null>(null);
  const [previewKtpUser, setPreviewKtpUser] = useState<any | null>(null);

  // Admin Mediation Chat State
  const [activeChatInterest, setActiveChatInterest] = useState<any | null>(null);
  const [adminChatMessage, setAdminChatMessage] = useState<string>("");

  // Edit Interest Parties State
  const [editingInterestItem, setEditingInterestItem] = useState<any | null>(null);
  const [editOwnerName, setEditOwnerName] = useState<string>("");
  const [editInterestedName, setEditInterestedName] = useState<string>("");
  const [isSavingInterestName, setIsSavingInterestName] = useState<boolean>(false);

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
        showToast("✓ Nama pihak mediasi berhasil diperbarui!");
        loadData();
      } else {
        showToast(res.message || "Gagal memperbarui nama pihak mediasi.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat memperbarui nama pihak.", "error");
    } finally {
      setIsSavingInterestName(false);
    }
  };

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendAdminChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatInterest || !adminChatMessage.trim()) return;

    try {
      const res = await apiSendInterestChatMessage(activeChatInterest.id, {
        senderId: "admin",
        senderName: "Admin Central Platform",
        senderRole: "ADMIN",
        message: adminChatMessage.trim()
      });

      if (res.success && res.interest) {
        setActiveChatInterest(res.interest);
        setAdminChatMessage("");
        loadData();
      }
    } catch (err) {
      showToast("Gagal mengirim pesan mediasi admin.", "error");
    }
  };

  const handleToggleRevealContact = async (interestId: string, currentStatus: boolean) => {
    try {
      const res = await apiUpdateInterest(interestId, undefined as any, undefined, !currentStatus);
      if (res.success && res.interest) {
        setActiveChatInterest(res.interest);
        showToast(!currentStatus ? "🔓 Kontak resmi berhasil dibuka untuk kedua belah pihak!" : "🔒 Kontak resmi kembali disensor.");
        loadData();
      }
    } catch (err) {
      showToast("Gagal memperbarui status akses kontak.", "error");
    }
  };

  // Deposit Approval Execution
  const executeApproveDeposit = async () => {
    if (!approveDepositTarget) return;
    setIsSubmittingAction(true);
    try {
      const res = await apiApproveDeposit(approveDepositTarget.id);
      if (res.success) {
        showToast(res.message || "Deposit berhasil disetujui! Saldo member telah bertambah.");
        setApproveDepositTarget(null);
        await loadData();
        onRefreshData();
      } else {
        showToast(res.message || "Gagal menyetujui deposit.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan saat menyetujui deposit.", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Deposit Rejection Execution
  const executeRejectDeposit = async () => {
    if (!rejectDepositTarget) return;
    setIsSubmittingAction(true);
    try {
      const res = await apiRejectDeposit(rejectDepositTarget.id, depositRejectReason);
      if (res.success) {
        showToast(res.message || "Deposit telah ditolak.");
        setRejectDepositTarget(null);
        await loadData();
        onRefreshData();
      } else {
        showToast(res.message || "Gagal menolak deposit.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan saat menolak deposit.", "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRemainingDays = (expiresAtStr: string) => {
    if (!expiresAtStr) return 0;
    const expiry = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Moderate Project Handler
  const handleApproveProject = async (projectId: string) => {
    setIsSubmittingAction(true);
    const res = await apiModerateProject(projectId, "APPROVED", "");
    setIsSubmittingAction(false);
    if (res.success) {
      showToast("Proyek disetujui dan kini tayang di katalog publik!");
      onRefreshData();
      loadData();
    } else {
      showToast(res.message || "Gagal menyetujui proyek.", "error");
    }
  };

  const executeRejectProject = async () => {
    if (!rejectProjectTarget) return;
    setIsSubmittingAction(true);
    const res = await apiModerateProject(rejectProjectTarget, "REJECTED", projectRejectReason);
    setIsSubmittingAction(false);
    if (res.success) {
      showToast("Proyek ditolak.");
      setRejectProjectTarget(null);
      onRefreshData();
      loadData();
    } else {
      showToast(res.message || "Gagal menolak proyek.", "error");
    }
  };

  // Handle KYC Update
  const handleUpdateKYC = async (userId: string, status: string) => {
    const res = await apiUpdateUserKYC(userId, { kycStatus: status });
    if (res.success) {
      showToast(`Status KYC member diubah menjadi: ${status}`);
      loadData();
    } else {
      showToast("Gagal memperbarui status KYC.", "error");
    }
  };

  // Delete User Execution
  const executeDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setIsSubmittingAction(true);
    const res = await apiDeleteUser(deleteUserTarget.id);
    setIsSubmittingAction(false);
    if (res.success) {
      showToast("User berhasil dihapus dari database server.");
      setDeleteUserTarget(null);
      loadData();
    } else {
      showToast("Gagal menghapus user.", "error");
    }
  };

  // Delete Project Execution
  const executeDeleteProject = async () => {
    if (!deleteProjectTarget) return;
    setIsSubmittingAction(true);
    const res = await apiDeleteProject(deleteProjectTarget.id);
    setIsSubmittingAction(false);
    if (res.success) {
      showToast("Proyek berhasil dihapus.");
      setDeleteProjectTarget(null);
      onRefreshData();
      loadData();
    } else {
      showToast("Gagal menghapus proyek.", "error");
    }
  };

  // Handle Interest Status Update
  const handleUpdateInterestStatus = async (interestId: string, status: string, notes?: string) => {
    const adminNotes = notes || prompt("Catatan Admin untuk verifikasi pengajuan minat ini:", "Telah diverifikasi Admin via WhatsApp");
    const res = await apiUpdateInterest(interestId, status, adminNotes || undefined);
    if (res.success) {
      alert("Status pengajuan minat berhasil diperbarui.");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Admin */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert size={14} />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Dashboard Admin Server Rejeki Macan</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Kelola persetujuan KYC member, kelola listing proyek, verifikasi pengajuan minat antar broker, dan pantau kesehatan database server central.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <button
            onClick={() => setShowAdminPostModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <PlusCircle size={15} />
            <span>+ Posting Proyek (Admin)</span>
          </button>

          <button
            onClick={() => {
              loadData();
              onRefreshData();
            }}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl shadow-md border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : "text-amber-400"} />
            <span>Sync Admin Database</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (Interactive Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setActiveTab("DEPOSITS");
            setDepositFilter("PENDING");
          }}
          className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-amber-300 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Deposit Pending</span>
            <Coins size={15} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {deposits.filter(d => d.status === "PENDING").length} Permintaan
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-amber-100">
            <span>Total: {deposits.length} Deposit</span>
            <span className="font-bold text-amber-800 group-hover:underline">Buka Historis →</span>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab("PROJECTS");
            setProjectFilter("ALL");
          }}
          className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-emerald-300 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Total Proyek Aktif</span>
            <Building2 size={15} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {(stats?.totalSupplyProjects || supplyListings.length) + (stats?.totalDemandProjects || demandListings.length)}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-emerald-100">
            <span>Suplai & Demand</span>
            <span className="font-bold text-emerald-800 group-hover:underline">Buka Proyek →</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("USERS")}
          className="bg-white hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-300 hover:border-slate-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Member Terdaftar</span>
            <Users size={15} className="text-slate-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats?.totalMembers || users.length} Member</p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200">
            <span>Pending KYC: {stats?.pendingKYC || 0}</span>
            <span className="font-bold text-slate-900 group-hover:underline">Kelola Member →</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("INTERESTS")}
          className="bg-slate-900 hover:bg-slate-800 p-4 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md text-white transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Matchmaking Minat</span>
            <Send size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{interests.length} Pengajuan</p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
            <span>Verifikasi Broker</span>
            <span className="font-bold text-amber-400 group-hover:underline">Buka Minat →</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("DEPOSITS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DEPOSITS" ? "bg-amber-500 text-slate-950 font-black shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Coins size={14} />
          <span>Konfirmasi Deposit ({deposits.filter(d => d.status === "PENDING").length} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("USERS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "USERS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={14} />
          <span>Kelola Member & KYC ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROJECTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "PROJECTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={14} />
          <span>Kelola Proyek ({supplyListings.length + demandListings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("INTERESTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "INTERESTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Send size={14} />
          <span>Matchmaking Minat ({interests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DATABASE")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DATABASE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database size={14} />
          <span>Status Database Server</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "SETTINGS" ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]" : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300"
          }`}
        >
          <Settings size={14} />
          <span>⚙️ Reset & Akses Admin</span>
        </button>
      </div>

      {/* TAB CONTENT 0: DEPOSIT CONFIRMATIONS */}
      {activeTab === "DEPOSITS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Coins size={18} className="text-amber-600" />
                <span>Persetujuan & Verifikasi Uang Masuk Deposit Member</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cek mutasi rekening / QRIS. Setelah uang masuk dipastikan, klik tombol <strong>"✓ Setujui Deposit"</strong> untuk menambah saldo member secara otomatis.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold shrink-0">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setDepositFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    depositFilter === st
                      ? "bg-slate-900 text-amber-400 font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st === "ALL" ? "Semua" : st === "PENDING" ? "⏳ Pending" : st === "APPROVED" ? "✓ Disetujui" : "✕ Ditolak"}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit List */}
          {deposits.filter(d => depositFilter === "ALL" || d.status === depositFilter).length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Coins size={36} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">Tidak ada pengajuan deposit dengan status ini.</p>
              <p className="text-xs text-slate-400">Pengajuan deposit baru dari member akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits
                .filter(d => depositFilter === "ALL" || d.status === depositFilter)
                .map((dep) => {
                  const userDetail = users.find(u => u.id === dep.userId);
                  return (
                    <div
                      key={dep.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: User & Amount Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-slate-400">{dep.id}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {new Date(dep.createdAt).toLocaleString("id-ID")}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            dep.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : dep.status === "REJECTED"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                          }`}>
                            {dep.status === "APPROVED" ? "✓ Disetujui & Masuk" : dep.status === "REJECTED" ? "✕ Ditolak" : "⏳ Pending Cek Admin"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center shrink-0">
                            {dep.senderName ? dep.senderName[0].toUpperCase() : "M"}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{dep.senderName || userDetail?.fullName || "Member"}</h4>
                            <p className="text-xs text-slate-500 font-mono">
                              Email: {userDetail?.email || "-"} • WA: {userDetail?.phoneNumber || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <span className="p-2 bg-slate-900 text-amber-400 font-mono font-black text-sm rounded-xl">
                            Rp {dep.amount?.toLocaleString("id-ID")}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-800 font-bold rounded-lg font-mono">
                            Metode: {dep.paymentMethod}
                          </span>
                          {dep.notes && (
                            <span className="text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                              Catatan: {dep.notes}
                            </span>
                          )}
                        </div>

                        {dep.rejectionReason && (
                          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                            <strong>Alasan Penolakan:</strong> {dep.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Right: Proof & Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                        {/* Bukti Transfer Button / Thumbnail */}
                        {dep.proofUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProofUrl(dep.proofUrl)}
                            className="p-2 bg-white border border-slate-300 hover:border-amber-500 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-700 flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            <img src={dep.proofUrl} alt="Resi" className="w-8 h-8 object-cover rounded-lg" />
                            <span>Lihat Bukti Foto</span>
                            <Eye size={14} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tidak ada foto bukti</span>
                        )}

                        {/* Action buttons if status PENDING */}
                        {dep.status === "PENDING" && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => setApproveDepositTarget(dep)}
                              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 size={16} />
                              <span>Setujui Deposit</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectDepositTarget(dep);
                                setDepositRejectReason("Bukti transfer tidak valid atau dana belum masuk ke rekening.");
                              }}
                              className="flex-1 sm:flex-initial px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-all"
                            >
                              <XCircle size={16} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 1: USERS & KYC */}
      {activeTab === "USERS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Daftar Member & Status Verifikasi KYC</h3>
            <p className="text-xs text-slate-500">
              Admin bertindak sebagai validator awal untuk memverifikasi keabsahan NIK dan peran member.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Member</th>
                  <th className="p-3">Email & WhatsApp</th>
                  <th className="p-3">Peran Broker</th>
                  <th className="p-3">NIK / KTP & PT</th>
                  <th className="p-3">Saldo Deposit</th>
                  <th className="p-3">Status KYC</th>
                  <th className="p-3 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const userDeps = deposits.filter(d => d.userId === u.id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {u.fullName}
                        {u.role === "ADMIN" && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-500">{u.phoneNumber}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 font-bold rounded text-[11px]">
                          {u.role === "MAKELAR_BARANG" ? "Broker Penjual" : u.role === "MAKELAR_BUYER" ? "Broker Buyer" : u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{u.ktpNumber || "NIK Belum Diisi"}</div>
                        <div className="text-slate-500 font-sans text-[10.5px]">{u.organization || "-"}</div>
                        {u.ktpImageUrl ? (
                          <button
                            onClick={() => setPreviewKtpUser(u)}
                            className="mt-1 px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-sans font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye size={11} className="text-sky-700" />
                            <span>Lihat Foto KTP</span>
                          </button>
                        ) : (
                          <span className="inline-block mt-1 text-[9.5px] text-red-500 font-sans font-medium">⚠️ Foto KTP belum ada</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-black text-slate-900">Rp {(u.balance || 0).toLocaleString("id-ID")}</div>
                        <button
                          onClick={() => setSelectedMemberForDepositHistory(u)}
                          className="mt-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <History size={11} className="text-amber-700" />
                          <span>Histori Deposit ({userDeps.length})</span>
                        </button>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.kycStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : u.kycStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {u.kycStatus || "UNSUBMITTED"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {u.role !== "ADMIN" && (
                          <>
                            <button
                              onClick={() => handleUpdateKYC(u.id, "VERIFIED")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10.5px] shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateKYC(u.id, "REJECTED")}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10.5px] cursor-pointer"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => setDeleteUserTarget(u)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded text-[10.5px] cursor-pointer ml-1"
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PROJECTS & MODERATION */}
      {activeTab === "PROJECTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-5 p-4 sm:p-6">
          {/* Admin Fast Post Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-50 p-4 sm:p-5 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Posting Proyek Baru Sebagai Admin</span>
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[10px] font-black uppercase">Auto A1 Verified</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publikasikan listing tanah, properti, atau kebutuhan investor langsung disetujui dan live di katalog website.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAdminPostModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-105 shrink-0"
            >
              <PlusCircle size={16} />
              <span>+ Buat Listing Proyek</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Moderasi & Manajemen Proyek (Limit 10 Hari)</h3>
              <p className="text-xs text-slate-500">
                Verifikasi postingan baru sebelum tampil di dashboard katalog publik. Setujui atau tolak pengajuan broker.
              </p>
            </div>

            {/* Filter Moderasi */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              {[
                { key: "ALL", label: "Semua" },
                { key: "PENDING", label: "⏳ Pending" },
                { key: "APPROVED", label: "✓ Approved" },
                { key: "REJECTED", label: "✕ Rejected" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setProjectFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    projectFilter === f.key
                      ? "bg-slate-900 text-amber-400 font-black shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supply Listings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <span>📦 Penawaran Barang ({supplyListings.filter(s => projectFilter === "ALL" || (s.moderationStatus || "APPROVED") === projectFilter).length})</span>
              </h4>

              {supplyListings
                .filter((s) => projectFilter === "ALL" || (s.moderationStatus || "APPROVED") === projectFilter)
                .map((s) => {
                  const modStatus = s.moderationStatus || "APPROVED";
                  const remDays = getRemainingDays(s.expiresAt);
                  return (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          {modStatus === "PENDING" && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <Clock size={11} className="text-amber-600 animate-pulse" /> Pending Moderasi
                            </span>
                          )}
                          {modStatus === "APPROVED" && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" /> Disetujui (Tayang)
                            </span>
                          )}
                          {modStatus === "REJECTED" && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <XCircle size={11} className="text-red-600" /> Ditolak
                            </span>
                          )}

                          <span className="text-[10.5px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                            ⏱️ Sisa {remDays} Hari
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm">{s.title}</h5>
                        <p className="text-slate-600 line-clamp-2 text-[11.5px]">{s.specifications}</p>
                        
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                          <span className="font-bold text-slate-900">Rp {s.price?.toLocaleString("id-ID")}</span>
                          <span>Broker: <strong className="font-mono text-slate-800">@{s.brokerUsername || s.brokerId}</strong></span>
                        </div>

                        {s.rejectionReason && (
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200">
                            <strong>Alasan Penolakan:</strong> {s.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Moderation Actions */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {modStatus !== "APPROVED" && (
                            <button
                              onClick={() => handleApproveProject(s.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 size={13} /> Setujui
                            </button>
                          )}
                          {modStatus !== "REJECTED" && (
                            <button
                              onClick={() => {
                                setRejectProjectTarget(s.id);
                                setProjectRejectReason("Spesifikasi postingan belum memenuhi kriteria kelengkapan.");
                              }}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setDeleteProjectTarget(s)}
                          className="p-1 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg cursor-pointer"
                          title="Hapus Permanen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Demand Listings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>💼 Pencarian Buyer ({demandListings.filter(d => projectFilter === "ALL" || (d.moderationStatus || "APPROVED") === projectFilter).length})</span>
              </h4>

              {demandListings
                .filter((d) => projectFilter === "ALL" || (d.moderationStatus || "APPROVED") === projectFilter)
                .map((d) => {
                  const modStatus = d.moderationStatus || "APPROVED";
                  const remDays = getRemainingDays(d.expiresAt);
                  return (
                    <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-3 text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          {modStatus === "PENDING" && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <Clock size={11} className="text-amber-600 animate-pulse" /> Pending Moderasi
                            </span>
                          )}
                          {modStatus === "APPROVED" && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" /> Disetujui (Tayang)
                            </span>
                          )}
                          {modStatus === "REJECTED" && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                              <XCircle size={11} className="text-red-600" /> Ditolak
                            </span>
                          )}

                          <span className="text-[10.5px] font-mono text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                            ⏱️ Sisa {remDays} Hari
                          </span>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm">{d.title}</h5>
                        <p className="text-slate-600 line-clamp-2 text-[11.5px]">{d.criteria}</p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                          <span className="font-bold text-emerald-800">Budget Max: Rp {d.budgetMax?.toLocaleString("id-ID")}</span>
                          <span>Broker: <strong className="font-mono text-slate-800">@{d.brokerUsername || d.brokerId}</strong></span>
                        </div>

                        {d.rejectionReason && (
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] border border-red-200">
                            <strong>Alasan Penolakan:</strong> {d.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Moderation Actions */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {modStatus !== "APPROVED" && (
                            <button
                              onClick={() => handleApproveProject(d.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 size={13} /> Setujui
                            </button>
                          )}
                          {modStatus !== "REJECTED" && (
                            <button
                              onClick={() => {
                                setRejectProjectTarget(d.id);
                                setProjectRejectReason("Spesifikasi postingan belum memenuhi kriteria kelengkapan.");
                              }}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setDeleteProjectTarget(d)}
                          className="p-1 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg cursor-pointer"
                          title="Hapus Permanen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: INTERESTS */}
      {activeTab === "INTERESTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Pengajuan Minat & Ruang Mediasi Central</h3>
              <p className="text-xs text-slate-500">
                Seluruh pengajuan terfilter dari percobaan bypass kontak. Mediasikan percakapan broker & buka kontak resmi saat deal disetujui.
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Sync Minat
            </button>
          </div>

          <div className="space-y-3">
            {interests.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-400">ID MINAT: {item.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.listingTitle}</h4>
                    {item.hasContactAttempt && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-900 font-bold text-[10px] rounded border border-amber-400 flex items-center gap-1">
                        <Lock size={11} className="text-amber-700" /> Sensor Bypass Terdeteksi
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded border border-emerald-300">
                      Komitmen Deposit: Rp {(item.commitmentFee || 5000).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase self-start sm:self-auto ${
                    item.status === "VERIFIED_BY_ADMIN"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px] bg-white p-3 rounded-xl border border-slate-200 relative">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Pengaju Minat (Requester Nickname/Nama):</span>
                    <p className="font-bold text-slate-800">{item.interestedBrokerName} ({item.interestedBrokerPhone})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Pemilik Proyek (Owner Nickname/Nama):</span>
                    <p className="font-bold text-slate-800">{item.ownerBrokerName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInterestItem(item);
                      setEditOwnerName(item.ownerBrokerName || "");
                      setEditInterestedName(item.interestedBrokerName || "");
                    }}
                    className="absolute top-2 right-2 text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    ✏️ Edit Nama Pihak
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Pesan Awal Kualifikasi (Disensor Sistem):</div>
                  <p className="text-xs font-medium text-slate-800">"{item.userMessage}"</p>
                </div>

                {item.adminNotes && (
                  <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                    <strong>Catatan Admin:</strong> {item.adminNotes}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveChatInterest(item)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare size={14} />
                    <span>💬 Buka Ruang Chat Mediasi 3-Arah ({item.chatMessages?.length || 0} Pesan)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {item.status !== "VERIFIED_BY_ADMIN" && (
                      <button
                        onClick={() => handleUpdateInterestStatus(item.id, "VERIFIED_BY_ADMIN", "Pengajuan diverifikasi & diteruskan oleh Admin Platform.")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>Setujui Mediasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DATABASE MONITOR */}
      {activeTab === "DATABASE" && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Database size={16} />
              <span>Status Server Database JSON Disk Storage</span>
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
              ONLINE & TERFOKUS
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-slate-300">
            <p><strong>Database Path:</strong> <span className="text-emerald-400">/data/database.json</span></p>
            <p><strong>Total User Records:</strong> {users.length}</p>
            <p><strong>Total Supply Records:</strong> {supplyListings.length}</p>
            <p><strong>Total Demand Records:</strong> {demandListings.length}</p>
            <p><strong>Total Interest Records:</strong> {interests.length}</p>
            <p><strong>Last Sync Timestamp:</strong> {new Date().toLocaleString("id-ID")}</p>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            💡 <strong>Keunggulan Single Server Database:</strong> Seluruh pendaftaran member baru, posting proyek, dan pengajuan minat tersimpan di server backend tunggal. Setiap kali aplikasi dibuka di HP atau laptop manapun, data yang ditampilkan selalu sinkron secara real-time!
          </p>
        </div>
      )}

      {/* TAB CONTENT 5: RESET WEBSITE & AKES ADMIN */}
      {activeTab === "SETTINGS" && (
        <div className="space-y-8 animate-in fade-in duration-200">

          {/* SECTION 1: ATUR PASSWORD, USERNAME, & PROFIL ADMIN SAYA */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Atur Password, Username & Profil Admin</h3>
                  <p className="text-xs text-slate-500">Kelola identitas publik, email, nomor kontak, serta ganti password akun admin Anda.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-[11px] border border-amber-300">
                👑 Akun Utama Terhubung
              </span>
            </div>

            <form onSubmit={handleUpdateAdminProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Kiri: Informasi Profil */}
                <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                    👤 Identitas & Kontak Admin
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Nama Lengkap Admin:</label>
                    <input
                      type="text"
                      required
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      placeholder="Contoh: Super Admin Platform"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                      <span>Username / Nickname Admin:</span>
                      <span className="text-[10px] text-amber-600 font-bold">🔒 Tampil di Publik</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Contoh: Super Admin"
                      className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Email Admin:</label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">No. WhatsApp:</label>
                      <input
                        type="text"
                        required
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Kanan: Ganti Password */}
                <div className="space-y-4 bg-amber-50/30 p-4 rounded-2xl border border-amber-200">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                    🔒 Ubah Keamanan Password
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kosongkan kolom password di bawah ini jika Anda tidak ingin mengganti password akun Anda saat ini.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Password Saat Ini (Lama):</label>
                    <input
                      type="password"
                      value={adminCurrentPassword}
                      onChange={(e) => setAdminCurrentPassword(e.target.value)}
                      placeholder="Masukkan password lama"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Password Baru:</label>
                      <input
                        type="password"
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        placeholder="Password baru"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Konfirmasi Password Baru:</label>
                      <input
                        type="password"
                        value={adminConfirmPassword}
                        onChange={(e) => setAdminConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isUpdatingCreds}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-2 transition-all"
                >
                  {isUpdatingCreds ? "Menyimpan Perubahan..." : "💾 Simpan Perubahan Profil & Password Admin"}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: KELOLA & TAMBAH AKUN ADMIN BARU */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Tambah & Akses Akun Admin Baru</h3>
                  <p className="text-xs text-slate-500">Berikan akses administrator tambahan bagi asisten atau rekan tim verifikator Anda.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Form Tambah Admin */}
              <form onSubmit={handleCreateNewAdmin} className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>➕ Form Tambah Admin Baru</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Nama Lengkap Admin:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Asisten Verifikator"
                    value={newAdminFullName}
                    onChange={(e) => setNewAdminFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Username / Nickname Admin:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Admin_Budi"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Login:</label>
                  <input
                    type="email"
                    required
                    placeholder="budi.admin@rejekimacan.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">No. WhatsApp:</label>
                    <input
                      type="text"
                      required
                      placeholder="081234567890"
                      value={newAdminPhone}
                      onChange={(e) => setNewAdminPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Password Initial:</label>
                    <input
                      type="password"
                      required
                      placeholder="Password min 6 karakter"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isCreatingAdmin ? "Mendaftarkan Admin..." : "✨ Buat Akun Admin Baru"}
                </button>
              </form>

              {/* Tabel Daftar Admin Terdaftar */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  📋 Daftar Akun Administrator Terdaftar ({users.filter(u => u.role === "ADMIN").length})
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                  <div className="divide-y divide-slate-200">
                    {users.filter(u => u.role === "ADMIN").map((adm, idx) => (
                      <div key={adm.id || idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                            👑
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{adm.fullName}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-1.5 py-0.2 rounded">@{adm.username || "admin"}</span>
                            </p>
                            <p className="text-[10px] text-slate-500">{adm.email} • WA: {adm.phoneNumber}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          ✓ Active Admin
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RESET WEBSITE & SERVER DATABASE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Reset Website & Server Database</h3>
                  <p className="text-xs text-slate-500">Pilihan pembersihan data transaksi uji coba, pengembalian katalog proyek, atau reset total ke kondisi pabrik.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Opsi 1: Cleansing Transaksi */}
              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block">
                    🧹 Pembersihan Ringan
                  </span>
                  <h4 className="font-black text-slate-900 text-sm">Clear Riwayat Transaksi & Chat</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Menghapus seluruh historis pengajuan deposit, histori penawaran minat, serta percakapan ruang mediasi.
                    <strong> Akun member & listing proyek tetap utuh.</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalType("TRANSACTIONS_ONLY");
                    setResetConfirmText("");
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                >
                  Bersihkan Transaksi
                </button>
              </div>

              {/* Opsi 2: Reset Katalog */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block">
                    📦 Restorasi Katalog
                  </span>
                  <h4 className="font-black text-slate-900 text-sm">Reset Katalog Proyek (Listings)</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengembalikan daftar proyek tanah, lahan, & supply/demand ke data sampel bawaan terverifikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalType("LISTINGS_ONLY");
                    setResetConfirmText("");
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                >
                  Reset Katalog Proyek
                </button>
              </div>

              {/* Opsi 3: Factory Reset Total */}
              <div className="bg-red-50/60 p-5 rounded-2xl border border-red-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 bg-red-200 text-red-950 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block">
                    ⚡ Reset Total Pabrik
                  </span>
                  <h4 className="font-black text-red-900 text-sm">Full Factory Reset Server</h4>
                  <p className="text-[11px] text-red-800/80 leading-relaxed">
                    Mengembalikan seluruh isi website, database user, transaksi, saldo, dan katalog ke kondisi persis saat aplikasi pertama kali dibuat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalType("FULL_FACTORY_RESET");
                    setResetConfirmText("");
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert size={15} />
                  <span>Reset Total Website</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-xs animate-in slide-in-from-top-3 duration-200 ${
          toast.type === "success"
            ? "bg-slate-900 text-emerald-400 border-emerald-500/50"
            : "bg-red-900 text-red-100 border-red-500/50"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* MODAL: SETUJUI DEPOSIT MEMBER */}
      {approveDepositTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="p-2.5 bg-emerald-100 rounded-2xl">
                <Coins size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Konfirmasi Setujui Deposit</h4>
                <p className="text-xs text-slate-500">Saldo akun member akan bertambah secara otomatis</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs font-mono">
              <p className="text-slate-600"><strong>Member:</strong> {approveDepositTarget.senderName || approveDepositTarget.userName}</p>
              <p className="text-slate-600"><strong>Nominal Top Up:</strong> <strong className="text-emerald-700 text-sm">Rp {approveDepositTarget.amount?.toLocaleString("id-ID")}</strong></p>
              <p className="text-slate-600"><strong>Metode Pembayaran:</strong> {approveDepositTarget.paymentMethod}</p>
              <p className="text-slate-500 text-[11px] font-sans">ID: {approveDepositTarget.id}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan dana telah efektif masuk di M-Banking / QRIS platform sebelum menyetujui.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveDepositTarget(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={executeApproveDeposit}
                disabled={isSubmittingAction}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                {isSubmittingAction ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>✓ Ya, Setujui Deposit Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOLAK DEPOSIT MEMBER */}
      {rejectDepositTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-2xl">
                <XCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Penolakan Deposit Member</h4>
                <p className="text-xs text-slate-500">{rejectDepositTarget.senderName || rejectDepositTarget.userName}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">Masukkan Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={depositRejectReason}
                onChange={(e) => setDepositRejectReason(e.target.value)}
                placeholder="Contoh: Dana belum masuk / Bukti foto transfer tidak dapat terbaca."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectDepositTarget(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={executeRejectDeposit}
                disabled={isSubmittingAction}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                {isSubmittingAction ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                <span>Konfirmasi Tolak Deposit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOLAK PROYEK */}
      {rejectProjectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="font-black text-slate-900 text-base">Alasan Penolakan Proyek</h4>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">Detail Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={projectRejectReason}
                onChange={(e) => setProjectRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectProjectTarget(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={executeRejectProject}
                disabled={isSubmittingAction}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                Tolak Proyek
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS USER */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h4 className="font-black text-slate-900 text-base">Hapus Permanen User?</h4>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus member <strong>{deleteUserTarget.fullName}</strong> ({deleteUserTarget.email}) dari database server? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteUserTarget(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDeleteUser}
                disabled={isSubmittingAction}
                className="px-5 py-2.5 bg-red-600 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS PROYEK */}
      {deleteProjectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h4 className="font-black text-slate-900 text-base">Hapus Permanen Proyek?</h4>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus proyek <strong>"{deleteProjectTarget.title}"</strong> dari database server?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteProjectTarget(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDeleteProject}
                disabled={isSubmittingAction}
                className="px-5 py-2.5 bg-red-600 text-white font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORI DEPOSIT MEMBER UNTUK ADMIN */}
      {selectedMemberForDepositHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                  <Coins size={18} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Histori Deposit Member</h4>
                  <p className="text-[11px] text-slate-500">{selectedMemberForDepositHistory.fullName} ({selectedMemberForDepositHistory.email})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForDepositHistory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Saldo Deposit Saat Ini:</span>
              <span className="font-black font-mono text-amber-950 text-sm">
                Rp {(selectedMemberForDepositHistory.balance || 0).toLocaleString("id-ID")}
              </span>
            </div>

            {deposits.filter(d => d.userId === selectedMemberForDepositHistory.id).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                Member ini belum pernah melakukan pengajuan deposit.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                {deposits.filter(d => d.userId === selectedMemberForDepositHistory.id).map((dep) => (
                  <div key={dep.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-400">{dep.id} • {new Date(dep.createdAt).toLocaleDateString("id-ID")}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        dep.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : dep.status === "REJECTED"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                        {dep.status === "APPROVED" ? "✓ Disetujui" : dep.status === "REJECTED" ? "✕ Ditolak" : "⏳ Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono">
                      <span className="font-black text-slate-900 text-sm">Rp {dep.amount?.toLocaleString("id-ID")}</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded">{dep.paymentMethod}</span>
                    </div>

                    {dep.notes && <p className="text-[11px] text-slate-600">Catatan: {dep.notes}</p>}
                    {dep.rejectionReason && (
                      <p className="text-[11px] text-red-600 font-bold">Alasan Tolak: {dep.rejectionReason}</p>
                    )}

                    {dep.proofUrl && (
                      <button
                        onClick={() => setSelectedProofUrl(dep.proofUrl)}
                        className="text-[11px] font-bold text-amber-700 underline cursor-pointer hover:text-amber-600"
                      >
                        Lihat Bukti Transfer Foto ↗
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMemberForDepositHistory(null)}
                className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RUANG CHAT MEDIASI 3-ARAH ADMIN CENTRAL */}
      {activeChatInterest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 max-w-2xl w-full space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold rounded">
                    ID: {activeChatInterest.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeChatInterest.isContactRevealed ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}>
                    {activeChatInterest.isContactRevealed ? "🔓 Kontak Terbuka Resmi" : "🔒 Sensor Kontak Sistem Aktif"}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base">{activeChatInterest.listingTitle}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>Pengaju: <strong>{activeChatInterest.interestedBrokerName}</strong> ({activeChatInterest.interestedBrokerPhone})</span>
                  <span>|</span>
                  <span>Pemilik: <strong>{activeChatInterest.ownerBrokerName}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInterestItem(activeChatInterest);
                      setEditOwnerName(activeChatInterest.ownerBrokerName || "");
                      setEditInterestedName(activeChatInterest.interestedBrokerName || "");
                    }}
                    className="text-[10px] text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded font-bold cursor-pointer border border-amber-300"
                  >
                    ✏️ Edit Nama Pihak
                  </button>
                </p>
              </div>

              <button
                onClick={() => setActiveChatInterest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Admin Controls Toolbar */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <p className="text-[10.5px] text-slate-300 font-bold">Akses Kontak Resmi Broker:</p>
                <p className="text-[10px] text-slate-400">
                  {activeChatInterest.isContactRevealed 
                    ? "Kedua belah pihak dapat melihat nomor HP resmi setelah verifikasi kualifikasi."
                    : "Seluruh nomor HP, link WA, dan email otomatis disensor sistem."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleRevealContact(activeChatInterest.id, !!activeChatInterest.isContactRevealed)}
                className={`px-3.5 py-2 font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  activeChatInterest.isContactRevealed
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {activeChatInterest.isContactRevealed ? <Lock size={14} /> : <Unlock size={14} />}
                <span>{activeChatInterest.isContactRevealed ? "🔒 Kunci Kembali Kontak" : "🔓 Buka Akses Kontak Resmi (Deal Verifikasi)"}</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[260px] max-h-[360px]">
              {(!activeChatInterest.chatMessages || activeChatInterest.chatMessages.length === 0) ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada pesan mediasi. Mulai kirim pesan sebagai Admin di bawah.
                </div>
              ) : (
                activeChatInterest.chatMessages.map((msg: any, idx: number) => {
                  const isAdmin = msg.senderRole === "ADMIN";
                  const isSystem = msg.senderRole === "SYSTEM";
                  const isRequester = msg.senderRole === "REQUESTER";

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
                      className={`flex flex-col space-y-1 ${isAdmin ? "items-end" : "items-start"}`}
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
                          isAdmin
                            ? "bg-slate-900 text-amber-400 border border-amber-500/30 rounded-tr-xs"
                            : isRequester
                            ? "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                            : "bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-tl-xs"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Admin Input Form */}
            <form onSubmit={handleSendAdminChatMessage} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                required
                placeholder="Ketik arahan atau pesan verifikasi Admin Central..."
                value={adminChatMessage}
                onChange={(e) => setAdminChatMessage(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 shadow"
              >
                <Send size={13} />
                <span>Kirim Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW BUKTI TRANSFER FOTO */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 max-w-lg w-full space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-slate-900 text-sm">Pratinjau Bukti Transfer Deposit</h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[70vh]">
              <img src={selectedProofUrl} alt="Bukti Transfer" className="max-w-full max-h-[65vh] object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO KTP / IDENTITAS MEMBER */}
      {previewKtpUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-base">Dokumen Identitas KTP / NIK</h4>
                <p className="text-xs text-slate-500">{previewKtpUser.fullName} ({previewKtpUser.email})</p>
              </div>
              <button
                onClick={() => setPreviewKtpUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor NIK:</span>
                <span className="font-mono font-bold text-slate-900">{previewKtpUser.ktpNumber || "Belum diisi"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perusahaan / PT:</span>
                <span className="font-bold text-slate-900">{previewKtpUser.organization || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status KYC:</span>
                <span className="font-bold text-amber-700">{previewKtpUser.kycStatus || "PENDING"}</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center max-h-[60vh] p-2">
              {previewKtpUser.ktpImageUrl ? (
                <img
                  src={previewKtpUser.ktpImageUrl}
                  alt={`KTP ${previewKtpUser.fullName}`}
                  className="max-w-full max-h-[55vh] object-contain rounded-lg"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Foto KTP belum diunggah oleh member ini.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleUpdateKYC(previewKtpUser.id, "VERIFIED");
                    setPreviewKtpUser(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  Setujui KYC
                </button>
                <button
                  onClick={() => {
                    handleUpdateKYC(previewKtpUser.id, "REJECTED");
                    setPreviewKtpUser(null);
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  Tolak KYC
                </button>
              </div>
              <button
                onClick={() => setPreviewKtpUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UBAH NAMA PIHAK MEDIASI (ADMIN) */}
      {editingInterestItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Ubah Nama Pihak Mediasi (Admin)</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Nama / Username Pemilik Proyek (Owner):</label>
                <input
                  type="text"
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  placeholder="Contoh: Hendra_A1 / Broker_Hendra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Username Pengaju Minat (Requester):</label>
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

      {/* MODAL: POSTING PROYEK BARU OLEH ADMIN */}
      {showAdminPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-2xl w-full my-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Posting Proyek Baru (Admin)</h3>
                  <p className="text-xs text-slate-500">Listing dipublikasikan dengan status Auto-Approved & Badge A1 Verified.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPostModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminSubmitProject} className="space-y-4 text-xs">
              {/* Tipe Proyek: Supply vs Demand */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Pilih Tipe Listing Proyek:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminProjectType("supply")}
                    className={`p-3 rounded-xl border text-center font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      adminProjectType === "supply"
                        ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>📦 Penawaran Barang (Supply)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminProjectType("demand")}
                    className={`p-3 rounded-xl border text-center font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      adminProjectType === "demand"
                        ? "bg-slate-900 text-amber-400 border-slate-950 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>🎯 Kebutuhan Buyer (Demand)</span>
                  </button>
                </div>
              </div>

              {/* Judul Proyek */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Judul Proyek / Ringkasan Listing <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder={adminProjectType === "supply" ? "Contoh: Dijual Lahan Industri 10 Ha Karawang Timur Akses Kontainer" : "Contoh: Dicari Lahan Komersial Min. 3.000m² Pinggir Jalan Utama Surabaya"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                />
              </div>

              {/* Kategori & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Kategori Proyek:</label>
                  <select
                    value={adminCategory}
                    onChange={(e) => setAdminCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Lokasi / Kota:</label>
                  <input
                    type="text"
                    required
                    value={adminLocation}
                    onChange={(e) => setAdminLocation(e.target.value)}
                    placeholder="Contoh: Jakarta Barat, DKI Jakarta"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Harga atau Rentang Budget */}
              {adminProjectType === "supply" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Nilai Harga Penawaran (Rp):</label>
                    <RupiahInput
                      value={adminPrice}
                      onChange={(numVal, strVal) => setAdminPrice(strVal || (numVal ? String(numVal) : ""))}
                      placeholder="Misal: 200jt, 15m, atau 200.000.000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Sistem Pembayaran:</label>
                    <input
                      type="text"
                      value={adminPaymentSystem}
                      onChange={(e) => setAdminPaymentSystem(e.target.value)}
                      placeholder="Contoh: Cash Keras / Notaris"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Budget Minimal (Rp):</label>
                    <RupiahInput
                      value={adminBudgetMin}
                      onChange={(numVal, strVal) => setAdminBudgetMin(strVal || (numVal ? String(numVal) : ""))}
                      placeholder="Misal: 5m, 100jt, dsb."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Budget Maksimal (Rp):</label>
                    <RupiahInput
                      value={adminBudgetMax}
                      onChange={(numVal, strVal) => setAdminBudgetMax(strVal || (numVal ? String(numVal) : ""))}
                      placeholder="Misal: 20m, 500jt, dsb."
                    />
                  </div>
                </div>
              )}

              {/* Deskripsi & Spesifikasi */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  {adminProjectType === "supply" ? "Deskripsi & Spesifikasi Lahan / Properti" : "Kriteria & Syarat Kebutuhan Buyer"} <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminSpecifications}
                  onChange={(e) => setAdminSpecifications(e.target.value)}
                  placeholder={adminProjectType === "supply" ? "Jelaskan luas tanah, legalitas SHM/HGB, lebar muka, zonasi tata ruang, kontur, akses jalan, dsb." : "Jelaskan kriteria lahan yang dicari investor, legalitas yang diminta, akses kontainer, radius lokasi, dll."}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl font-medium text-slate-900 resize-y"
                />
              </div>

              {/* Foto Proyek (Khusus Supply atau Opsional Demand) */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 flex items-center justify-between">
                  <span>Foto Proyek / Banner Listing:</span>
                  {adminImageUrl && (
                    <button
                      type="button"
                      onClick={() => setAdminImageUrl("")}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </label>

                {adminImageUrl ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-300 shadow-xs">
                    <img src={adminImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <label className="flex-1 w-full p-3 bg-white border border-dashed border-amber-400 hover:border-amber-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-amber-900 font-bold">
                      <Upload size={16} className="text-amber-600" />
                      <span>Upload Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdminImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-slate-500">Atau masukkan Link URL Foto langsung:</label>
                  <input
                    type="url"
                    value={adminImageUrl}
                    onChange={(e) => setAdminImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-[11px] text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdminPostModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdminProject}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Sparkles size={15} />
                  <span>{isSubmittingAdminProject ? "Mempublikasikan..." : "🚀 Publikasikan Proyek Sebagai Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI RESET WEBSITE */}
      {resetModalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert size={22} />
                <h3 className="font-black text-slate-900 text-base">Konfirmasi Reset Website</h3>
              </div>
              <button
                onClick={() => setResetModalType(null)}
                className="p-1 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-900 space-y-1">
                <p className="font-black">⚠️ Peringatan Tindakan Penataan Server:</p>
                <p className="text-[11px] leading-relaxed">
                  {resetModalType === "FULL_FACTORY_RESET" && "Anda akan melakukan Reset Total Pabrik. Seluruh transaksi, listing, dan member uji coba akan dikembalikan ke kondisi default."}
                  {resetModalType === "TRANSACTIONS_ONLY" && "Anda akan mengosongkan seluruh histori deposit & chat minat mediasi."}
                  {resetModalType === "LISTINGS_ONLY" && "Anda akan mereset daftar katalog proyek ke data standar pabrik."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Untuk melanjutkan, ketik kata <span className="text-red-600 font-black">RESET</span> di bawah ini:
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Ketik RESET"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:border-red-500 focus:bg-white rounded-xl font-black text-slate-900 uppercase tracking-widest text-center"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalType(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetWebsite}
                disabled={isExecutingReset || resetConfirmText.trim().toUpperCase() !== "RESET"}
                className={`px-5 py-2.5 font-black rounded-xl text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                  resetConfirmText.trim().toUpperCase() === "RESET"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isExecutingReset ? "Mereset Website..." : "⚡ Eksekusi Reset Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
