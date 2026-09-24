import { StockLogo } from "@/components/StockLogo";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { PpuriButton } from "@/components/PpuriButton";
import { Mascot } from "@/components/Mascot";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Trash2, Sparkles, TrendingUp, Shield, ScanEye } from "lucide-react";
import { MentorCard } from "@/components/MentorCard";
import { useMentorExperiment } from "@/hooks/useMentorExperiment";
import type { Database } from "@/integrations/supabase/types";
import { FutureValueSimulator } from "@/components/FutureValueSimulator";
import { DropPlanModal, hasDropPlan } from "@/components/DropPlanModal";
import { searchStocks, TICKER_RE } from "@/data/stockList";
import { HumilityCheckModal, getHumilityCheck } from "@/components/HumilityCheck";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];



export default function HoldingsPage() {
 const { user } = useAuth();
 const [holdings, setHoldings] = useState<Holding[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAdd, setShowAdd] = useState(false);
 const [search, setSearch] = useState("");
 const [customTicker, setCustomTicker] = useState("");
 const [customName, setCustomName] = useState("");
 const [deleteId, setDeleteId] = useState<string | null>(null);
 const [simHolding, setSimHolding] = useState<Holding | null>(null);
 const [planHolding, setPlanHolding] = useState<Holding | null>(null);
 const [humilityHolding, setHumilityHolding] = useState<Holding | null>(null);
 const [profile, setProfile] = useState<{ current_streak: number; longest_streak: number } | null>(null);

 const fetchData = async () => {
 if (!user) return;
 const [{ data: h }, { data: p }] = await Promise.all([
 supabase.from("holdings").select("*").eq("user_id", user.id).eq("is_active", true).is("deleted_at", null).order("added_at", { ascending: false }),
 supabase.from("profiles").select("current_streak, longest_streak").eq("id", user.id).single(),
 ]);
 if (h) setHoldings(h);
 if (p) setProfile(p);
 setLoading(false);
 };

 useEffect(() => { fetchData(); }, [user]);

 const filteredStocks = searchStocks(search, new Set(holdings.map((h) => h.ticker)), 20);

 const addHolding = async (ticker: string, nameKr: string) => {
 if (!user || holdings.length >= 10) {
 if (holdings.length >= 10) toast.error("최대 10개까지 추가할 수 있어요");
 return;
 }
 const t = ticker.trim().toUpperCase();
 const n = nameKr.trim().slice(0, 60);
 if (!TICKER_RE.test(t) || !n) { toast.error("티커는 영문/숫자 10자 이내, 종목명은 필수예요"); return; }
 if (holdings.some((h) => h.ticker === t)) { toast.error("이미 추가된 종목이에요"); return; }
 const { error } = await supabase.from("holdings").insert({
 user_id: user.id,
 ticker: t,
 company_name_kr: n,
 });
 if (error) { toast.error(error.message.includes("holdings_limit") ? "최대 10개까지 추가할 수 있어요" : "추가 실패 — 잠시 후 다시 시도해 주세요"); return; }
 ticker = t;
 toast.success(`${ticker} 추가 완료`);
 setShowAdd(false);
 setSearch("");
 fetchData();
 };

 const confirmDelete = async () => {
 if (!deleteId || !user) return;
 const h = holdings.find((h) => h.id === deleteId);
 const now = new Date().toISOString();
 // Soft delete: holdings + cascade to its sentences
 await Promise.all([
 supabase.from("holdings").update({ deleted_at: now, is_active: false }).eq("id", deleteId),
 supabase.from("sentences").update({ deleted_at: now }).eq("holding_id", deleteId).eq("user_id", user.id),
 ]);
 toast.success(`${h?.ticker} 휴지통으로 이동 (30일 내 복구 가능)`);
 setDeleteId(null);
 fetchData();
 };

 return (
 <Layout currentStreak={profile?.current_streak || 0} longestStreak={profile?.longest_streak || 0}>
 <div className="flex items-center justify-between">
 <h1 className="text-display text-foreground">보유 종목</h1>
 <div className="flex items-center gap-2">
 <Link to="/legends" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="역사 속 헐값 카드">
 <Sparkles className="w-5 h-5" />
 </Link>
 <Link to="/trash" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="휴지통">
 <Trash2 className="w-5 h-5" />
 </Link>
 <PpuriButton onClick={() => setShowAdd(true)}>+ 종목 추가</PpuriButton>
 </div>
 </div>

 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
 </div>
 ) : holdings.length === 0 ? (
 <div className="text-center py-12">
 <Mascot mood="wave" size="lg" className="mx-auto mb-4" />
 <p className="text-title text-foreground mb-2">아직 보유 종목이 없어요</p>
 <p className="text-small text-muted-foreground mb-1">종목을 추가하면 맞춤 질문으로</p>
 <p className="text-small text-muted-foreground mb-4">투자 마인드를 훈련할 수 있어요!</p>
 <button onClick={() => setShowAdd(true)} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-small hover:opacity-90 transition-all press-effect">
 첫 종목 추가하기
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {holdings.map((h) => (
 <PpuriCard key={h.id}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <StockLogo ticker={h.ticker} name={h.company_name_kr} size="md" />
 <div>
 <p className="text-body font-bold text-foreground">{h.company_name_kr} <span className="text-xs font-semibold text-muted-foreground ml-1">{h.ticker}</span></p>
 <p className="text-xs text-muted-foreground">
 머무른 지 <strong className="text-foreground">{Math.max(1, Math.floor((Date.now() - new Date(h.added_at).getTime()) / 86_400_000))}</strong>일 · {h.sentence_count}개 문장
 </p>
 </div>
 </div>
 <button
 onClick={() => setDeleteId(h.id)}
 className="text-muted-foreground hover:text-destructive text-lg px-2"
 aria-label="삭제"
 >
 ×
 </button>
 </div>
 <div className="mt-3 grid grid-cols-3 gap-1.5">
 <button
 onClick={() => setSimHolding(h)}
 className="flex flex-col items-center justify-center gap-0.5 h-14 rounded-md bg-primary/8 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-all press-effect"
 >
 <TrendingUp className="w-4 h-4" />
 <span>2040년 시점</span>
 </button>
 <button
 onClick={() => setPlanHolding(h)}
 className={`flex flex-col items-center justify-center gap-0.5 h-14 rounded-md text-[11px] font-semibold transition-all press-effect ${
 hasDropPlan(h.id)
 ? "bg-[#F59E0B]/15 text-[#D97706] hover:bg-[#F59E0B]/25"
 : "bg-muted text-muted-foreground hover:bg-accent"
 }`}
 >
 <Shield className="w-4 h-4" />
 <span>{hasDropPlan(h.id) ? "분할매수 " : "분할매수 계획"}</span>
 </button>
 <button
 onClick={() => setHumilityHolding(h)}
 className={`flex flex-col items-center justify-center gap-0.5 h-14 rounded-md text-[11px] font-semibold transition-all press-effect ${
 getHumilityCheck(h.id)
 ? "bg-primary/10 text-primary hover:bg-primary/20"
 : "bg-muted text-muted-foreground hover:bg-accent"
 }`}
 >
 <ScanEye className="w-4 h-4" />
 <span>{getHumilityCheck(h.id) ? "겸손체크 " : "겸손 체크"}</span>
 </button>
 </div>
 </PpuriCard>
 ))}
 </div>
 )}

 {/* Add Modal */}
 {showAdd && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm">
 <div className="bg-card rounded-t-2xl sm:rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-title text-foreground">종목 추가</h2>
 <button onClick={() => { setShowAdd(false); setSearch(""); }} className="text-muted-foreground text-xl">×</button>
 </div>

 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="티커 또는 종목명 검색..."
 className="w-full h-11 px-4 rounded-md bg-input border border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
 autoFocus
 />

 {filteredStocks.length > 0 && (
 <div className="space-y-1 mb-4">
 {filteredStocks.map((s) => (
 <button
 key={s.ticker}
 onClick={() => addHolding(s.ticker, s.name)}
 className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent text-left transition-colors"
 >
 <StockLogo ticker={s.ticker} name={s.name} size="sm" />
 <span className="text-small font-bold text-foreground">{s.name}</span>
 <span className="text-xs text-muted-foreground">{s.ticker}</span>
 </button>
 ))}
 </div>
 )}

 <div className="border-t border-border pt-4">
 <p className="text-small font-medium text-foreground mb-2">직접 입력</p>
 <div className="flex gap-2">
 <input
 value={customTicker}
 onChange={(e) => setCustomTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 10))}
 maxLength={10}
 placeholder="티커"
 className="flex-1 h-11 px-3 rounded-md bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring"
 />
 <input
 value={customName}
 onChange={(e) => setCustomName(e.target.value.slice(0, 60))}
 maxLength={60}
 placeholder="종목명"
 className="flex-1 h-11 px-3 rounded-md bg-input border border-border text-small focus:outline-none focus:ring-2 focus:ring-ring"
 />
 <PpuriButton
 disabled={!customTicker || !customName}
 onClick={() => {
 addHolding(customTicker, customName);
 setCustomTicker("");
 setCustomName("");
 }}
 >
 추가
 </PpuriButton>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal — 매도/이탈 차단의 핵심 모먼트 (A/B variant 자동 노출) */}
 {deleteId && (() => {
 const target = holdings.find((h) => h.id === deleteId);
 if (!target) return null;
 return (
 <SellBlockModal
 ticker={target.ticker}
 daysHeld={Math.max(1, Math.floor((Date.now() - new Date(target.added_at).getTime()) / 86_400_000))}
 onStay={() => setDeleteId(null)}
 onSell={confirmDelete}
 />
 );
 })()}

 {simHolding && (
 <FutureValueSimulator
 ticker={simHolding.ticker}
 companyName={simHolding.company_name_kr}
 onClose={() => setSimHolding(null)}
 />
 )}

 {planHolding && (
 <DropPlanModal
 holdingId={planHolding.id}
 ticker={planHolding.ticker}
 companyName={planHolding.company_name_kr}
 onClose={() => setPlanHolding(null)}
 />
 )}

 {humilityHolding && (
 <HumilityCheckModal
 holdingId={humilityHolding.id}
 ticker={humilityHolding.ticker}
 companyName={humilityHolding.company_name_kr}
 onClose={() => setHumilityHolding(null)}
 />
 )}
 </Layout>
 );
}

