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
  holdingNames?: string[];
}

interface MascotMessage {
  text: string;
  mood: MascotMood;
}

function daysSinceLastVisit(lastDate: string | null): number {
  if (!lastDate) return 999;
  const last = new Date(lastDate);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / 86400000);
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

  if (ctx.totalSentences === 0) {
    return { text: `${name}님, 반가워요! 🎉\n첫 도토리를 모으러 같이 가볼까요?`, mood: "wave" };
  }
  if (daysSince >= 7) {
    return { text: `${name}님, 정말 보고싶었어요! 🥺\n다시 돌아와줘서 너무 기뻐요. 천천히 시작해봐요!`, mood: "wave" };
  }
  if (daysSince >= 3) {
    return { text: `${name}님, 돌아왔군요! 😊\n걱정했어요~ 오늘부터 다시 같이 달려봐요!`, mood: "wave" };
  }
  if (ctx.todayDone) {
    if (ctx.streak >= 7) return { text: `${ctx.streak}일 연속! 🔥\n${name}님은 이미 투자 고수예요!\n내일도 꼭 만나요! 🐿️`, mood: "celebrate" };
    if (ctx.streak >= 3) return { text: `오늘도 완료! 연속 ${ctx.streak}일째! ✨\n이 기세면 최장 기록도 금방이에요!`, mood: "celebrate" };
    return { text: `오늘 레슨 완료! 😊\n내일도 도토리를 모아봐요 🌰`, mood: "celebrate" };
  }
  if (progress >= 90) {
    return { text: `거의 다 왔어요! 🎯\n다음 레벨까지 정말 조금 남았어요!\n오늘 레슨하면 진화할 수 있을지도...! 🐿️✨`, mood: "thinking" };
  }
  if (ctx.streak >= 5) {
    return { text: `${ctx.streak}일 연속 기록 중! 🔥\n오늘도 이어가볼까요? 멈추면 아쉬워요!`, mood: "default" };
  }
  if (ctx.holdingNames && ctx.holdingNames.length > 0) {
    const h = ctx.holdingNames[Math.floor(Math.random() * ctx.holdingNames.length)];
    const msgs = [
      `${h} 보유 중이시죠? 오늘 한 문장으로 투자 마인드를 다져봐요! 💪`,
      `${h}에 대해 더 깊이 생각해볼까요? 오늘의 레슨이 기다려요! 🌰`,
    ];
    return { text: msgs[Math.floor(Math.random() * msgs.length)], mood: "default" };
  }
  const timeGreetings: Record<string, MascotMessage> = {
    morning: { text: `좋은 아침이에요! ☀️\n오늘의 도토리를 모으러 가볼까요?`, mood: "wave" },
    afternoon: { text: `좋은 오후네요! 🌤️\n잠깐의 투자 공부, 같이 해볼까요?`, mood: "default" },
    evening: { text: `오늘 하루 어떠셨어요? 🌙\n자기 전에 한 문장만 써볼까요?`, mood: "thinking" },
    night: { text: `늦은 시간까지 열심히! 🌟\n오늘의 레슨을 마무리해봐요!`, mood: "thinking" },
  };
  return timeGreetings[time];
}

export function getStreakBrokenMessage(previousStreak: number): MascotMessage {
  if (previousStreak >= 7) {
    return { text: `${previousStreak}일 기록이 끊겼지만...\n괜찮아요! 이미 ${previousStreak}일이나 해냈잖아요! 💪\n새로운 기록을 만들어봐요!`, mood: "wave" };
  }
  return { text: `연속 기록이 리셋됐어요 🥺\n하지만 다시 시작하는 것도 용기예요!\n오늘부터 1일! 같이 가보자! 🐿️`, mood: "wave" };
}

