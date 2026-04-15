/**
 * 🐿️ 뿌리 다람쥐 컨텍스트 인식 대사 엔진
 * 사용자의 상황에 따라 다람쥐가 다르게 반응합니다.
 */

import type { MascotMood } from "@/components/Mascot";

interface UserContext {
  displayName: string;
  streak: number;
  longestStreak: number;
  totalSentences: number;
  currentLevel: number;
  todayDone: boolean;
  lastSentenceDate: string | null;
  holdingNames?: string[]; // 보유 종목 한글명
}

interface MascotMessage {
  text: string;
  mood: MascotMood;
}

function daysSinceLastVisit(lastDate: string | null): number {
  if (!lastDate) return 999; // never visited
  const last = new Date(lastDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / 86400000);
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
}

function getProgressPercent(totalSentences: number, currentLevel: number): number {
  const thresholds = [0, 10, 30, 60, 100, 180];
  const idx = Math.min(currentLevel - 1, thresholds.length - 2);
  const current = totalSentences - thresholds[idx];
  const needed = thresholds[idx + 1] - thresholds[idx];
  return Math.min((current / needed) * 100, 100);
}

/** 홈 화면 인사 메시지 */
export function getHomeGreeting(ctx: UserContext): MascotMessage {
  const daysSince = daysSinceLastVisit(ctx.lastSentenceDate);
  const time = getTimeOfDay();
  const progress = getProgressPercent(ctx.totalSentences, ctx.currentLevel);
  const name = ctx.displayName;

  // 1️⃣ 첫 방문 (문장 0개)
  if (ctx.totalSentences === 0) {
    return {
      text: `${name}님, 반가워요! 🎉\n첫 도토리를 모으러 같이 가볼까요?`,
      mood: "wave",
    };
  }

  // 2️⃣ 오랜만에 복귀 (3일 이상)
  if (daysSince >= 7) {
    return {
      text: `${name}님, 정말 보고싶었어요! 🥺\n다시 돌아와줘서 너무 기뻐요. 천천히 시작해봐요!`,
      mood: "wave",
    };
  }
  if (daysSince >= 3) {
    return {
      text: `${name}님, 돌아왔군요! 😊\n걱정했어요~ 오늘부터 다시 같이 달려봐요!`,
      mood: "wave",
    };
  }

  // 3️⃣ 오늘 이미 완료
  if (ctx.todayDone) {
    if (ctx.streak >= 7) {
      return {
        text: `${ctx.streak}일 연속! 🔥\n${name}님은 이미 투자 고수예요!\n내일도 꼭 만나요! 🐿️`,
        mood: "celebrate",
      };
    }
    if (ctx.streak >= 3) {
      return {
        text: `오늘도 완료! 연속 ${ctx.streak}일째! ✨\n이 기세면 최장 기록도 금방이에요!`,
        mood: "celebrate",
      };
    }
    return {
      text: `오늘 레슨 완료! 😊\n내일도 도토리를 모아봐요 🌰`,
      mood: "celebrate",
    };
  }

  // 4️⃣ 레벨업 임박 (90% 이상)
  if (progress >= 90) {
    return {
      text: `거의 다 왔어요! 🎯\n다음 레벨까지 정말 조금 남았어요!\n오늘 레슨하면 진화할 수 있을지도...! 🐿️✨`,
      mood: "thinking",
    };
  }

  // 5️⃣ 연속 기록 유지 중
  if (ctx.streak >= 5) {
    return {
      text: `${ctx.streak}일 연속 기록 중! 🔥\n오늘도 이어가볼까요? 멈추면 아쉬워요!`,
      mood: "default",
    };
  }

  // 6️⃣ 보유 종목 언급
  if (ctx.holdingNames && ctx.holdingNames.length > 0) {
    const randomHolding = ctx.holdingNames[Math.floor(Math.random() * ctx.holdingNames.length)];
    const holdingMessages = [
      `${randomHolding} 보유 중이시죠? 오늘 한 문장으로 투자 마인드를 다져봐요! 💪`,
      `${randomHolding}에 대해 더 깊이 생각해볼까요? 오늘의 레슨이 기다려요! 🌰`,
      `${randomHolding} 투자자로서 한 단계 성장하는 시간! 오늘도 시작해볼까요? 🐿️`,
    ];
    return {
      text: holdingMessages[Math.floor(Math.random() * holdingMessages.length)],
      mood: "default",
    };
  }

  // 7️⃣ 시간대별 기본 인사
  const timeGreetings: Record<string, MascotMessage> = {
    morning: { text: `좋은 아침이에요! ☀️\n오늘의 도토리를 모으러 가볼까요?`, mood: "wave" },
    afternoon: { text: `좋은 오후네요! 🌤️\n잠깐의 투자 공부, 같이 해볼까요?`, mood: "default" },
    evening: { text: `오늘 하루 어떠셨어요? 🌙\n자기 전에 한 문장만 써볼까요?`, mood: "thinking" },
    night: { text: `늦은 시간까지 열심히! 🌟\n오늘의 레슨을 마무리해봐요!`, mood: "thinking" },
  };
  return timeGreetings[time];
}

