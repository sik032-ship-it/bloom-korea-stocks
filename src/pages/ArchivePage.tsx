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

const TYPE_FILTERS: { label: string; value: QuestionType | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "일상", value: "daily" },
  { label: "실적", value: "earnings" },
  { label: "하락", value: "drop" },
  { label: "급등", value: "surge" },
  { label: "FOMO", value: "fomo" },
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
  const [holdingFilter, setHoldingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [profile, setProfile] = useState<{ current_streak: number; longest_streak: number } | null>(null);

  const PAGE_SIZE = 20;

  const fetchHoldings = async () => {
    if (!user) return;
    const [{ data: h }, { data: p }] = await Promise.all([
      supabase.from("holdings").select("*").eq("user_id", user.id),
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
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (holdingFilter !== "all") query = query.eq("holding_id", holdingFilter);
    if (typeFilter !== "all") query = query.eq("question_type", typeFilter);

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
  }, [user, holdingFilter, typeFilter, dateFilter]);

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

      {/* Filters */}
      <div className="space-y-3">
        {/* Holding filter */}
        <select
          value={holdingFilter}
          onChange={(e) => setHoldingFilter(e.target.value)}
          className="w-full h-11 px-3 rounded-md bg-input border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">모든 종목</option>
          {holdings.map((h) => (
            <option key={h.id} value={h.id}>
              {h.ticker} — {h.company_name_kr}
            </option>
          ))}
        </select>

        {/* Type filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

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
      </div>

      {/* Sentences */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : sentences.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl block mb-3">📖</span>
          <p className="text-title text-foreground mb-2">아직 기록이 없어요</p>
          <p className="text-small text-muted-foreground mb-1">레슨을 완료하면 여기에</p>
          <p className="text-small text-muted-foreground">나만의 투자 일기가 쌓여요!</p>
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
