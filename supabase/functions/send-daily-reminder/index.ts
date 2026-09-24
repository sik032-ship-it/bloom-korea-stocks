// 매일 20:00 KST 실행: 알림을 켠 사용자 중 오늘 레슨을 아직 안 한 사람에게 웹 푸시 발송
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import webpush from "npm:web-push@3.6.7";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET_PPURI")) return json({ error: "forbidden" }, 403);

  const pub = Deno.env.get("VAPID_PUBLIC_KEY");
  const priv = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!pub || !priv) return json({ error: "VAPID keys missing" }, 500);
  webpush.setVapidDetails("mailto:support@ppuri.app", pub, priv);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const todayKST = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const body = await req.json().catch(() => ({}));
  const onlyUser: string | undefined = typeof body?.user_id === "string" ? body.user_id : undefined;

  let q = admin.from("reminder_preferences").select("user_id, push_subscription").eq("enabled", true).not("push_subscription", "is", null);
  if (onlyUser) q = q.eq("user_id", onlyUser);
  const { data: prefs, error } = await q;
  if (error) return json({ error: error.message }, 500);

  const ids = (prefs ?? []).map((p) => p.user_id);
  const { data: profiles } = ids.length
    ? await admin.from("profiles").select("id, last_sentence_date, current_streak").in("id", ids)
    : { data: [] as { id: string; last_sentence_date: string | null; current_streak: number }[] };
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));

  let sent = 0, skipped = 0, removed = 0;
  for (const p of prefs ?? []) {
    const prof = pmap.get(p.user_id);
    if (!onlyUser && prof?.last_sentence_date === todayKST) { skipped++; continue; }
    const streak = prof?.current_streak ?? 0;
    const payload = JSON.stringify({
      title: "도토리가 기다려요 🌰",
      body: streak > 0 ? `${streak}일 연속 기록을 지켜요. 오늘의 레슨은 3분이면 끝나요.` : "오늘의 1분 레슨으로 뿌리를 키워볼까요?",
      url: "/?from=reminder",
    });
    try {
      await webpush.sendNotification(p.push_subscription as webpush.PushSubscription, payload, { TTL: 3600 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await admin.from("reminder_preferences").update({ push_subscription: null }).eq("user_id", p.user_id);
        removed++;
      } else console.error("[reminder] send failed", p.user_id, code, (e as Error).message);
    }
  }
  return json({ ok: true, sent, skipped, removed });
});
