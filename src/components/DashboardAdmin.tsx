import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, XCircle, ShieldAlert, FileText, Database, 
  Trash2, RefreshCw, Send, Check, AlertTriangle, Layers, Building2, UserCheck
} from "lucide-react";
import { apiGetUsers, apiUpdateUserKYC, apiDeleteUser, apiGetAdminStats, apiDeleteProject, apiGetInterests, apiUpdateInterest } from "../services/api";

interface DashboardAdminProps {
  supplyListings: any[];
  demandListings: any[];
  onRefreshData: () => void;
}

export default function DashboardAdmin({ supplyListings, demandListings, onRefreshData }: DashboardAdminProps) {
  const [activeTab, setActiveTab] = useState<"USERS" | "PROJECTS" | "INTERESTS" | "DATABASE">("USERS");

  const [users, setUsers] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load Admin Data from Server API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uRes, iRes, sRes] = await Promise.all([
        apiGetUsers(),
        apiGetInterests(),
        apiGetAdminStats()
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (iRes.success) setInterests(iRes.interests);
      if (sRes.success) setStats(sRes);
    } catch (err) {
      console.error("Failed loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Total Proyek Suplai</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">{stats?.totalSupplyProjects || supplyListings.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Listing Suplai Barang</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Total Pencarian Buyer</span>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats?.totalDemandProjects || demandListings.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Listing Demand Buyer</p>
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
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Single Server Storage</p>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "USERS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={14} />
          <span>Kelola Member & Verifikasi KYC ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "PROJECTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={14} />
          <span>Kelola Proyek Database ({supplyListings.length + demandListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INTERESTS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "INTERESTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Send size={14} />
          <span>Persetujuan Minat Matchmaking ({interests.length})</span>
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

      {/* TAB CONTENT 2: PROJECTS */}
      {activeTab === "PROJECTS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Seluruh Proyek Terdaftar di Server Database</h3>
            <p className="text-xs text-slate-500">Hapus atau pantau listing penawaran barang dan kebutuhan buyer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supply Listings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                📦 Penawaran Barang ({supplyListings.length})
              </h4>
              {supplyListings.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-slate-900">{s.title}</h5>
                    <button
                      onClick={() => handleDeleteProject(s.id)}
                      className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">{s.specifications}</p>
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                    <span>Rp {s.price?.toLocaleString("id-ID")}</span>
                    <span>Broker: {s.brokerName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Demand Listings */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                💼 Pencarian Buyer ({demandListings.length})
              </h4>
              {demandListings.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-slate-900">{d.title}</h5>
                    <button
                      onClick={() => handleDeleteProject(d.id)}
                      className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">{d.criteria}</p>
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                    <span>Budget Max: Rp {d.budgetMax?.toLocaleString("id-ID")}</span>
                    <span>Broker: {d.brokerName}</span>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
