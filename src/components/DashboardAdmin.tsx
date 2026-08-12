import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, XCircle, ShieldAlert, FileText, Database, 
  Trash2, RefreshCw, Send, Check, AlertTriangle, Layers, Building2, UserCheck, Clock, CheckCircle,
  Coins, Eye, QrCode, Building, ExternalLink
} from "lucide-react";
import { 
  apiGetUsers, apiUpdateUserKYC, apiDeleteUser, apiGetAdminStats, 
  apiDeleteProject, apiGetInterests, apiUpdateInterest, apiModerateProject,
  apiGetDeposits, apiApproveDeposit, apiRejectDeposit
} from "../services/api";

interface DashboardAdminProps {
  supplyListings: any[];
  demandListings: any[];
  onRefreshData: () => void;
}

export default function DashboardAdmin({ supplyListings, demandListings, onRefreshData }: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState<"DEPOSITS" | "USERS" | "PROJECTS" | "INTERESTS" | "DATABASE">("DEPOSITS");
  const [projectFilter, setProjectFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [depositFilter, setDepositFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const [users, setUsers] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

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

  // Deposit Approval Handlers
  const handleApproveDeposit = async (id: string, amount: number, userName: string) => {
    if (!confirm(`Setujui deposit sebesar Rp ${amount.toLocaleString("id-ID")} untuk ${userName}? Saldo user akan otomatis bertambah.`)) {
      return;
    }
    const res = await apiApproveDeposit(id);
    if (res.success) {
      alert(res.message || "Deposit berhasil disetujui!");
      loadData();
      onRefreshData();
    } else {
      alert(res.message || "Gagal menyetujui deposit.");
    }
  };

  const handleRejectDeposit = async (id: string, userName: string) => {
    const reason = prompt(`Masukkan alasan penolakan deposit untuk ${userName}:`, "Bukti transfer tidak valid atau belum masuk.");
    if (reason === null) return;

    const res = await apiRejectDeposit(id, reason);
    if (res.success) {
      alert(res.message || "Deposit berhasil ditolak.");
      loadData();
      onRefreshData();
    } else {
      alert(res.message || "Gagal menolak deposit.");
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

  const handleModerate = async (projectId: string, moderationStatus: "APPROVED" | "REJECTED") => {
    let rejectionReason = "";
    if (moderationStatus === "REJECTED") {
      rejectionReason = prompt("Masukkan alasan penolakan proyek ini:") || "Tidak memenuhi kriteria postingan.";
    }

    const res = await apiModerateProject(projectId, moderationStatus, rejectionReason);
    if (res.success) {
      alert(`Status moderasi proyek berhasil diubah menjadi: ${moderationStatus}`);
      onRefreshData();
      loadData();
    } else {
      alert(res.message || "Gagal memproses moderasi.");
    }
  };

  // Handle KYC Update
  const handleUpdateKYC = async (userId: string, status: string) => {
    const res = await apiUpdateUserKYC(userId, { kycStatus: status });
    if (res.success) {
      alert(`Status KYC user berhasil diubah menjadi: ${status}`);
      loadData();
    } else {
      alert("Gagal memperbarui status KYC.");
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini dari database server?")) return;
    const res = await apiDeleteUser(userId);
    if (res.success) {
      alert("User berhasil dihapus.");
      loadData();
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini dari database server?")) return;
    const res = await apiDeleteProject(projectId);
    if (res.success) {
      alert("Proyek berhasil dihapus.");
      onRefreshData();
      loadData();
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

        <button
          onClick={() => {
            loadData();
            onRefreshData();
          }}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Sync Admin Database</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Deposit Pending</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {deposits.filter(d => d.status === "PENDING").length} Permintaan
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total: {deposits.length} Deposit</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Total Proyek Aktif</span>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {(stats?.totalSupplyProjects || supplyListings.length) + (stats?.totalDemandProjects || demandListings.length)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Suplai & Demand Listing</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Member Terdaftar</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats?.totalMembers || users.length} Member</p>
          <p className="text-[10px] text-slate-500 mt-1">Pending KYC: {stats?.pendingKYC || 0}</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm text-white flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-black font-mono">DATABASE ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Deposit Auto-Credit Active</p>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("DEPOSITS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DEPOSITS" ? "bg-amber-500 text-slate-950 font-black shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Coins size={14} />
          <span>Konfirmasi Deposit ({deposits.filter(d => d.status === "PENDING").length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "USERS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={14} />
          <span>Kelola Member & KYC ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "PROJECTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={14} />
          <span>Kelola Proyek ({supplyListings.length + demandListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INTERESTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "INTERESTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Send size={14} />
          <span>Matchmaking Minat ({interests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("DATABASE")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DATABASE" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Database size={14} />
          <span>Status Database Server</span>
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
                              onClick={() => handleApproveDeposit(dep.id, dep.amount, dep.senderName || userDetail?.fullName || "Member")}
                              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 size={16} />
                              <span>Setujui Deposit</span>
                            </button>

                            <button
                              onClick={() => handleRejectDeposit(dep.id, dep.senderName || userDetail?.fullName || "Member")}
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
                  <th className="p-3">Status KYC</th>
                  <th className="p-3 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
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
                      <div>{u.ktpNumber || "NIK Belum Diisi"}</div>
                      <div className="text-slate-500 font-sans text-[10.5px]">{u.organization || "-"}</div>
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
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded text-[10.5px] cursor-pointer ml-1"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PROJECTS & MODERATION */}
      {activeTab === "PROJECTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-5 p-4 sm:p-6">
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
                          <span>Broker: {s.brokerName}</span>
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
                              onClick={() => handleModerate(s.id, "APPROVED")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 size={13} /> Setujui
                            </button>
                          )}
                          {modStatus !== "REJECTED" && (
                            <button
                              onClick={() => handleModerate(s.id, "REJECTED")}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteProject(s.id)}
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
                          <span>Broker: {d.brokerName}</span>
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
                              onClick={() => handleModerate(d.id, "APPROVED")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle2 size={13} /> Setujui
                            </button>
                          )}
                          {modStatus !== "REJECTED" && (
                            <button
                              onClick={() => handleModerate(d.id, "REJECTED")}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteProject(d.id)}
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
          <div>
            <h3 className="text-base font-black text-slate-900">Pengajuan Minat & Permintaan Matchmaking</h3>
            <p className="text-xs text-slate-500">
              Verifikasi pesan kesiapan broker sebelum menyambungkan kontak pemilik proyek.
            </p>
          </div>

          <div className="space-y-3">
            {interests.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">ID MINAT: {item.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.listingTitle}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase self-start sm:self-auto ${
                    item.status === "VERIFIED_BY_ADMIN"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Pengaju Minat:</span>
                    <p className="font-bold text-slate-800">{item.interestedBrokerName} ({item.interestedBrokerPhone})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Pemilik Proyek:</span>
                    <p className="font-bold text-slate-800">{item.ownerBrokerName}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  <strong>Pesan Kualifikasi:</strong> "{item.userMessage}"
                </div>

                {item.adminNotes && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <strong>Catatan Admin:</strong> {item.adminNotes}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateInterestStatus(item.id, "VERIFIED_BY_ADMIN")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    ✓ Setujui & Teruskan
                  </button>
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
    </div>
  );
}