export function getCorrectMessage(streak: number): string {
  if (streak >= 5) return "미쳤어요! 투자 사고력 천재! 🧠🔥";
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

export function getWrongMessage(): string {
  const messages = [
    "아쉬워요! 하지만 이런 실수가 실전에서 돈을 지켜줘요 🛡️",
    "괜찮아요! 여기서 배우면 실전에서 안 틀려요 💪",
    "실수는 최고의 선생님이에요! 이 교훈이 위기 때 빛날 거예요 🐿️",
    "이런! 하지만 지금 이 깨달음이 나중에 큰 손실을 막아줄 거예요 😊",
    "아깝다! 이 개념을 체화하면 감정에 휘둘리지 않는 투자자가 돼요 🎯",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getLessonMotivation(totalSentences: number, streak: number): string {
  if (totalSentences === 0) return "오늘부터 '생각하는 투자자'가 되는 여정을 시작해요! 🌱";
  if (streak >= 5) return `${streak}일 연속! 매일 사고력을 키우는 당신, 이미 상위 투자자예요 💪`;
  if (totalSentences >= 50) return "50문장 넘긴 당신은 이미 감정이 아닌 원칙으로 투자하는 사람이에요 🏆";
  return "오늘의 질문은 당신의 투자 판단력을 한 단계 높여줄 거예요 🌰";
}

/** 레슨 완료 후 인사이트 — 사고방식 중심 + 실제 위기 사례 */
export function getCompletionInsight(accuracy: number, isRepeat: boolean): string {
  if (isRepeat) {
    return "2008년 금융위기에서 살아남은 투자자들의 공통점은 '반복 학습'이었어요. 복습은 위기 때 흔들리지 않는 근육이에요 📚";
  }
  if (accuracy === 100) {
    const insights = [
      "완벽! 코로나 폭락(2020.3) 때 버핏은 항공주만 팔고 나머지는 유지했어요. 냉정한 판단력이 핵심이에요 🧠",
      "만점! 2008년 리먼 사태에서 레이 달리오가 살아남은 이유는 '내가 틀릴 수 있다'는 겸손함이었어요 ⭐",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }
  if (accuracy >= 67) {
    const insights = [
      "좋은 점수! 닷컴 버블(2000) 때 피터 린치는 '아는 것에만 투자하라'고 했어요. 이해가 곧 방어예요 📈",
      "잘했어요! 1987년 블랙먼데이에서도 시장은 2년 안에 회복했어요. 버티는 능력이 곧 수익이에요 💪",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }
  const insights = [
    "괜찮아요! 2008년 금융위기 때 패닉에 판 사람은 회복을 경험하지 못했어요. 배우는 것 자체가 준비예요 🌱",
    "틀려도 OK! 다니엘 카너먼도 '자기 편향을 아는 것만으로도 절반은 이긴 것'이라 했어요 📖",
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

export function getEmptyStateMessage(type: "holdings" | "sentences" | "archive"): { title: string; subtitle: string; emoji: string } {
  switch (type) {
    case "holdings":
      return { emoji: "🐿️", title: "아직 보유 종목이 없어요", subtitle: "종목을 추가하면 맞춤 질문으로\n투자 마인드를 훈련할 수 있어요!" };
    case "sentences":
      return { emoji: "📝", title: "첫 문장을 기다리고 있어요", subtitle: "오늘의 레슨에서 첫 도토리를 모아볼까요?\n한 문장이 투자의 씨앗이 돼요! 🌱" };
    case "archive":
      return { emoji: "📖", title: "아직 기록이 없어요", subtitle: "레슨을 완료하면 여기에\n나만의 투자 일기가 쌓여요!" };
  }
}

export function getLoadingMessage(): string {
  const messages = [
    "도토리를 모으는 중... 🌰",
    "오늘의 사고력 훈련을 준비 중... 📚",
    "뿌리가 열심히 준비 중이에요... 🐿️",
    "위기 대처 능력을 꺼내는 중... 💡",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getQuizWhyItMatters(category: string): string {
  const reasons: Record<string, string> = {
    risk: "이 질문은 위험을 제대로 이해하는 사고방식을 길러줘요. 금융지식보다 먼저 배워야 할 것이에요",
    psychology: "감정을 이해하면 공포에 팔고 탐욕에 사는 실수를 줄일 수 있어요",
    crisis: "위기 대처 능력은 실전에서 생존을 결정해요. 미리 연습해야 해요",
    judgment: "올바른 판단력은 정보량이 아니라 사고의 깊이에서 나와요",
  };
  return reasons[category] || "이 사고방식이 쌓이면 어떤 시장 환경에서도 흔들리지 않는 투자자가 돼요 💡";
}
