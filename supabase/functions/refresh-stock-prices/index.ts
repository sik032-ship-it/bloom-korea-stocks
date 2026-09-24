// 매주 실행: 앱에 나오는 "N배" 계산용 종목의 최근 종가를 Yahoo Finance에서 받아 저장
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TICKERS = ["NVDA", "AAPL", "AMZN", "MSFT", "GOOGL", "BRK.B", "KO", "WMT", "AXP", "GS", "MCD", "WFC"];

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function fetchClose(ticker: string): Promise<{ price: number; asOf: string } | null> {
  const sym = ticker.replace(".", "-");
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=5d&interval=1d`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const meta = (await res.json())?.chart?.result?.[0]?.meta;
  const price = Number(meta?.regularMarketPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { price: Math.round(price * 100) / 100, asOf: new Date(meta.regularMarketTime * 1000).toISOString().slice(0, 10) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET_PPURI")) return json({ error: "forbidden" }, 403);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const rows: { ticker: string; price: number; as_of: string; updated_at: string }[] = [];
  const failed: string[] = [];
  for (const t of TICKERS) {
    try {
      const r = await fetchClose(t);
      if (r) rows.push({ ticker: t, price: r.price, as_of: r.asOf, updated_at: new Date().toISOString() });
      else failed.push(t);
    } catch { failed.push(t); }
  }
  // 받지 못한 종목은 기존 값을 그대로 둔다 (잘못된 0이나 빈 값으로 덮어쓰지 않음)
  if (rows.length) {
    const { error } = await admin.from("stock_prices").upsert(rows, { onConflict: "ticker" });
    if (error) return json({ error: error.message }, 500);
  }
  return json({ ok: true, updated: rows.length, failed });
});
