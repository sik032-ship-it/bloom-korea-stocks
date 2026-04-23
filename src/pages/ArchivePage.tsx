import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { QuestionBadge } from "@/components/QuestionBadge";
import { PpuriButton } from "@/components/PpuriButton";
import { InvestmentTimeline } from "@/components/InvestmentTimeline";
import type { Database } from "@/integrations/supabase/types";
import type { QuestionType } from "@/styles/colors";

type Sentence = Database["public"]["Tables"]["sentences"]["Row"];
type Holding = Database["public"]["Tables"]["holdings"]["Row"];

const DATE_FILTERS = [
  { label: "이번주", value: "week" },
  { label: "이번달", value: "month" },
  { label: "지난달", value: "last_month" },
  { label: "모든 기간", value: "all" },
];


function getDateRange(filter: string): Date | null {
  const now = new Date();
  switch (filter) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "last_month": {
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    default:
      return null;
  }
}

function getDateRangeEnd(filter: string): Date | null {
  if (filter === "last_month") {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

export default function ArchivePage() {
  const { user } = useAuth();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [profile, setProfile] = useState<{ current_streak: number; longest_streak: number } | null>(null);

  const PAGE_SIZE = 20;

  const fetchHoldings = async () => {
    if (!user) return;
    const [{ data: h }, { data: p }] = await Promise.all([
      supabase.from("holdings").select("*").eq("user_id", user.id).is("deleted_at", null),
      supabase.from("profiles").select("current_streak, longest_streak").eq("id", user.id).single(),
    ]);
    if (h) setHoldings(h);
    if (p) setProfile(p);
  };

  const fetchSentences = async (reset = false) => {
    if (!user) return;
    const currentPage = reset ? 0 : page;

    let query = supabase
      .from("sentences")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);


    const start = getDateRange(dateFilter);
    const end = getDateRangeEnd(dateFilter);
    if (start) query = query.gte("created_at", start.toISOString());
    if (end) query = query.lt("created_at", end.toISOString());

    const { data } = await query;
    if (data) {
      if (reset) {
        setSentences(data);
      } else {
        setSentences((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHoldings(); }, [user]);
  useEffect(() => {
    setPage(0);
    setLoading(true);
    fetchSentences(true);
  }, [user, dateFilter]);

  const loadMore = () => {
    setPage((p) => p + 1);
    fetchSentences();
  };

  const getHoldingInfo = (holdingId: string) =>
    holdings.find((h) => h.id === holdingId);

  return (
    <Layout currentStreak={profile?.current_streak || 0} longestStreak={profile?.longest_streak || 0}>
      <h1 className="text-display text-foreground">기록 보관소</h1>

      {/* Investment Timeline */}
      {user && holdings.length > 0 && (
        <PpuriCard>
          <p className="text-small font-semibold text-foreground mb-3">📅 투자 일기 타임라인</p>
          <InvestmentTimeline userId={user.id} holdings={holdings} />
        </PpuriCard>
      )}

      {/* Date filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              dateFilter === f.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sentences */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : sentences.length === 0 ? (
        <div className="space-y-4 py-6 animate-fade-in">
          <div className="text-center">
            <span className="text-5xl block mb-3">📖</span>
            <p className="text-title text-foreground mb-1">아직 기록이 없어요</p>
            <p className="text-small text-muted-foreground">
              레슨을 완료하면 여기에<br />나만의 투자 일기가 쌓여요!
            </p>
          </div>

          {/* 샘플 문장 예시 — "이렇게 쓰면 돼요" */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">
              💡 이렇게 쓰면 돼요 (예시)
            </p>
            <div className="space-y-3">
              <PpuriCard className="border-dashed bg-accent/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">📅 예시 · AAPL 애플</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    하락 대응
                  </span>
                </div>
                <p className="text-small text-foreground/80 italic leading-relaxed">
                  "애플이 -8% 떨어졌지만 아이폰 판매량은 그대로다. 가격이 떨어진 거지 회사 가치가 떨어진 게 아니다. <strong>나는 5년 후를 보고 산 것이지, 다음 분기 실적을 보고 산 게 아니다.</strong>"
                </p>
              </PpuriCard>

              <PpuriCard className="border-dashed bg-accent/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">📅 예시 · NVDA 엔비디아</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    FOMO 점검
                  </span>
                </div>
                <p className="text-small text-foreground/80 italic leading-relaxed">
                  "엔비디아가 일주일 만에 +20% 올랐다. 더 사고 싶은 마음이 든다. <strong>하지만 내가 사려는 이유는 '오르고 있어서'이지, 회사가 더 좋아져서가 아니다. 추격은 하지 않는다.</strong>"
                </p>
              </PpuriCard>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              👆 정답은 없어요. <strong className="text-foreground">자기 생각을 솔직히 적는 것</strong>이 핵심입니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sentences.map((s) => {
            const holding = getHoldingInfo(s.holding_id);
            const isExpanded = expandedId === s.id;
            return (
              <PpuriCard
                key={s.id}
                hoverable
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-small font-bold text-foreground">
                    {new Date(s.created_at).toLocaleDateString("ko-KR")}
                  </p>
                  <QuestionBadge type={s.question_type as QuestionType} />
                </div>
                {holding && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {holding.ticker} | {holding.company_name_kr}
                  </p>
                )}
                <p className="text-body text-foreground">
                  {isExpanded ? s.answer_text : s.answer_text.length > 100 ? s.answer_text.slice(0, 100) + "..." : s.answer_text}
                </p>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border animate-slide-up">
                    <p className="text-small text-muted-foreground italic mb-2">
                      Q: {s.question_text}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(s.answer_text);
                        import("sonner").then(({ toast }) => toast.success("답변이 복사되었습니다"));
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      📋 답변 복사
                    </button>
                  </div>
                )}
              </PpuriCard>
            );
          })}

          {hasMore && (
            <PpuriButton variant="secondary" fullWidth onClick={loadMore}>
              더 보기
            </PpuriButton>
          )}
        </div>
      )}
    </Layout>
  );
}
