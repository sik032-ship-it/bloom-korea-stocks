import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_BODY_BYTES = 20_000;

/** Returns a Response to send back if the request must be rejected, otherwise null. */
export async function guardRequest(req: Request, cors: Record<string, string>): Promise<Response | null> {
  const deny = (msg: string, status: number) =>
    new Response(JSON.stringify({ error: msg }), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method !== "POST") return deny("method_not_allowed", 405);
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) return deny("payload_too_large", 413);

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return deny("unauthorized", 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data, error } = await supabase.auth.getClaims(auth.slice(7));
  if (error || !data?.claims?.sub || data.claims.role !== "authenticated") return deny("unauthorized", 401);
  return null;
}