// 매도 차단 모달 — 별도 컴포넌트로 분리해 deleteId 변경 시마다 impression이 정확히 1회 기록되게 함
function SellBlockModal({
 ticker,
 daysHeld,
 onStay,
 onSell,
}: {
 ticker: string;
 daysHeld: number;
 onStay: () => void;
 onSell: () => void;
}) {
 const { variant, log } = useMentorExperiment("sell_block", true, { ticker, days_held: daysHeld });
 return (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
 <div className="w-full max-w-md mx-auto sm:mx-4 max-h-[90vh] overflow-y-auto animate-slide-up p-4 sm:p-0">
 <MentorCard
 mentor={variant.mentor}
 quote={variant.quote}
 commandment={variant.commandment}
 commandmentLabel={variant.commandmentLabel}
 ctaLabel={variant.ctaLabel}
 onCta={() => {
 log("cta_click");
 onStay();
 }}
 secondaryLabel={variant.secondaryLabel}
 onSecondary={() => {
 log("secondary_click");
 onSell();
 }}
 footnote={
 <>
 <strong className="text-foreground">{ticker}</strong>를 정말 보내시겠어요?
 지금 보유한 지 <strong className="text-foreground tabular-nums">{daysHeld}일</strong>째예요.
 10년 뒤에도 사람들이 이 회사 제품을 쓸까요?
 </>
 }
 />
 </div>
 </div>
 );
}
