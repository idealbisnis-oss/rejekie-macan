import { useState, useEffect } from "react";
import { 
  Building2, Users, LogIn, ShieldAlert, Database, RefreshCw, 
  LogOut, Globe, Send, User, Sparkles
} from "lucide-react";
import { UserSession, UserRole, KYCStatus } from "./types";
import HalamanDepan from "./components/HalamanDepan";
import HalamanAuth from "./components/HalamanAuth";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardMember from "./components/DashboardMember";
import { 
  apiGetProjects, apiCreateProject, apiDeleteProject, 
  apiSubmitInterest, apiGetInterests, apiLogin, apiRegister, 
  apiGetAdminStats, fetchSystemInfo 
} from "./services/api";

export default function App() {
  // Navigation tabs requested: "depan" | "auth" | "member" | "admin"
  const [activeTab, setActiveTab] = useState<"depan" | "auth" | "member" | "admin">("depan");

  // Logged-in session state (null if guest)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Server Database States
  const [supplyListings, setSupplyListings] = useState<any[]>([]);
  const [demandListings, setDemandListings] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all data from Server API Database
  const refreshServerData = async () => {
    setIsLoading(true);
    try {
      const [projRes, intRes, statsRes] = await Promise.all([
        apiGetProjects(),
        apiGetInterests(),
        apiGetAdminStats()
      ]);

      if (projRes.success) {
        setSupplyListings(projRes.supplyListings || []);
        setDemandListings(projRes.demandListings || []);
      }
      if (intRes.success) {
        setInterests(intRes.interests || []);
      }
      if (statsRes.success) {
        setAdminStats(statsRes);
      }
    } catch (err) {
      console.error("Error fetching data from server database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshServerData();
  }, []);

  // Handlers for Auth
  const handleLoginSubmit = async (emailOrPhone: string, pass: string) => {
    return await apiLogin(emailOrPhone, pass);
  };

  const handleRegisterSubmit = async (userData: any) => {
    return await apiRegister(userData);
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    if (user.role === UserRole.ADMIN) {
      setActiveTab("admin");
    } else {
      setActiveTab("member");
    }
    refreshServerData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("depan");
  };

  // Handlers for Projects & Interests
  const handleCreateProject = async (projectData: any) => {
    const res = await apiCreateProject(projectData);
    if (res.success) {
      refreshServerData();
      return true;
    }
    return false;
  };

  const handleDeleteProject = async (projectId: string) => {
    const res = await apiDeleteProject(projectId);
    if (res.success) {
      refreshServerData();
      return true;
    }
    return false;
  };

  const handleSubmitInterest = async (projectId: string, data: any) => {
    const res = await apiSubmitInterest(projectId, data);
    if (res.success) {
      refreshServerData();
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col justify-between">
      <div>
        {/* PLATFORM TOP HEADER */}
        <header className="sticky top-0 bg-slate-900 text-white z-40 border-b border-amber-500/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18">
              {/* Logo & Tagline */}
              <div 
                onClick={() => setActiveTab("depan")}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg border border-amber-400/20 group-hover:scale-105 transition-transform">
                  <span className="text-xl font-black text-slate-950 font-mono tracking-tighter">RM</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black tracking-tight text-white font-mono uppercase">REJEKI MACAN</h1>
                    <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase rounded px-1.5 py-0.5 tracking-wider">
                      FULLSTACK DEPLOY
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 tracking-wide font-medium">Mediator & Broker Matchmaking Platform</p>
                </div>
              </div>

              {/* Database Connection Status & User Profile Top Bar */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-mono text-[11px] font-bold">Database Server: Active</span>
                </div>

                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab(currentUser.role === UserRole.ADMIN ? "admin" : "member")}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl p-1.5 px-3 transition-colors cursor-pointer"
                    >
                      <div className="text-right text-xs">
                        <p className="font-bold text-white leading-tight">{currentUser.fullName}</p>
                        <p className="text-[10px] text-amber-400 uppercase font-mono">{currentUser.role === UserRole.ADMIN ? "Dashboard Admin" : "Dashboard Member"}</p>
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      title="Keluar / Logout"
                      className="p-2 bg-slate-800 hover:bg-red-600/80 border border-slate-700 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab("auth")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn size={14} />
                    <span>Login / Daftar Member</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY LAYOUT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* VIEW 1: HALAMAN DEPAN */}
          {activeTab === "depan" && (
            <HalamanDepan
              supplyListings={supplyListings}
              demandListings={demandListings}
              currentUser={currentUser}
              onNavigateAuth={() => setActiveTab("auth")}
              onNavigateMemberDashboard={() => setActiveTab("member")}
              onSubmitInterest={handleSubmitInterest}
              onRefreshData={refreshServerData}
              isLoading={isLoading}
              systemStats={adminStats}
            />
          )}

          {/* VIEW 2: HALAMAN LOGIN & DAFTAR MEMBER BARU */}
          {activeTab === "auth" && (
            <HalamanAuth
              onLoginSubmit={handleLoginSubmit}
              onRegisterSubmit={handleRegisterSubmit}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {/* VIEW 3: DASHBOARD MEMBER */}
          {activeTab === "member" && (
            currentUser ? (
              <DashboardMember
                currentUser={currentUser}
                supplyListings={supplyListings}
                demandListings={demandListings}
                interests={interests}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onRefreshData={refreshServerData}
              />
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xl max-w-lg mx-auto space-y-4">
                <LogIn size={48} className="mx-auto text-amber-500" />
                <h3 className="text-xl font-black text-slate-900">Akses Dashboard Member</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Silakan login atau daftar akun member baru untuk mengakses area dashboard member dan memposting proyek Anda.
                </p>
                <button
                  onClick={() => setActiveTab("auth")}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Ke Halaman Login / Daftar Member
                </button>
              </div>
            )
          )}

          {/* VIEW 4: DASHBOARD ADMIN */}
          {activeTab === "admin" && (
            <DashboardAdmin
              supplyListings={supplyListings}
              demandListings={demandListings}
              onRefreshData={refreshServerData}
            />
          )}
        </main>
      </div>

      {/* PLATFORM FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-white uppercase tracking-wider font-mono">REJEKI MACAN PLATFORM</p>
            <p className="text-[11px] text-slate-500">Mediator & Broker Matchmaking Platform — Database Terpusat Server.</p>
          </div>
          <div className="text-[11px] text-slate-500 text-center md:text-right">
            © 2026 Rejeki Macan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
