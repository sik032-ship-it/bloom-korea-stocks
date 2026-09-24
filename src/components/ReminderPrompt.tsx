import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PpuriButton } from "@/components/PpuriButton";
import { toast } from "sonner";

export const REMINDER_ASK_FLAG = "ppuri:ask-reminder";
// 푸시 발송 서버 키(공개키). 설정되면 기기 구독까지 저장한다.
export const VAPID_PUBLIC_KEY = "BOet9F74PEoNgFsqJnCItXA2lbCRrJ-1sQDPcHNFJwG5BHMx6Rd-AnQFkDyCykoxoOga1aPLtvPT-ZEQBMEw2dM";

export function canUseServiceWorker() {
  if (!("serviceWorker" in navigator)) return false;
  let inIframe = false;
  try { inIframe = window.self !== window.top; } catch { inIframe = true; }
  const host = window.location.hostname;
  // 미리보기 환경에서는 서비스 워커를 등록하지 않는다
  return !inIframe && !host.includes("id-preview--") && !host.includes("lovableproject.com");
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function trySubscribe(): Promise<PushSubscriptionJSON | null> {
  if (!VAPID_PUBLIC_KEY || !canUseServiceWorker() || !("PushManager" in window)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return sub.toJSON();
  } catch (e) {
    console.warn("[reminder] subscribe failed", e);
    return null;
  }
}

/** 온보딩 완료 직후 홈에서 1회 노출되는 '저녁 8시 도토리 알림' 요청 */
export function ReminderPrompt() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setOpen(localStorage.getItem(REMINDER_ASK_FLAG) === "1"); } catch { /* noop */ }
  }, []);

  const close = () => {
    try { localStorage.removeItem(REMINDER_ASK_FLAG); } catch { /* noop */ }
    setOpen(false);
  };

  const save = async (enabled: boolean, permission: string, sub: PushSubscriptionJSON | null) => {
    if (!user) return;
    await supabase.from("reminder_preferences").upsert({
      user_id: user.id,
      enabled,
      remind_time: "20:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul",
      permission,
      push_subscription: sub as never,
      asked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const accept = async () => {
    setBusy(true);
    let permission = "unsupported";
    if ("Notification" in window) {
      try { permission = await Notification.requestPermission(); } catch { permission = "error"; }
    }
    const sub = permission === "granted" ? await trySubscribe() : null;
    await save(permission === "granted" && !!sub, permission, sub);
    setBusy(false);
    close();
    if (permission === "granted") toast.success("매일 저녁 8시에 도토리가 찾아갈게요 🌰");
    else if (!canUseServiceWorker()) toast("미리보기 화면에선 알림을 켤 수 없어요. 게시된 앱에서 다시 시도해 주세요.");
    else toast("알림이 꺼져 있어요. 설정에서 언제든 켤 수 있어요.");
  };

  const decline = async () => {
    await save(false, "declined", null);
    close();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-foreground/40 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-background rounded-2xl p-6 text-center shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Bell className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-title font-bold text-foreground">매일 저녁 8시 도토리 알림 받을래요?</h3>
        <p className="text-small text-muted-foreground mt-2">
          하루 1분, 잊지 않도록 살짝 알려드릴게요. 스트릭을 지키는 가장 쉬운 방법이에요.
        </p>
        <PpuriButton fullWidth className="mt-5" onClick={accept} disabled={busy}>
          {busy ? "설정 중..." : "네, 알려주세요"}
        </PpuriButton>
        <button onClick={decline} className="w-full mt-2 py-3 text-small text-muted-foreground">
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
