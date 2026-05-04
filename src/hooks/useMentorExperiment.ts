// 멘토 카드 A/B 실험 훅
// - 사용자에게 결정론적으로 variant 할당
// - impression/cta_click/secondary/dismiss 이벤트를 backend에 기록
// - 실패해도 UI는 절대 막지 않음 (silent fire-and-forget)

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  pickVariant,
  type MentorPlacement,
  type MentorVariant,
} from "@/data/mentorVariants";

type EventType = "impression" | "cta_click" | "secondary_click" | "dismiss";

export function useMentorExperiment(
  placement: MentorPlacement,
  enabled: boolean = true,
  context?: Record<string, unknown>,
) {
  const { user } = useAuth();
  const userId = user?.id ?? "anon";
  const variant: MentorVariant = useMemo(
    () => pickVariant(placement, userId),
    [placement, userId],
  );

  const impressionLogged = useRef(false);

  const log = useCallback(
    (event_type: EventType, extra?: Record<string, unknown>) => {
      if (!user) return;
      // fire-and-forget; 실패는 콘솔에만
      void supabase
        .from("mentor_card_events")
        .insert({
          user_id: user.id,
          placement,
          variant_id: variant.id,
          event_type,
          context: { ...(context ?? {}), ...(extra ?? {}) },
        })
        .then(({ error }) => {
          if (error) console.warn("[mentor-exp] log failed", error.message);
        });
    },
    [user, placement, variant.id, context],
  );

  // 마운트 시 1회 impression
  useEffect(() => {
    if (!enabled || !user || impressionLogged.current) return;
    impressionLogged.current = true;
    log("impression");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user]);

  return { variant, log };
}
