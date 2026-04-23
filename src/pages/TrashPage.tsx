import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";
import { PpuriButton } from "@/components/PpuriButton";
import { Mascot } from "@/components/Mascot";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Holding = Database["public"]["Tables"]["holdings"]["Row"];

const RETENTION_DAYS = 30;

export default function TrashPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [purgeId, setPurgeId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ current_streak: number; longest_streak: number } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: h }, { data: p }] = await Promise.all([
      supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
      supabase.from("profiles").select("current_streak, longest_streak").eq("id", user.id).single(),
    ]);
    if (h) setItems(h);
    if (p) setProfile(p);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const daysLeft = (deletedAt: string) => {
    const elapsed = (Date.now() - new Date(deletedAt).getTime()) / 86400000;
    return Math.max(0, Math.ceil(RETENTION_DAYS - elapsed));
  };

  const restore = async (h: Holding) => {
    if (!user) return;
    await Promise.all([
      supabase.from("holdings").update({ deleted_at: null, is_active: true }).eq("id", h.id),
      supabase.from("sentences").update({ deleted_at: null }).eq("holding_id", h.id).eq("user_id", user.id),
    ]);
    toast.success(`${h.ticker} 복구 완료`);
    fetchData();
  };

  const confirmPurge = async () => {
    if (!purgeId || !user) return;
    const h = items.find((i) => i.id === purgeId);
    // Hard delete sentences first, then holding
    await supabase.from("sentences").delete().eq("holding_id", purgeId).eq("user_id", user.id);
    await supabase.from("holdings").delete().eq("id", purgeId);
    toast.success(`${h?.ticker} 영구 삭제 완료`);
    setPurgeId(null);
    fetchData();
  };

  return (
    <Layout currentStreak={profile?.current_streak || 0} longestStreak={profile?.longest_streak || 0}>
      <div className="flex items-center gap-3">
        <Link to="/holdings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground" aria-label="뒤로">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-display text-foreground">휴지통</h1>
      </div>

      <p className="text-small text-muted-foreground -mt-2">
        삭제된 종목은 30일 후 자동으로 영구 삭제됩니다.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Mascot mood="celebrate" size="lg" className="mx-auto mb-4" />
          <p className="text-title text-foreground mb-2">휴지통이 비어있어요</p>
          <p className="text-small text-muted-foreground">삭제된 종목이 여기 표시돼요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((h) => {
            const left = h.deleted_at ? daysLeft(h.deleted_at) : 0;
            return (
              <PpuriCard key={h.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-small font-bold shrink-0">
                      {h.ticker}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body font-medium text-foreground truncate">{h.company_name_kr}</p>
                      <p className="text-xs text-muted-foreground">
                        ✍️ {h.sentence_count}개 문장 · {left > 0 ? `${left}일 후 영구 삭제` : "곧 영구 삭제"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => restore(h)}
                      className="p-2 text-primary hover:bg-accent rounded-md transition-colors"
                      aria-label="복구"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPurgeId(h.id)}
                      className="p-2 text-destructive hover:bg-accent rounded-md transition-colors"
                      aria-label="영구 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </PpuriCard>
            );
          })}
        </div>
      )}

      {purgeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="bg-card rounded-lg p-6 mx-6 max-w-sm w-full text-center animate-bounce-in">
            <p className="text-title text-foreground mb-2">영구 삭제할까요?</p>
            <p className="text-small text-muted-foreground mb-6">
              {items.find((i) => i.id === purgeId)?.ticker} 종목과 모든 문장이 즉시 사라집니다.
              <br />이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <PpuriButton variant="ghost" fullWidth onClick={() => setPurgeId(null)}>취소</PpuriButton>
              <button
                onClick={confirmPurge}
                className="flex-1 h-11 rounded-md bg-destructive text-destructive-foreground font-semibold text-body"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
