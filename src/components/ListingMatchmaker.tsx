import { useState, useEffect } from "react";
import { GitMerge, ArrowRight, Phone, MessageSquare, AlertCircle, RefreshCw, Sparkles, Check, HelpCircle } from "lucide-react";
import { SupplyListing, DemandListing, MatchmakingResult, UserSession, KYCStatus } from "../types";

interface ListingMatchmakerProps {
  currentUser: UserSession;
  supplyListings: SupplyListing[];
  demandListings: DemandListing[];
  onTriggerWebhook: (payload: any) => void;
}

export default function ListingMatchmaker({
  currentUser,
  supplyListings,
  demandListings,
  onTriggerWebhook
}: ListingMatchmakerProps) {
  const [matches, setMatches] = useState<MatchmakingResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [lastConnectedMatch, setLastConnectedMatch] = useState<string | null>(null);

  // Matchmaking Algorithm
  const calculateMatches = () => {
    setIsMatching(true);
    const results: MatchmakingResult[] = [];

    // Common search keywords for document & logistics validation
    const keyTerms = [
      "shm", "hgb", "fob", "jetty", "skbdn", "lc", "cash", "serang", "tangerang",
      "bali", "balikpapan", "excavator", "caterpillar", "komatsu", "batu bara"
    ];

    supplyListings.forEach((sup) => {
      // We only match listings that are VERIFIED or ON_PROGRESS
      if (sup.status === "CLOSED") return;

      demandListings.forEach((dem) => {
        if (dem.status === "CLOSED") return;

        const factors: string[] = [];

        // ─── REJEKI MACAN CORE ENGINE (V1.0) FORMULA ───
        // Score = (Kategori × 0.50) + (Anggaran × 0.30) + (Semantik × 0.20)

        // 1. Kategori [50%]: Bernilai 50 jika kategori sama mutlak, 0 jika berbeda (dan langsung return)
        let categoryScore = 0;
        if (sup.category.toLowerCase() === dem.category.toLowerCase()) {
          categoryScore = 50;
          factors.push(`Kategori Sejenis: ${sup.category} (Kategori: 50%)`);
        } else {
          // If category fails, no match at all
          return;
        }

        // 2. Anggaran [30%]: Dihitung berdasarkan persentase irisan harga barang vs budget buyer
        let budgetScore = 0;
        if (sup.price >= dem.budgetMin && sup.price <= dem.budgetMax) {
          budgetScore = 30;
          factors.push("Harga Sesuai Rentang Anggaran Buyer (Anggaran: 30%)");
        } else {
          // Calculate closeness percentage overlap
          const minDiff = Math.abs(sup.price - dem.budgetMin);
          const maxDiff = Math.abs(sup.price - dem.budgetMax);
          const closestDiff = Math.min(minDiff, maxDiff);
          const budgetSpan = dem.budgetMax - dem.budgetMin;
          const refValue = budgetSpan > 0 ? budgetSpan : dem.budgetMax;
          
          const closeness = Math.max(0, 1 - closestDiff / refValue);
          budgetScore = Math.round(closeness * 30);
          factors.push(`Irisan Rentang Anggaran: ${(closeness * 100).toFixed(0)}% (Anggaran: ${budgetScore}%)`);
        }

        // 3. Semantik [20%]: Analisis kemiripan teks deskripsi dan sinkronisasi wilayah/kabupaten
        let semanticScore = 0;
        const supLoc = sup.location.toLowerCase();
        const demTextLower = `${dem.title} ${dem.criteria}`.toLowerCase();
        const supTextLower = `${sup.title} ${sup.specifications}`.toLowerCase();

        // Sub-faktor A: Sinkronisasi wilayah/kabupaten (10%)
        const commonLocations = ["serang", "tangerang", "banten", "balikpapan", "cilegon", "kalimantan", "jakarta", "surabaya", "bali"];
        let locationMatched = false;
        for (const loc of commonLocations) {
          if (supLoc.includes(loc) && demTextLower.includes(loc)) {
            locationMatched = true;
            break;
          }
        }

        if (locationMatched) {
          semanticScore += 10;
          factors.push("Sinkronisasi Wilayah/Kabupaten Cocok (+10%)");
        } else {
          // Check word overlap for partial location matches
          const supLocWords = supLoc.split(/[\s,]+/);
          let partialMatched = false;
          for (const word of supLocWords) {
            if (word.length > 3 && demTextLower.includes(word)) {
              partialMatched = true;
              break;
            }
          }
          if (partialMatched) {
            semanticScore += 5;
            factors.push("Parsial Wilayah Terkait (+5%)");
          }
        }

        // Sub-faktor B: Analisis kemiripan teks deskripsi (10%)
        let keywordMatchesCount = 0;
        keyTerms.forEach((term) => {
          if (supTextLower.includes(term) && demTextLower.includes(term)) {
            keywordMatchesCount += 2.5;
          }
        });
        const finalKeywordScore = Math.min(keywordMatchesCount, 10);
        semanticScore += finalKeywordScore;
        if (finalKeywordScore > 0) {
          factors.push(`Kemiripan Kosakata Deskripsi (+${finalKeywordScore.toFixed(1)}%)`);
        }

        // Total Match Score
        const totalScore = categoryScore + budgetScore + Math.round(semanticScore);

        // If compatibility is >= 65%, we record it as a strong match
        if (totalScore >= 65) {
          results.push({
            id: `match-${sup.id}-${dem.id}`,
            supply: sup,
            demand: dem,
            matchScore: totalScore,
            matchFactors: factors,
            createdAt: new Date().toISOString()
          });
        }
      });
    });

    // Sort by highest match score
    results.sort((a, b) => b.matchScore - a.matchScore);

    setTimeout(() => {
      setMatches(results);
      setIsMatching(false);
    }, 800);
  };

  useEffect(() => {
    calculateMatches();
  }, [supplyListings, demandListings]);

  const handleConnectBrokers = (match: MatchmakingResult) => {
    setLastConnectedMatch(match.id);
    
    // Simulate webhook payload dispatch
    const webhookPayload = {
      event: "matchmaking.connected",
      match_id: match.id,
      score: match.matchScore,
      timestamp: new Date().toISOString(),
      supply_item: {
        id: match.supply.id,
        title: match.supply.title,
        price: match.supply.price,
        broker_name: match.supply.brokerName,
        broker_phone: match.supply.brokerPhone
      },
      demand_item: {
        id: match.demand.id,
        title: match.demand.title,
        budget_max: match.demand.budgetMax,
        broker_name: match.demand.brokerName,
        broker_phone: match.demand.brokerPhone
      }
    };

    onTriggerWebhook(webhookPayload);
    setTimeout(() => setLastConnectedMatch(null), 3500);
  };

  const isVerifiedUser = currentUser.kycStatus === KYCStatus.VERIFIED;

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-slate-950 font-mono rounded-md">
              AI Matchmaker Engine v1.0
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Sistem Pencocokan Otomatis Broker</h3>
            <p className="text-xs text-slate-300">
              Menghitung kecocokan listing info barang dengan kebutuhan pembeli secara matematis menggunakan kecocokan Kategori (50%), Rentang Anggaran (30%), & Kesamaan Dokumen/Lokasi (20%).
            </p>
          </div>
          <button
            onClick={calculateMatches}
            disabled={isMatching}
            className="px-4.5 py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer self-start md:self-center shadow"
          >
            <RefreshCw size={13} className={isMatching ? "animate-spin" : ""} />
            {isMatching ? "Sinkronisasi..." : "Hitung Ulang Pasangan Cocok"}
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <AlertCircle size={32} className="mx-auto text-amber-500" />
          <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Transaksi yang Lolos Ambang Batas Matching {"(>= 65%)"}</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Belum ada spesifikasi barang yang cocok dengan rentang anggaran dan kriteria pembeli saat ini. Coba posting data baru di Dashboard atau ganti profil peran Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Daftar Pasangan Transaksi Terkomparasi ({matches.length})
            </h4>
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Sparkles size={11} />
              Sinyal Sinergi Terdeteksi
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row gap-6 relative transition-all"
              >
                {/* Score Indicator Badge */}
                <div className="absolute left-6 -top-3.5 px-3 py-1 bg-slate-900 text-white rounded-full border border-slate-800 flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold font-mono">Skor Match: {match.matchScore}%</span>
                </div>

                {/* Left Side: Supply Seller */}
                <div className="flex-1 space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                      SISI SELLER (SUPPLY)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Kode: {match.supply.id}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{match.supply.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lokasi: {match.supply.location}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500">Harga Penjual:</span>
                    <span className="font-bold text-slate-900">
                      {match.supply.price >= 1000000000
                        ? `Rp ${(match.supply.price / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Miliar`
                        : `Rp ${match.supply.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">S</div>
                    <span className="text-[11px] font-bold text-slate-700 font-mono">@{match.supply.brokerUsername || match.supply.brokerId}</span>
                  </div>
                </div>

                {/* Direction arrow badge */}
                <div className="flex items-center justify-center text-slate-400 shrink-0 select-none xl:self-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <ArrowRight className="text-amber-600" size={18} />
                  </div>
                </div>

                {/* Right Side: Demand Buyer */}
                <div className="flex-1 space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15">
                      SISI BUYER (DEMAND)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Kode: {match.demand.id}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{match.demand.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sistem Bayar: {match.demand.paymentSystem}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500">Anggaran Maksimal:</span>
                    <span className="font-bold text-slate-900">
                      {match.demand.budgetMax >= 1000000000
                        ? `Rp ${(match.demand.budgetMax / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Miliar`
                        : `Rp ${match.demand.budgetMax.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">B</div>
                    <span className="text-[11px] font-bold text-slate-700 font-mono">@{match.demand.brokerUsername || match.demand.brokerId}</span>
                  </div>
                </div>

                {/* Match Action Center */}
                <div className="xl:w-64 flex flex-col justify-between p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shrink-0 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Faktor Kecocokan Positif</p>
                    <ul className="text-[10px] text-slate-300 space-y-1">
                      {match.matchFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                          <span className="line-clamp-2">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connect Trigger Action */}
                  <div>
                    {isVerifiedUser ? (
                      <button
                        onClick={() => handleConnectBrokers(match)}
                        className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase cursor-pointer text-center flex items-center justify-center gap-2 ${
                          lastConnectedMatch === match.id 
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95"
                        }`}
                      >
                        {lastConnectedMatch === match.id ? (
                          <>
                            <Check size={12} className="stroke-[3]" />
                            <span>Tembakan Terkirim!</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare size={12} className="stroke-[3]" />
                            <span>Hubungkan Kedua A1</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-slate-800 p-2 rounded-lg border border-slate-700/60 text-[10px] text-slate-400 text-center">
                        🔒 Akses Hubungi Terkunci. Selesaikan verifikasi KYC Anda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
