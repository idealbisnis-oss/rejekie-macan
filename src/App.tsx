import { useState } from "react";
import { 
  Building2, Users, GitMerge, FileCode2, Landmark, CheckCircle, 
  HelpCircle, AlertCircle, ShieldAlert, Cpu, HeartHandshake, PhoneCall,
  RefreshCw
} from "lucide-react";
import { SupplyListing, DemandListing, UserSession, UserRole, KYCStatus, ListingStatus, ListingInterest, InterestStatus } from "./types";
import { INITIAL_SUPPLY_LISTINGS, INITIAL_DEMAND_LISTINGS, DEMO_USERS } from "./data/mockData";
import DocumentationView from "./components/DocumentationView";
import RegistrationKYC from "./components/RegistrationKYC";
import Dashboard from "./components/Dashboard";
import ListingMatchmaker from "./components/ListingMatchmaker";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "matchmaker" | "kyc" | "spec">("dashboard");

  // Simulated View Mode: demo (uji coba prototype) vs real_guest (pengunjung umum) vs real_member (anggota terdaftar)
  const [productionViewMode, setProductionViewMode] = useState<"demo" | "real_guest" | "real_member">("demo");

  // Simulated Database states
  const [currentUser, setCurrentUser] = useState<UserSession>({ ...DEMO_USERS[0] });

  const getEffectiveUser = (): UserSession => {
    if (productionViewMode === "real_guest") {
      return {
        id: "guest-visitor",
        fullName: "Pengunjung Umum",
        email: "guest@visitor.com",
        role: UserRole.MAKELAR_BARANG,
        kycStatus: KYCStatus.UNSUBMITTED,
        balance: 0
      };
    }
    return currentUser;
  };

  const effectiveUser = getEffectiveUser();

  const [supplyListings, setSupplyListings] = useState<SupplyListing[]>(INITIAL_SUPPLY_LISTINGS);
  const [demandListings, setDemandListings] = useState<DemandListing[]>(INITIAL_DEMAND_LISTINGS);
  const [lastWebhookPayload, setLastWebhookPayload] = useState<any | null>(null);

  const [interests, setInterests] = useState<ListingInterest[]>([
    {
      id: "int-501",
      listingId: "sup-101",
      listingTitle: "Tanah Kavling Industri 5 Hektar Serang",
      listingType: "supply",
      ownerBrokerId: "user-2",
      ownerBrokerName: "Hendra Wijaya",
      interestedBrokerId: "user-3",
      interestedBrokerName: "Amiruddin",
      interestedBrokerPhone: "+628529988776",
      createdAt: "2026-06-15T14:20:00Z",
      status: "PENDING_VERIFICATION",
      userMessage: "Saya Amiruddin, tertarik menawarkan buyer untuk lahan 5 Hektar Serang ini. Buyer kami PT Holcim bermaksud mendirikan batching plant. Surat LOI sudah siap diajukan."
    },
    {
      id: "int-502",
      listingId: "dem-202",
      listingTitle: "Kebutuhan Unit Excavator 20 Ton Seken Komatsu/Caterpillar",
      listingType: "demand",
      ownerBrokerId: "user-3",
      ownerBrokerName: "Amiruddin",
      interestedBrokerId: "user-2",
      interestedBrokerName: "Hendra Wijaya",
      interestedBrokerPhone: "+628123456789",
      createdAt: "2026-06-16T15:10:00Z",
      status: "RELAYED_TO_OWNER",
      userMessage: "Kami punya Caterpillar 320 GC 2022 rawatan bagus HM 3400 di Balikpapan. Pas sekali dengan budget dan kriteria Anda.",
      adminNotes: "Telah diverifikasi Admin via WA Call. Klien terbukti memiliki barang valid, informasi aman diteruskan."
    }
  ]);

  // Webhook trigger simulation
  const triggern8nWebhookSimulation = (payload: any) => {
    setLastWebhookPayload(payload);
  };

  // Add a new Supply Listing
  const handleAddSupply = (newSupply: Omit<SupplyListing, "id" | "brokerId" | "brokerName" | "brokerPhone" | "createdAt" | "expiresAt" | "viewsCount">) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const listing: SupplyListing = {
      ...newSupply,
      id: `sup-${Date.now().toString().slice(-4)}`,
      brokerId: currentUser.id,
      brokerName: currentUser.fullName,
      brokerPhone: currentUser.phoneNumber,
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      viewsCount: 0
    };

    setSupplyListings((prev) => [listing, ...prev]);

    // Dispatch Webhook
    triggern8nWebhookSimulation({
      event: "listing.created",
      type: "SUPPLY",
      timestamp: listing.createdAt,
      listing_id: listing.id,
      title: listing.title,
      category: listing.category,
      price: listing.price,
      location: listing.location,
      broker_name: listing.brokerName,
      broker_phone: "REDACTED_CONFIDENTIAL",
      expires_at: listing.expiresAt,
      specifications: listing.specifications
    });
  };

  // Add a new Demand Listing
  const handleAddDemand = (newDemand: Omit<DemandListing, "id" | "brokerId" | "brokerName" | "brokerPhone" | "createdAt" | "expiresAt">) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const listing: DemandListing = {
      ...newDemand,
      id: `dem-${Date.now().toString().slice(-4)}`,
      brokerId: currentUser.id,
      brokerName: currentUser.fullName,
      brokerPhone: currentUser.phoneNumber,
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: newDemand.status || "VERIFIED"
    };

    setDemandListings((prev) => [listing, ...prev]);

    // Dispatch Webhook
    triggern8nWebhookSimulation({
      event: "listing.created",
      type: "DEMAND",
      timestamp: listing.createdAt,
      listing_id: listing.id,
      title: listing.title,
      category: listing.category,
      budget_min: listing.budgetMin,
      budget_max: listing.budgetMax,
      payment_system: listing.paymentSystem,
      broker_name: listing.brokerName,
      broker_phone: "REDACTED_CONFIDENTIAL",
      expires_at: listing.expiresAt,
      criteria: listing.criteria
    });
  };

  // Renew a listing for 14 more days
  const handleRenewListing = (id: string, type: "supply" | "demand") => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (type === "supply") {
      setSupplyListings((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, createdAt: now.toISOString(), expiresAt: expiry.toISOString() }
            : item
        )
      );
      const updated = supplyListings.find((item) => item.id === id);
      if (updated) {
        triggern8nWebhookSimulation({
          event: "listing.renewed",
          type: "SUPPLY",
          timestamp: now.toISOString(),
          listing_id: id,
          title: updated.title,
          new_expiry: expiry.toISOString()
        });
      }
    } else {
      setDemandListings((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, createdAt: now.toISOString(), expiresAt: expiry.toISOString() }
            : item
        )
      );
      const updated = demandListings.find((item) => item.id === id);
      if (updated) {
        triggern8nWebhookSimulation({
          event: "listing.renewed",
          type: "DEMAND",
          timestamp: now.toISOString(),
          listing_id: id,
          title: updated.title,
          new_expiry: expiry.toISOString()
        });
      }
    }
  };

  // Create an interest request (peminat) going through admin
  const handleCreateInterest = (interestData: Omit<ListingInterest, "id" | "createdAt" | "status">) => {
    const newInterest: ListingInterest = {
      ...interestData,
      id: `int-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: "PENDING_VERIFICATION"
    };

    setInterests((prev) => [newInterest, ...prev]);

    triggern8nWebhookSimulation({
      event: "interest.created",
      timestamp: newInterest.createdAt,
      interest_id: newInterest.id,
      listing_id: newInterest.listingId,
      listing_title: newInterest.listingTitle,
      interested_broker_name: newInterest.interestedBrokerName,
      owner_broker_name: newInterest.ownerBrokerName,
      status: "PENDING_VERIFICATION",
      message: newInterest.userMessage
    });
  };

  // Admin verifies and relays the interest to the owner
  const handleUpdateInterestStatus = (id: string, status: InterestStatus, adminNotes?: string) => {
    setInterests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, adminNotes } : item))
    );

    const updated = interests.find((item) => item.id === id);
    if (updated) {
      triggern8nWebhookSimulation({
        event: "interest.status_updated",
        timestamp: new Date().toISOString(),
        interest_id: id,
        listing_title: updated.listingTitle,
        interested_broker_name: updated.interestedBrokerName,
        owner_broker_name: updated.ownerBrokerName,
        new_status: status,
        admin_notes: adminNotes || ""
      });
    }
  };

  // Update Status
  const handleUpdateSupplyStatus = (id: string, status: ListingStatus) => {
    setSupplyListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    const updated = supplyListings.find(item => item.id === id);
    if (updated) {
      triggern8nWebhookSimulation({
        event: "listing.status_updated",
        type: "SUPPLY",
        timestamp: new Date().toISOString(),
        listing_id: id,
        new_status: status,
        title: updated.title,
        broker_name: updated.brokerName
      });
    }
  };

  const handleUpdateDemandStatus = (id: string, status: ListingStatus) => {
    setDemandListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    const updated = demandListings.find(item => item.id === id);
    if (updated) {
      triggern8nWebhookSimulation({
        event: "listing.status_updated",
        type: "DEMAND",
        timestamp: new Date().toISOString(),
        listing_id: id,
        new_status: status,
        title: updated.title,
        broker_name: updated.brokerName
      });
    }
  };

  // Handle KYC process from form
  const handleUpdateKYC = (status: KYCStatus, data?: Partial<UserSession>) => {
    const updated = {
      ...currentUser,
      kycStatus: status,
      ...data
    };
    setCurrentUser(updated);

    triggern8nWebhookSimulation({
      event: "user.kyc_status_changed",
      timestamp: new Date().toISOString(),
      user_id: currentUser.id,
      full_name: updated.fullName,
      new_kyc_status: status,
      role: updated.role,
      nik_provided: updated.ktpNumber ? "YES_ENCRYPTED" : "NO"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" id="rejeki-macan-root">
      {/* Platform Header */}
      <header className="sticky top-0 bg-slate-900 text-white z-40 border-b border-amber-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg border border-amber-400/20 select-none">
                <span className="text-xl font-black text-slate-950 font-mono tracking-tighter">RM</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white font-mono uppercase">REJEKI MACAN</h1>
                  <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold uppercase rounded px-1.5 py-0.5 tracking-wider">v1.1</span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wide font-medium">Mediator & Broker Matchmaking Platform</p>
              </div>
            </div>

            {/* Simulated Session Top display with Dynamic Role Switching capabilities */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-right flex items-center gap-2.5">
                <div className="text-xs">
                  <p className="font-bold text-white leading-none">{currentUser.fullName}</p>
                  <p className="text-[10px] text-amber-500/95 font-medium mt-1 uppercase tracking-wide">
                    {currentUser.role === UserRole.MAKELAR_BARANG ? "Broker Barang" : "Broker Buyer"}
                  </p>
                </div>
                {currentUser.role !== UserRole.ADMIN && (
                  <button 
                    onClick={() => {
                      const nextRole = currentUser.role === UserRole.MAKELAR_BARANG ? UserRole.MAKELAR_BUYER : UserRole.MAKELAR_BARANG;
                      setCurrentUser(prev => ({ ...prev, role: nextRole }));
                      triggern8nWebhookSimulation({
                        event: "user.role_switched",
                        timestamp: new Date().toISOString(),
                        user_id: currentUser.id,
                        fullName: currentUser.fullName,
                        previous_role: currentUser.role,
                        new_role: nextRole
                      });
                    }}
                    title="Beralih Peran (Barang <-> Buyer)"
                    className="p-1 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-transparent hover:border-white/10"
                  >
                    <RefreshCw size={10} className="shrink-0" />
                    <span>Ganti Peran</span>
                  </button>
                )}
                <div className="relative">
                  <span className={`w-3.5 h-3.5 rounded-full border border-slate-900 block ${
                    currentUser.kycStatus === KYCStatus.VERIFIED ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                  }`}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* PERSPECTIVE SELECTOR BANNER */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                PILIH PERSPEKTIF TAMPILAN WEBSITE
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-2xl leading-normal">
                Uji dan saksikan bagaimana website Anda terlihat bagi audiens yang berbeda ketika diluncurkan nanti secara real!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 p-0.5 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => {
                  setProductionViewMode("demo");
                  setActiveTab("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                  productionViewMode === "demo"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🔬 Mode Demo
              </button>
              <button
                onClick={() => {
                  setProductionViewMode("real_guest");
                  setActiveTab("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                  productionViewMode === "real_guest"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🌐 Guest (Public)
              </button>
              <button
                onClick={() => {
                  setProductionViewMode("real_member");
                  setActiveTab("dashboard");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                  productionViewMode === "real_member"
                    ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                👤 Member (Broker)
              </button>
            </div>
          </div>
          
          <div className="text-[10px] bg-slate-950/55 p-3 rounded-xl border border-slate-800/40 text-slate-400 space-y-1.5 font-sans leading-relaxed">
            {productionViewMode === "demo" && (
              <p>
                💡 <strong>Mode Demo Uji Coba:</strong> Menampilkan seluruh menu administratif, meja verifikasi admin, konsol n8n Webhook, dan tab spesifikasi teknis. Ideal untuk pengujian internal alur sistem.
              </p>
            )}
            {productionViewMode === "real_guest" && (
              <p>
                🔒 <strong>Mode Pengunjung Umum (Guest):</strong> Simulasi nyata saat website diakses publik. Hanya menampilkan papan listing proyek. <strong>Meja Verifikasi Admin</strong> dan <strong>Webhook Console</strong> disembunyikan total. Tombol <em>+ Posting</em> dan <em>Ajukan Minat</em> wajib memicu registrasi terlebih dahulu.
              </p>
            )}
            {productionViewMode === "real_member" && (
              <p>
                ✓ <strong>Mode Member Terdaftar:</strong> Simulasi bagi broker terverifikasi KYC. Menu pendaftaran diubah menjadi menu profil broker. Papan listing dapat digunakan penuh untuk memposting iklan dan mengajukan minat. <strong>Meja Verifikasi Admin</strong> dan <strong>Webhook Console</strong> tersembunyi demi kerahasiaan.
              </p>
            )}
          </div>
        </div>
        
        {/* Navigation & Welcome Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Workspace</span>
              <span className="text-xs font-mono text-slate-400">•</span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">Prototype Demo Aktif</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {activeTab === "dashboard" && "Dashboard Papan Listing"}
              {activeTab === "matchmaker" && "Sistem Matchmaking Broker"}
              {activeTab === "kyc" && "Registrasi & Verifikasi KYC"}
              {activeTab === "spec" && "Dokumen Spesifikasi Teknis"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-normal">
              {activeTab === "dashboard" && "Pusat pencatatan suplai barang valid dan kriteria buyer siap beli. Saring data sesuai spesifikasi lapangan."}
              {activeTab === "matchmaker" && "Algoritme pencocokan kriteria komoditas jualan versus kebutuhan modal buyer. Mempersingkat jalur transaksi A1."}
              {activeTab === "kyc" && "Simulasikan pendaftaran dan validasi NIK untuk memutus mata rantai penipuan informasi makelar bodong."}
              {activeTab === "spec" && "Rangkuman menyeluruh mencakup User Journey, Relasi Tabel Database, Portabilitas Aplikasi Mobile, serta Skema Webhook n8n."}
            </p>
          </div>

          {/* Persistent Nav Links */}
          <div className="flex flex-wrap bg-slate-200/50 p-1 rounded-xl border border-slate-200/60 select-none gap-0.5 max-w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Building2 size={13} />
              Platform Board
            </button>
            {productionViewMode !== "real_guest" && (
              <button
                onClick={() => setActiveTab("matchmaker")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "matchmaker" 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <GitMerge size={13} />
                Matchmaker
              </button>
            )}
            <button
              onClick={() => setActiveTab("kyc")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "kyc" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Users size={13} />
              {productionViewMode === "real_guest" ? "🔑 Daftar / Login" : "Registrasi & KYC"}
            </button>
            {productionViewMode === "demo" && (
              <button
                onClick={() => setActiveTab("spec")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-amber-500/10 text-amber-700 border border-amber-500/10 hover:bg-amber-500/20 ${
                  activeTab === "spec" 
                    ? "bg-amber-500! text-slate-950! border-transparent!" 
                    : ""
                }`}
              >
                <FileCode2 size={13} />
                Spesifikasi Teknis
              </button>
            )}
          </div>
        </div>

        {/* Tab Core Render */}
        <div className="animate-fade-in duration-300">
          {activeTab === "dashboard" && (
            <Dashboard
              currentUser={effectiveUser}
              onUserChange={setCurrentUser}
              supplyListings={supplyListings}
              demandListings={demandListings}
              onAddSupply={handleAddSupply}
              onAddDemand={handleAddDemand}
              onUpdateSupplyStatus={handleUpdateSupplyStatus}
              onUpdateDemandStatus={handleUpdateDemandStatus}
              onRenewListing={handleRenewListing}
              interests={interests}
              onCreateInterest={handleCreateInterest}
              onUpdateInterestStatus={handleUpdateInterestStatus}
              lastWebhookPayload={lastWebhookPayload}
              productionViewMode={productionViewMode}
            />
          )}

          {activeTab === "matchmaker" && (
            <ListingMatchmaker
              currentUser={effectiveUser}
              supplyListings={supplyListings}
              demandListings={demandListings}
              onTriggerWebhook={triggern8nWebhookSimulation}
            />
          )}

          {activeTab === "kyc" && (
            <RegistrationKYC
              currentUser={effectiveUser}
              onUserChange={setCurrentUser}
              onUpdateKYC={handleUpdateKYC}
              productionViewMode={productionViewMode}
            />
          )}

          {activeTab === "spec" && (
            <DocumentationView />
          )}
        </div>

      </main>

      {/* Platform Humble Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-white uppercase tracking-wider font-mono">REJEKI MACAN PLATFORM</p>
            <p className="text-[11px] text-slate-500">Sistem Portal Distribusi Pihak Pertama Valid & Otomatisasi Matchmaking Indonesia.</p>
          </div>
          <div className="text-[11px] text-slate-500 md:text-right">
            Designed for Senior System Analysts & n8n Integrators. Powered by React 19 + Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  );
}
