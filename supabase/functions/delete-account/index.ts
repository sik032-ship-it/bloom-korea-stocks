import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// 회원 탈퇴: 본인 인증 후 모든 개인 데이터와 계정을 영구 삭제한다. 개인정보는 로그에 남기지 않는다.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data, error } = await userClient.auth.getClaims(auth.slice(7));
  const userId = data?.claims?.sub;
  if (error || !userId || data.claims.role !== "authenticated") return json({ error: "unauthorized" }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const tables: Array<[string, string]> = [
    ["sentences", "user_id"],
    ["holdings", "user_id"],
    ["quiz_attempts", "user_id"],
    ["crisis_results", "user_id"],
    ["reminder_preferences", "user_id"],
    ["mentor_card_events", "user_id"],
    ["onboarding_events", "user_id"],
    ["subscriptions", "user_id"],
    ["user_roles", "user_id"],
    ["profiles", "id"],
  ];
  for (const [table, col] of tables) {
    const { error: delErr } = await admin.from(table).delete().eq(col, userId);
    if (delErr) {
      console.error("delete-account: table cleanup failed", table, delErr.code);
      return json({ error: "delete_failed" }, 500);
    }
  }
  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error("delete-account: auth delete failed", authErr.status);
    return json({ error: "delete_failed" }, 500);
  }
  return json({ ok: true });
});
