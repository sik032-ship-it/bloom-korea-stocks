import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { PpuriCard } from "@/components/PpuriCard";
import { QuestionBadge } from "@/components/QuestionBadge";
import type { Database } from "@/integrations/supabase/types";
import type { QuestionType } from "@/styles/colors";

type Sentence = Database["public"]["Tables"]["sentences"]["Row"];
type Holding = Database["public"]["Tables"]["holdings"]["Row"];

export default function CrisisModePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedHoldingId, setSelectedHoldingId] = useState(searchParams.get("holding") || "");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("holdings")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          setHoldings(data);
          if (!selectedHoldingId && data.length > 0) setSelectedHoldingId(data[0].id);
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!user || !selectedHoldingId) return;
    setLoading(true);
    supabase
      .from("sentences")
      .select("*")
      .eq("user_id", user.id)
      .eq("holding_id", selectedHoldingId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setSentences(data);
        setLoading(false);
      });
  }, [user, selectedHoldingId]);

  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId);
  const dateRange = sentences.length > 0
    ? `${new Date(sentences[0].created_at).toLocaleDateString("ko-KR")} — ${new Date(sentences[sentences.length - 1].created_at).toLocaleDateString("ko-KR")}`
    : "";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F9FF" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b border-border" style={{ backgroundColor: "rgba(240,249,255,0.9)" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-xl">←</button>
          <h1 className="text-title font-bold" style={{ color: "#0F766E" }}>
            🛡️ 위기에서 읽기
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Holding selector */}
        <select
          value={selectedHoldingId}
          onChange={(e) => setSelectedHoldingId(e.target.value)}
          className="w-full h-11 px-3 rounded-md bg-card border border-border text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {holdings.map((h) => (
            <option key={h.id} value={h.id}>
              {h.ticker} — {h.company_name_kr}
            </option>
          ))}
        </select>

        {/* Summary */}
        {selectedHolding && (
          <div className="text-center py-4 rounded-lg" style={{ backgroundColor: "#E0F2FE" }}>
            <p className="text-title font-bold" style={{ color: "#0F766E" }}>
              {selectedHolding.company_name_kr} ({selectedHolding.ticker})
            </p>
            <p className="text-body text-foreground mt-1">
              지금까지 <strong style={{ color: "#0F766E" }}>{sentences.length}</strong>문장을 썼어요
            </p>
            {dateRange && (
              <p className="text-small text-muted-foreground mt-1">{dateRange}</p>
            )}
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : sentences.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🌱</span>
            <p className="text-title text-foreground mb-2">아직 기록이 없어요</p>
            <p className="text-small text-muted-foreground">이 종목에 대한 문장을 써보세요</p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded-full" style={{ backgroundColor: "#0F766E" }} />

            <div className="space-y-4">
              {sentences.map((s, i) => (
                <div
                  key={s.id}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${Math.min(i * 50, 500)}ms`, animationFillMode: "both" }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2"
                    style={{ backgroundColor: "#0F766E", borderColor: "#F0F9FF" }}
                  />

                  <PpuriCard className="ml-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </p>
                      <QuestionBadge type={s.question_type as QuestionType} />
                    </div>
                    <p className="text-body text-foreground" style={{ lineHeight: "1.8" }}>
                      {s.answer_text}
                    </p>
                  </PpuriCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pt-4">
          <PpuriButton variant="secondary" fullWidth onClick={() => navigate("/holdings")}>
            종목 관리
          </PpuriButton>
          <PpuriButton fullWidth onClick={() => navigate("/")}>
            홈으로
          </PpuriButton>
        </div>
      </main>
    </div>
  );
}
