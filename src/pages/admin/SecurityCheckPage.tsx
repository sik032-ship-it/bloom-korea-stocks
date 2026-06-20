import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { PpuriCard } from "@/components/PpuriCard";

type Policy = { name: string; cmd: string; roles: string; qual: string | null; with_check: string | null };
type Grant = { grantee: string; privileges: string };
type TableAudit = {
  table: string;
  rls_enabled: boolean;
  policies: Policy[];
  grants: Grant[];
};

const CORE_TABLES = ["profiles", "holdings", "sentences", "mentor_card_events", "onboarding_events"];

function checkTable(t: TableAudit): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!t.rls_enabled) issues.push("RLS가 비활성화 상태입니다");
  if (t.policies.length === 0) issues.push("RLS 정책이 없습니다 (모든 접근 차단됨)");
  const hasAuth = t.grants.some((g) => g.grantee === "authenticated");
  const hasService = t.grants.some((g) => g.grantee === "service_role");
  if (!hasAuth) issues.push("authenticated 역할 GRANT 없음 — Data API 접근 불가");
  if (!hasService) issues.push("service_role GRANT 없음 — Edge Function 접근 불가");
  const anon = t.grants.find((g) => g.grantee === "anon");
  if (anon) issues.push(`anon 역할에 권한 부여됨: ${anon.privileges} (의도된 것인지 확인 필요)`);
  return { ok: issues.length === 0, issues };
}

export default function SecurityCheckPage() {
  const [data, setData] = useState<TableAudit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase.rpc("get_rls_audit");
    if (error) setErr(error.message);
    else setData(data as unknown as TableAudit[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-foreground">🔒 보안 점검</h1>
            <p className="text-small text-muted-foreground mt-1">
              핵심 테이블의 RLS · 정책 · GRANT 상태를 실시간으로 검증합니다.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-small disabled:opacity-50"
          >
            {loading ? "검사 중..." : "🔄 재검사"}
          </button>
        </header>

        {err && (
          <PpuriCard className="border-destructive/40 bg-destructive/5">
            <p className="text-small text-destructive font-bold">⚠️ {err}</p>
          </PpuriCard>
        )}

        {loading && !data && <p className="text-small text-muted-foreground">로딩 중...</p>}

        {data && (
          <>
            <PpuriCard>
              <div className="flex items-center justify-between mb-2">
                <p className="text-small font-bold text-foreground">전체 요약</p>
                {(() => {
                  const total = data.length;
                  const passed = data.filter((t) => checkTable(t).ok).length;
                  const allOk = passed === total;
                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        allOk ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {passed} / {total} 통과
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground">
                검사 대상: {CORE_TABLES.join(", ")}
              </p>
            </PpuriCard>

            {data.map((t) => {
              const status = checkTable(t);
              return (
                <PpuriCard
                  key={t.table}
                  className={status.ok ? "border-primary/30" : "border-destructive/40 bg-destructive/5"}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-title font-bold text-foreground">{t.table}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        status.ok ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {status.ok ? "✅ PASS" : "❌ FAIL"}
                    </span>
                  </div>

                  {status.issues.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {status.issues.map((i) => (
                        <li key={i} className="text-xs text-destructive">• {i}</li>
                      ))}
                    </ul>
                  )}

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="font-bold text-foreground">RLS: </span>
                      <span className={t.rls_enabled ? "text-primary" : "text-destructive"}>
                        {t.rls_enabled ? "활성화됨" : "비활성화"}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-foreground mb-1">정책 ({t.policies.length})</p>
                      <div className="space-y-1 pl-2">
                        {t.policies.map((p) => (
                          <div key={p.name} className="text-muted-foreground">
                            <span className="font-mono text-foreground/80">{p.cmd}</span>{" "}
                            <span className="text-foreground/60">{p.roles}</span> — {p.name}
                          </div>
                        ))}
                        {t.policies.length === 0 && <p className="text-destructive">정책 없음</p>}
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-foreground mb-1">GRANT</p>
                      <div className="space-y-1 pl-2">
                        {t.grants.map((g) => (
                          <div key={g.grantee} className="text-muted-foreground">
                            <span className="font-mono text-foreground/80">{g.grantee}</span>:{" "}
                            {g.privileges}
                          </div>
                        ))}
                        {t.grants.length === 0 && <p className="text-destructive">GRANT 없음</p>}
                      </div>
                    </div>
                  </div>
                </PpuriCard>
              );
            })}
          </>
        )}
      </div>
    </Layout>
  );
}
