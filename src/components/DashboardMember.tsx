import { useState } from "react";
import { 
  Building2, PlusCircle, User, ShieldCheck, CheckCircle2, Send, 
  Trash2, RefreshCw, Layers, MapPin, Tag, AlertCircle, Sparkles,
  Upload, X, Link as LinkIcon, Image as ImageIcon
} from "lucide-react";
import { UserSession } from "../types";

interface DashboardMemberProps {
  currentUser: UserSession;
  supplyListings: any[];
  demandListings: any[];
  interests: any[];
  onCreateProject: (projectData: any) => Promise<boolean>;
  onDeleteProject: (projectId: string) => Promise<boolean>;
  onRefreshData: () => void;
}

export default function DashboardMember({
  currentUser,
  supplyListings,
  demandListings,
  interests,
  onCreateProject,
  onDeleteProject,
  onRefreshData
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
      alert("🎉 Proyek Anda berhasil terpublikasi di database server!");
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
              <p className="text-xs text-slate-500">Proyek ini tersimpan di server database central dan dapat dilihat publik.</p>
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
              {mySupply.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9.5px] rounded uppercase">
                      📦 Penawaran Barang
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-slate-600 line-clamp-2">{item.specifications}</p>
                  <p className="font-mono font-bold text-slate-800">
                    Rp {item.price ? item.price.toLocaleString("id-ID") : "Penawaran"}
                  </p>
                </div>
              ))}

              {myDemand.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[9.5px] rounded uppercase">
                      💼 Pencarian Buyer
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Hapus Proyek"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-slate-600 line-clamp-2">{item.criteria}</p>
                  <p className="font-mono font-bold text-emerald-800">
                    Max: Rp {item.budgetMax ? item.budgetMax.toLocaleString("id-ID") : "Budget"}
                  </p>
                </div>
              ))}
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
              Isi formulir di bawah ini. Proyek Anda akan langsung tersimpan ke server database central dan tayang untuk publik.
            </p>
          </div>

          <form onSubmit={handlePostProject} className="space-y-4 max-w-2xl text-xs">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Jenis Proyek: <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProjectType("supply")}
                  className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    projectType === "supply"
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 font-black"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <p className="text-xs">📦 Penawaran Barang / Aset (Supply)</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-0.5">Memiliki stok barang, lahan, atau komoditas valid.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectType("demand")}
                  className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    projectType === "demand"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 font-black"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <p className="text-xs">💼 Pencarian Buyer Siap (Demand)</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-0.5">Memiliki kriteria pembeli A1 yang mencari komoditas/aset.</p>
                </button>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              <span>{isSubmitting ? "Mempublikasikan..." : "Publikasikan Proyek ke Database Server"}</span>
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
              <p className="text-slate-500 py-6 text-center">Belum ada riwayat pengajuan minat.</p>
            ) : (
              myInterests.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{item.listingTitle}</h4>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600">"{item.userMessage}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeSubTab === "PROFILE" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl text-xs">
          <h3 className="text-base font-black text-slate-900">Profil & Status Verifikasi NIK Member</h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <p><strong>Nama Lengkap:</strong> {currentUser.fullName}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Nomor HP:</strong> {currentUser.phoneNumber}</p>
            <p><strong>Nomor NIK / KTP:</strong> {currentUser.ktpNumber || "Belum Diisi"}</p>
            <p><strong>Status KYC:</strong> <span className="font-bold text-emerald-600">{currentUser.kycStatus}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
