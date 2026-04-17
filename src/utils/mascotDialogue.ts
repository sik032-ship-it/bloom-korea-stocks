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
    return {
      text: `${name}님, 환영해요! 🌱\n오늘 첫 문장을 써보면 평생의 투자 습관이 시작돼요.\n같이 작은 도토리부터 모아볼까요? 🌰`,
      mood: "wave",
    };
  }
  if (ctx.totalSentences < 3) {
    return {
      text: `${name}님, 좋은 시작이에요! ✨\n3개만 더 쓰면 첫 레벨 진화가 가까워져요!`,
      mood: "celebrate",
    };
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
  // 7가지 핵심 원칙을 자연스럽게 녹인 동기부여 메시지
  const principles = [
    "FOMO를 느끼지 않는 것도 능력이에요. 오늘도 '나만의 기준'으로 생각해봐요 🛡️",
    "과거 하락은 기회로 보이지만, 지금의 하락은 위험으로 느껴지죠? 이 차이를 아는 것이 힘이에요 💡",
    "돈의 진짜 가치는 시간을 통제할 수 있는 자유예요. 오늘의 공부가 그 자유를 만들어요 ⏰",
    "기대가 수입보다 빨리 커지면 영원히 만족할 수 없어요. 오늘 '충분함'에 대해 생각해봐요 🌱",
    "위험은 변하지 않아요. 변하는 건 위험을 얼마나 모르고 있었는지예요. 오늘 한 걸음 더 알아가봐요 🔍",
    "자기도 모르게 감정에 휘둘리는 순간, 그걸 인식하는 것 자체가 투자 실력이에요 🧠",
  ];
  
  if (totalSentences === 0) return "오늘부터 '생각하는 투자자'가 되는 여정을 시작해요! 🌱";
  if (streak >= 5) return `${streak}일 연속! ${principles[Math.floor(Math.random() * principles.length)]}`;
  if (totalSentences >= 50) return principles[Math.floor(Math.random() * principles.length)];
  return "오늘의 질문은 당신의 투자 판단력을 한 단계 높여줄 거예요 🌰";
}

/** 레슨 완료 후 인사이트 — 7가지 핵심 원칙 기반 */
export function getCompletionInsight(accuracy: number, isRepeat: boolean): string {
  if (isRepeat) {
    return "복습은 위기 때 '아는 것'과 '행동하는 것'의 간극을 줄여줘요. 아는 것을 행동으로 옮기는 것이 진짜 실력이에요 📚";
  }
  
  const deepInsights = [
    // 경제적 불확실성
    "경제적 불확실성은 거의 변하지 않아요. 달라지는 건 사람들이 위험을 얼마나 잊고 있었는지예요. 오늘의 공부가 '잊지 않는 힘'을 키워줘요 🔍",
    // 부 쌓기
    "진짜 부자는 많이 버는 사람이 아니라, 기대를 관리하는 사람이에요. 자존심을 수입 아래로 유지하는 게 첫걸음이에요 💰",
    // FOMO
    "FOMO가 없다는 건 '남의 수익에 흔들리지 않는다'는 뜻이에요. 이것만으로도 상위 10% 투자자예요 🛡️",
    // 과거 vs 미래
    "10년 후에 '왜 그때 안 샀을까'라고 할 오늘의 하락이 있을 수 있어요. 미래 하락을 기회로 볼 수 있는 눈을 키우세요 👁️",
    // 시간 가치
    "돈의 진짜 배당은 수익률이 아니라 시간의 자유예요. 아침에 '오늘 뭘 하고 싶은가'를 선택할 수 있는 삶, 그게 투자의 목표예요 ⏰",
    // 무의식적 편향
    "자기가 감정에 영향받지 않는다고 생각하는 순간이 가장 위험해요. 오늘 이걸 연습한 것 자체가 대단해요 🧠",
    // 자기 통제
    "위기에서 버티는 힘은 '지식'이 아니라 '습관'에서 나와요. 매일 한 문장이 그 습관을 만들어요 🌱",
  ];
  
  if (accuracy === 100) {
    return `완벽! ${deepInsights[Math.floor(Math.random() * deepInsights.length)]}`;
  }
  if (accuracy >= 67) {
    return deepInsights[Math.floor(Math.random() * deepInsights.length)];
  }
  return `틀려도 괜찮아요. ${deepInsights[Math.floor(Math.random() * deepInsights.length)]}`;
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