/** 스트릭 깨졌을 때 위로 메시지 */
export function getStreakBrokenMessage(previousStreak: number): MascotMessage {
  if (previousStreak >= 7) {
    return {
      text: `${previousStreak}일 기록이 끊겼지만...\n괜찮아요! 이미 ${previousStreak}일이나 해냈잖아요! 💪\n새로운 기록을 만들어봐요!`,
      mood: "wave",
    };
  }
  return {
    text: `연속 기록이 리셋됐어요 🥺\n하지만 다시 시작하는 것도 용기예요!\n오늘부터 1일! 같이 가보자! 🐿️`,
    mood: "wave",
  };
}

/** 퀴즈 정답 시 칭찬 메시지 (연속 정답 수에 따라 다름) */
export function getCorrectMessage(streak: number): string {
  if (streak >= 5) return "미쳤어요! 투자 천재! 🧠🔥";
  if (streak >= 3) return "연속 정답! 완전 대단해요! 🌟";
  if (streak >= 2) return "또 맞았어요! 이 기세 좋아요! ✨";
  const messages = [
    "정말 잘했어요! 🎉",
    "맞아요! 역시 똑똑해요! 💡",
    "정답! 도토리 하나 획득! 🌰",
    "훌륭해요! 투자 센스가 빛나요! ⭐",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/** 퀴즈 오답 시 응원 메시지 */
export function getWrongMessage(): string {
  const messages = [
    "아쉬워요! 하지만 틀려야 배우는 거예요 🌱",
    "괜찮아요! 이 개념은 다음에 꼭 맞출 거예요 💪",
    "실수는 최고의 선생님이에요! 다음 문제 가볼까요? 🐿️",
    "이런! 하지만 지금 배운 거잖아요! 그게 중요해요 😊",
    "아깝다! 이 문제 다음에 또 나오면 맞출 수 있겠죠? 🎯",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/** 레슨 시작 전 동기부여 */
export function getLessonMotivation(totalSentences: number, streak: number): string {
  if (totalSentences === 0) return "첫 번째 도토리를 모아볼까요? 작은 한 걸음이 큰 나무가 돼요! 🌱";
  if (streak >= 5) return `${streak}일 연속! 오늘도 투자 근육을 키워봐요! 💪`;
  if (totalSentences >= 50) return "50문장 넘긴 당신, 이미 상위 투자자예요! 🏆";
  return "매일 한 문장이 투자 실력을 만들어요. 시작해볼까요? 🌰";
}

/** 레슨 완료 후 인사이트 */
export function getCompletionInsight(accuracy: number, isRepeat: boolean): string {
  if (isRepeat) {
    return "반복은 복리의 마법이에요. 복습할수록 투자 판단이 단단해져요! 📚";
  }
  if (accuracy === 100) return "완벽한 점수! 이렇게 공부하는 투자자는 감정에 흔들리지 않아요! 🧠";
  if (accuracy >= 67) return "좋은 점수예요! 꾸준히 공부하는 투자자가 결국 이겨요! 📈";
  return "오늘 틀린 문제들이 내일의 올바른 투자 판단이 돼요. 포기하지 마세요! 🌱";
}

/** 빈 상태 메시지 */
export function getEmptyStateMessage(type: "holdings" | "sentences" | "archive"): { title: string; subtitle: string; emoji: string } {
  switch (type) {
    case "holdings":
      return {
        emoji: "🐿️",
        title: "아직 보유 종목이 없어요",
        subtitle: "종목을 추가하면 맞춤 질문으로\n투자 마인드를 훈련할 수 있어요!",
      };
    case "sentences":
      return {
        emoji: "📝",
        title: "첫 문장을 기다리고 있어요",
        subtitle: "오늘의 레슨에서 첫 도토리를 모아볼까요?\n한 문장이 투자의 씨앗이 돼요! 🌱",
      };
    case "archive":
      return {
        emoji: "📖",
        title: "아직 기록이 없어요",
        subtitle: "레슨을 완료하면 여기에\n나만의 투자 일기가 쌓여요!",
      };
  }
}

/** 로딩 중 한마디 */
export function getLoadingMessage(): string {
  const messages = [
    "도토리를 모으는 중... 🌰",
    "오늘의 레슨을 준비 중... 📚",
    "뿌리가 열심히 준비 중이에요... 🐿️",
    "투자 지식을 꺼내는 중... 💡",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/** 퀴즈 질문이 왜 중요한지 한 줄 설명 */
export function getQuizWhyItMatters(category: string): string {
  const reasons: Record<string, string> = {
    behavioral: "이 질문은 투자할 때 빠지기 쉬운 심리적 함정을 알려줘요",
    basics: "기본기가 탄탄해야 흔들리지 않는 투자를 할 수 있어요",
    risk: "리스크를 이해하면 공포에 팔고 탐욕에 사는 실수를 줄일 수 있어요",
    strategy: "전략이 있으면 시장이 출렁여도 흔들리지 않아요",
  };
  return reasons[category] || "이 지식이 쌓이면 더 현명한 투자 결정을 내릴 수 있어요 💡";
}
