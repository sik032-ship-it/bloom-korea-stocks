import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mascot } from "@/components/Mascot";
import { PpuriButton } from "@/components/PpuriButton";
import { ShareCard } from "@/components/ShareCard";
import { GrowthComparison } from "@/components/GrowthComparison";
import { Shield, TrendingDown, Flame, Waves, Landmark, DollarSign, BarChart3, TrendingUp, Trophy, Zap, Share2, Sparkles, Loader2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { MascotMood } from "@/components/Mascot";

interface CrisisScenario {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  historicalContext: string;
  steps: CrisisStep[];
}

interface CrisisStep {
  situation: string;
  emotion: string;
  options: { text: string; score: number; feedback: string }[];
}

interface CrisisRecord {
  id: string;
  scenario_id: string;
  scenario_title: string;
  score: number;
  max_score: number;
  score_percentage: number;
  step_scores: number[];
  completed_at: string;
}

const scenarios: CrisisScenario[] = [
  {
    id: "crash-30",
    title: "시장 대폭락 -30%",
    icon: TrendingDown,
    iconColor: "#EF4444",
    description: "S&P 500이 한 달 만에 30% 폭락했습니다.\n뉴스는 '역대 최악의 하락'을 연일 보도하고 있어요.",
    historicalContext: "2020년 3월 코로나 폭락 때 실제 일어난 일이에요. S&P 500은 33일 만에 34% 떨어졌지만, 5개월 만에 완전 회복했어요.",
    steps: [
      {
        situation: "포트폴리오가 -30%입니다. 뉴스에서는 '더 떨어질 수 있다'고 합니다. 가족과 친구들이 '다 팔아'라고 말합니다.",
        emotion: "공포, 불안, 압박감",
        options: [
          { text: "미리 세운 투자 원칙을 다시 읽어본다", score: 3, feedback: "훌륭해요! 감정이 극에 달할 때 원칙으로 돌아가는 것이 프로 투자자의 습관이에요." },
          { text: "전부 매도하고 현금화한다", score: 0, feedback: "2020년 코로나 폭락 때 바닥에서 판 투자자는 이후 100% 상승을 놓쳤어요." },
          { text: "레버리지로 더 매수한다", score: 1, feedback: "용기는 좋지만, 바닥을 모르는 상황에서 레버리지는 매우 위험해요." },
          { text: "뉴스를 끄고 한 달간 확인하지 않는다", score: 2, feedback: "'아무것도 안 하는 것'이 패닉 매도보다 훨씬 나은 결과를 가져와요." },
        ],
      },
      {
        situation: "3주가 지났습니다. 시장은 10% 반등했지만, 전문가들은 '데드캣 바운스'라고 경고합니다.",
        emotion: "혼란, 불확실성",
        options: [
          { text: "기업의 기본 가치가 변했는지 하나씩 분석한다", score: 3, feedback: "최고의 선택! 버핏은 항공 산업의 구조적 변화를 인식하고 항공주만 팔았어요." },
          { text: "이전에 팔았다면 지금이라도 다시 산다", score: 1, feedback: "타이밍을 맞추려는 시도는 위험해요." },
          { text: "전문가 의견을 따라 추가 매도한다", score: 0, feedback: "전문가도 바닥을 맞추지 못해요." },
          { text: "적립식으로 조금씩 추가 매수한다", score: 2, feedback: "DCA는 바닥을 맞출 필요 없이 평균 매수 단가를 낮춰줘요." },
        ],
      },
      {
        situation: "6개월 후, 시장이 완전히 회복했습니다.",
        emotion: "안도, 놀라움",
        options: [
          { text: "이번 경험을 기록하고 위기 대응 매뉴얼을 만든다", score: 3, feedback: "완벽해요! 위기를 겪은 후 기록하는 투자자는 다음 위기에서 더 강해져요." },
          { text: "다행이다, 빨리 잊어버리자", score: 0, feedback: "위기를 잊으면 같은 실수를 반복해요." },
          { text: "다음엔 더 공격적으로 투자해야겠다", score: 1, feedback: "성공 경험이 과잉 확신으로 이어지면 위험해요." },
          { text: "위기 대비 현금 비중을 늘려둔다", score: 2, feedback: "현금은 위기 때 '기회를 잡을 수 있는 무기'가 돼요." },
        ],
      },
    ],
  },
  {
    id: "fomo-bubble",
    title: "FOMO 버블 상황",
    icon: Flame,
    iconColor: "#F59E0B",
    description: "특정 섹터가 6개월 만에 300% 올랐습니다.\n모든 사람이 이 주식 이야기만 하고 있어요.",
    historicalContext: "2021년 밈주식(GME, AMC) 열풍과 유사해요. GameStop은 2주 만에 1,500% 올랐지만, 이후 90% 이상 하락했어요.",
    steps: [
      {
        situation: "동료, 친구, SNS 모두 'OO 주식'으로 몇 배를 벌었다고 자랑합니다. 당신만 놓치고 있는 것 같아요.",
        emotion: "FOMO, 조급함, 소외감",
        options: [
          { text: "내 투자 원칙에 맞는지 냉정하게 분석한다", score: 3, feedback: "FOMO는 가장 비싼 감정이에요." },
          { text: "소액이라도 빨리 산다", score: 1, feedback: "'Foot in the door' 효과 — 점점 더 많은 돈을 넣게 돼요." },
          { text: "전 재산의 50%를 투자한다", score: 0, feedback: "극도로 위험해요!" },
          { text: "SNS를 끊고 내 포트폴리오에 집중한다", score: 2, feedback: "남의 수익은 당신의 투자와 무관해요." },
        ],
      },
      {
        situation: "결국 그 주식을 샀는데, 다음 주에 40% 폭락했습니다.",
        emotion: "후회, 공포, 혼란",
        options: [
          { text: "왜 이 주식을 샀는지 이유를 다시 점검한다", score: 3, feedback: "이유가 FOMO였다면 매도가 맞아요." },
          { text: "물타기로 더 산다", score: 0, feedback: "FOMO로 산 주식에 물타기는 최악이에요." },
          { text: "손실을 인정하고 매도한다", score: 2, feedback: "빨리 인정하고 나오는 것도 용기예요." },
          { text: "SNS에서 다른 의견을 더 찾아본다", score: 1, feedback: "자신만의 분석 기준을 갖는 것이 중요해요." },
        ],
      },
    ],
  },
  {
    id: "recession",
    title: "경기 침체 공포",
    icon: Waves,
    iconColor: "#3B82F6",
    description: "연준이 금리를 급격히 올리고 있습니다.\n경제 전문가 70%가 '침체가 온다'고 예측합니다.",
    historicalContext: "2022년 연준 급격한 금리 인상기와 유사해요. 나스닥은 33% 하락했지만, 2023년에 44% 반등했어요.",
    steps: [
      {
        situation: "금리가 계속 오르고, 기술주가 매일 떨어지고 있어요. '현금이 왕'이라는 말이 나옵니다.",
        emotion: "불안, 무력감",
        options: [
          { text: "자산 배분을 점검하고 필요시 리밸런싱한다", score: 3, feedback: "리밸런싱은 리스크 관리의 핵심이에요." },
          { text: "모든 주식을 팔고 현금으로 전환한다", score: 0, feedback: "2023년 44% 반등을 놓치게 돼요." },
          { text: "방어주로 전부 교체한다", score: 1, feedback: "'전부 교체'는 과잉 반응이에요." },
          { text: "적립식 투자를 계속한다", score: 2, feedback: "침체기에 적립식은 낮은 가격에 더 많이 살 수 있어요." },
        ],
      },
    ],
  },
  {
    id: "rate-hike",
    title: "금리 인상 충격",
    icon: Landmark,
    iconColor: "#6366F1",
    description: "연준이 예상보다 0.75% 추가 인상을 발표했습니다.\n성장주 중심 포트폴리오가 급락하고 있어요.",
    historicalContext: "2022년 연준은 한 해 동안 4.25%를 인상했어요. 나스닥은 33% 하락했지만, 이후 크게 반등했어요.",
    steps: [
      {
        situation: "포트폴리오가 하루 만에 -8%. '예금이 낫다'는 말이 나옵니다.",
        emotion: "당황, 불안, 의심",
        options: [
          { text: "금리 환경에 따른 자산별 영향을 분석하고 비중 조정", score: 3, feedback: "환경에 맞는 조정은 합리적이에요." },
          { text: "성장주를 모두 팔고 예금으로 옮긴다", score: 0, feedback: "금리 정점에서 팔면 최악의 타이밍이에요." },
          { text: "금리 인하를 기다리며 현금만 보유", score: 1, feedback: "금리 인하 시점을 정확히 예측한 전문가는 거의 없었어요." },
          { text: "배당주·가치주 일부 편입해 균형", score: 2, feedback: "포트폴리오를 '적응'시키는 건 전부 바꾸는 것과 달라요." },
        ],
      },
      {
        situation: "6개월 후, 금리가 정점에 도달한 것 같지만 시장은 횡보 중이에요.",
        emotion: "지루함, 피로, 회의감",
        options: [
          { text: "장기 전망이 좋은 기업을 할인 가격에 적립식 매수", score: 3, feedback: "금리 정점은 역사적으로 좋은 매수 시점이었어요." },
          { text: "침체 확인될 때까지 완전 관망", score: 1, feedback: "시장은 경제보다 6개월 먼저 움직여요." },
          { text: "크립토로 방향 전환", score: 0, feedback: "불확실할 때 더 변동성 높은 자산은 위험을 키워요." },
          { text: "포트폴리오 그대로 유지, 정기 점검", score: 2, feedback: "불필요한 매매는 비용만 늘려요." },
        ],
      },
    ],
  },
  {
    id: "inflation-era",
    title: "인플레이션 시대",
    icon: DollarSign,
    iconColor: "#F59E0B",
    description: "소비자 물가가 전년 대비 9% 올랐습니다.\n투자 수익률은 물가를 따라가지 못하고 있어요.",
    historicalContext: "2022년 미국 CPI는 9.1%까지 올랐어요. 1970년대 이후 최고치였고, 금·에너지·실물자산이 강세를 보였어요.",
    steps: [
      {
        situation: "현금의 실질 가치가 매달 줄어듭니다. 은행 이자 3%는 인플레 9%를 못 따라갑니다.",
        emotion: "초조, 강박",
        options: [
          { text: "인플레이션 헷지 자산(원자재, TIPS, 가치주) 추가", score: 3, feedback: "실물 가치가 있는 자산이 인플레에 강해요." },
          { text: "모든 현금을 주식에 넣는다", score: 0, feedback: "인플레이션이 높으면 금리도 올라 주식에도 타격이에요." },
          { text: "부동산에 레버리지로 투자", score: 1, feedback: "고금리 시기 레버리지는 이자 부담이 커요." },
          { text: "TIPS + 배당 성장주 중심으로 리밸런싱", score: 2, feedback: "물가연동채권은 인플레이션에 직접 연동되는 안전한 선택이에요." },
        ],
      },
      {
        situation: "인플레이션이 서서히 낮아지기 시작합니다(9% → 6%).",
        emotion: "혼란, 기대, 경계",
        options: [
          { text: "추이를 지켜보며 단계적으로 성장주 비중 증가", score: 3, feedback: "인플레 하락 → 금리 인하 기대 → 성장주 회복 흐름을 미리 준비하는 현명한 판단." },
          { text: "완전히 잡힐 때까지 기다린다", score: 1, feedback: "완전히 잡히는 시점엔 이미 시장은 올라있어요." },
          { text: "금리 인하 기대에 올인 매수", score: 0, feedback: "기대만으로 올인하면 기대가 빗나갈 때 큰 손실." },
          { text: "현재 전략 유지, 새 정보에 열린 태도", score: 2, feedback: "확신보다 적응력이 중요한 시기예요." },
        ],
      },
    ],
  },
  {
    id: "single-stock-crash",
    title: "보유 종목 급락 -40%",
    icon: BarChart3,
    iconColor: "#EF4444",
    description: "가장 많이 투자한 종목이 실적 발표 후\n하루 만에 -40% 폭락했습니다.",
    historicalContext: "메타는 2022년 -70% 하락 후 2023년 194% 반등. WeWork는 -99% 하락 후 파산. 원인 분석이 핵심이에요.",
    steps: [
      {
        situation: "포트폴리오 30%를 차지하던 종목이 실적 미스로 -40% 급락.",
        emotion: "충격, 공포, 배신감",
        options: [
          { text: "하락 원인이 일시적인지 구조적인지 분석한다", score: 3, feedback: "메타의 2022년은 과도한 투자(일시적), WeWork는 모델 자체의 문제(구조적)." },
          { text: "즉시 전량 매도한다", score: 0, feedback: "메타를 -40%에서 팔면 194% 반등을 놓쳐요." },
          { text: "물타기해서 평균 단가를 낮춘다", score: 1, feedback: "분석 없이 물타기는 '떨어지는 칼날'을 잡는 것." },
          { text: "24시간 냉각 기간을 둔다", score: 2, feedback: "극단적 감정 상태에서의 결정은 대부분 후회로 이어져요." },
        ],
      },
      {
        situation: "분석 결과, 핵심 비즈니스는 건전하나 단기 비용 증가가 원인. 2주 후 -25%로 일부 회복.",
        emotion: "희망, 불안, 갈등",
        options: [
          { text: "논거 유효 → 보유하되 비중 조정", score: 3, feedback: "한 종목 과집중 리스크를 관리하면서 보유하는 것이 최선." },
          { text: "일부 회복했으니 전량 매도", score: 1, feedback: "본전 심리는 감정적 판단이에요." },
          { text: "다시 크게 오를 테니 더 산다", score: 1, feedback: "한 종목 과도한 비중은 위험해요." },
          { text: "다른 종목으로 갈아탄다", score: 0, feedback: "갈아타기는 대부분 수익률을 낮춰요." },
        ],
      },
      {
        situation: "1년 후, 해당 종목은 신고가를 기록. 경험을 돌아볼 시간입니다.",
        emotion: "성찰, 교훈",
        options: [
          { text: "투자 일지에 감정·판단·결과를 모두 기록", score: 3, feedback: "경험의 복리 — 기록하는 투자자만이 쌓을 수 있어요." },
          { text: "다음엔 급락 시 바로 더 사야겠다", score: 1, feedback: "과잉 일반화는 위험해요. 매번 원인 분석이 먼저." },
          { text: "운이 좋았을 뿐이야", score: 0, feedback: "분석 기반 판단이었다면 운이 아니에요." },
          { text: "개별 종목 비중 상한선을 정해둔다", score: 2, feedback: "시스템화는 훌륭해요!" },
        ],
      },
    ],
  },
];

// ===== Growth Chart Component =====
function GrowthChart({ records }: { records: CrisisRecord[] }) {
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);
  
  const recent = records.slice(0, 10).reverse();
  
  useEffect(() => {
    setAnimatedHeights(new Array(recent.length).fill(0));
    recent.forEach((_, i) => {
      setTimeout(() => {
        setAnimatedHeights(prev => {
          const next = [...prev];
          next[i] = recent[i].score_percentage;
          return next;
        });
      }, 150 * (i + 1));
    });
  }, [records.length]);

  if (recent.length === 0) return null;

  const avg = Math.round(recent.reduce((s, r) => s + r.score_percentage, 0) / recent.length);
  const best = Math.max(...recent.map(r => r.score_percentage));
  const trend = recent.length >= 2 
    ? recent[recent.length - 1].score_percentage - recent[0].score_percentage 
    : 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={12} className="text-primary" />
          </div>
          <p className="text-lg font-black text-foreground">{best}%</p>
          <p className="text-[10px] text-muted-foreground">최고 점수</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={12} className="text-primary" />
          </div>
          <p className="text-lg font-black text-foreground">{avg}%</p>
          <p className="text-[10px] text-muted-foreground">평균 점수</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={12} className={trend >= 0 ? "text-primary" : "text-destructive"} />
          </div>
          <p className={`text-lg font-black ${trend >= 0 ? "text-primary" : "text-destructive"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </p>
          <p className="text-[10px] text-muted-foreground">성장 추세</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-primary" />
          <p className="text-xs font-semibold text-foreground">위기 대응 성장 그래프</p>
          <span className="text-[10px] text-muted-foreground ml-auto">{records.length}회 도전</span>
        </div>
        
        <div className="flex items-end gap-1.5 h-32">
          {recent.map((record, i) => {
            const height = animatedHeights[i] || 0;
            const color = height >= 80 ? "bg-primary" 
              : height >= 60 ? "bg-ppuri-blue" 
              : height >= 40 ? "bg-ppuri-amber" 
              : "bg-ppuri-red";
            
            return (
              <div key={record.id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-muted-foreground">
                  {height > 0 ? `${record.score_percentage}` : ""}
                </span>
                <div className="w-full bg-muted rounded-t-md overflow-hidden" style={{ height: "100px" }}>
                  <div 
                    className={`w-full ${color} rounded-t-md transition-all duration-700 ease-out`}
                    style={{ 
                      height: `${height}%`,
                      marginTop: `${100 - height}%`,
                    }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                  {new Date(record.completed_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>

        {records.length >= 3 && (
          <div className="mt-4 pt-3 border-t border-border">
            <SurvivalLevel avg={avg} totalAttempts={records.length} />
          </div>
        )}
      </div>
    </div>
  );
}

function SurvivalLevel({ avg, totalAttempts }: { avg: number; totalAttempts: number }) {
  const levels = [
    { min: 0, label: "신입 투자자", icon: "🌱", color: "#9CA3AF", next: "감정을 인식하는 법을 배우고 있어요" },
    { min: 30, label: "생존자 후보", icon: "🛡️", color: "#F59E0B", next: "감정 조절의 기초가 잡히고 있어요" },
    { min: 50, label: "침착한 생존자", icon: "⚔️", color: "#3B82F6", next: "위기에서 흔들리지 않는 힘이 생기고 있어요" },
    { min: 70, label: "위기 전문가", icon: "🏅", color: "#58CC02", next: "어떤 폭풍에서도 기회를 찾을 수 있어요" },
    { min: 85, label: "불사조 투자자", icon: "🔥", color: "#EF4444", next: "위기가 오히려 당신을 강하게 만들어요" },
  ];
  
  const level = [...levels].reverse().find(l => avg >= l.min) || levels[0];
  const nextLevel = levels[levels.indexOf(level) + 1];
  const progress = nextLevel 
    ? Math.min(100, ((avg - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{level.icon}</span>
        <div>
          <p className="text-xs font-bold text-foreground">{level.label}</p>
          <p className="text-[10px] text-muted-foreground">{level.next}</p>
        </div>
        <span className="text-[10px] text-muted-foreground ml-auto">{totalAttempts}회 생존</span>
      </div>
      {nextLevel && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%`, backgroundColor: level.color }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">→ {nextLevel.label}</span>
        </div>
      )}
    </div>
  );
}

function getSurvivalInfo(records: CrisisRecord[]) {
  if (records.length < 3) return { label: "신입 투자자", icon: "🌱" };
  const avg = Math.round(records.reduce((s, r) => s + r.score_percentage, 0) / records.length);
  const levels = [
    { min: 85, label: "불사조 투자자", icon: "🔥" },
    { min: 70, label: "위기 전문가", icon: "🏅" },
    { min: 50, label: "침착한 생존자", icon: "⚔️" },
    { min: 30, label: "생존자 후보", icon: "🛡️" },
    { min: 0, label: "신입 투자자", icon: "🌱" },
  ];
  return levels.find(l => avg >= l.min) || levels[levels.length - 1];
}

type Phase = "intro" | "playing" | "result" | "growth";

export default function CrisisModePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [pastResults, setPastResults] = useState<CrisisRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [aiScenarios, setAiScenarios] = useState<CrisisScenario[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [holdings, setHoldings] = useState<{ ticker: string; company_name_kr: string }[]>([]);
  const [tooltipDismissed, setTooltipDismissed] = useState(
    typeof window !== "undefined" && !!localStorage.getItem("ppuri_crisis_tooltip_dismissed")
  );

  // Load past results + holdings
  useEffect(() => {
    if (!user) return;
    
    supabase
      .from("crisis_results")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPastResults(data as CrisisRecord[]);
      });

    supabase
      .from("holdings")
      .select("ticker, company_name_kr")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setHoldings(data);
      });
  }, [user]);

  const generateAIScenario = async () => {
    if (holdings.length === 0) {
      toast.error("먼저 보유 종목을 등록해주세요!", {
        action: { label: "등록하기", onClick: () => navigate("/holdings") },
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-crisis-scenario", {
        body: { holdings },
      });

      if (error) throw error;

      const scenario: CrisisScenario = {
        ...data.scenario,
        icon: Sparkles,
        iconColor: "#8B5CF6",
      };

      setAiScenarios(prev => [scenario, ...prev]);
      startScenario(scenario);
      toast.success("AI가 맞춤 시나리오를 만들었어요!");
    } catch (e) {
      console.error(e);
      toast.error("시나리오 생성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const startScenario = (scenario: CrisisScenario) => {
    setSelectedScenario(scenario);
    setPhase("playing");
    setStepIndex(0);
    setSelectedOption(null);
    setTotalScore(0);
    setMaxScore(scenario.steps.length * 3);
    setStepScores([]);
  };

  const handleSelect = useCallback((optIndex: number) => {
    if (selectedOption !== null || !selectedScenario) return;
    setSelectedOption(optIndex);
    const score = selectedScenario.steps[stepIndex].options[optIndex].score;
    setTotalScore(prev => prev + score);
    setStepScores(prev => [...prev, score]);
  }, [selectedOption, selectedScenario, stepIndex]);

  const handleNext = async () => {
    if (!selectedScenario) return;
    if (stepIndex + 1 < selectedScenario.steps.length) {
      setStepIndex(stepIndex + 1);
      setSelectedOption(null);
    } else {
      if (user) {
        setSaving(true);
        const finalPct = Math.round((totalScore / maxScore) * 100);
        const { data } = await supabase.from("crisis_results").insert({
          user_id: user.id,
          scenario_id: selectedScenario.id,
          scenario_title: selectedScenario.title,
          score: totalScore,
          max_score: maxScore,
          score_percentage: finalPct,
          step_scores: stepScores,
        }).select().single();
        
        if (data) {
          setPastResults(prev => [data as CrisisRecord, ...prev]);
        }
        setSaving(false);
      }
      setPhase("result");
    }
  };

  const getMood = (): MascotMood => {
    if (phase === "result") {
      const pct = (totalScore / maxScore) * 100;
      return pct >= 70 ? "celebrate" : pct >= 40 ? "thinking" : "wave";
    }
    if (selectedOption !== null) {
      const score = selectedScenario!.steps[stepIndex].options[selectedOption].score;
      return score >= 3 ? "celebrate" : score >= 2 ? "default" : "wave";
    }
    return "thinking";
  };

  // ===== GROWTH VIEW =====
  if (phase === "growth") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setPhase("intro")} className="text-xl text-muted-foreground">←</button>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h1 className="text-title font-bold text-foreground">나의 성장 기록</h1>
            </div>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          {pastResults.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <Mascot mood="thinking" size="lg" className="mx-auto mb-4" />
              <p className="text-body font-semibold text-foreground mb-2">아직 기록이 없어요</p>
              <p className="text-small text-muted-foreground mb-6">위기 시뮬레이션을 완료하면<br />성장 그래프가 여기 나타나요!</p>
              <PpuriButton onClick={() => setPhase("intro")}>시뮬레이션 시작하기</PpuriButton>
            </div>
          ) : (
            <div className="animate-fade-in space-y-5">
              <GrowthChart records={pastResults} />
              
              {/* Growth Comparison — past vs present */}
              <GrowthComparison records={pastResults} />
              
              {/* Recent history */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-foreground mb-3">최근 도전 기록</p>
                <div className="space-y-2.5">
                  {pastResults.slice(0, 5).map((r) => {
                    const scenario = scenarios.find(s => s.id === r.scenario_id);
                    const Icon = scenario?.icon || Shield;
                    return (
                      <div key={r.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (scenario?.iconColor || "#6B7280") + "15" }}>
                          <Icon size={14} color={scenario?.iconColor || "#6B7280"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{r.scenario_title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(r.completed_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          r.score_percentage >= 80 ? "bg-primary/10 text-primary"
                          : r.score_percentage >= 60 ? "bg-ppuri-blue/10 text-ppuri-blue"
                          : r.score_percentage >= 40 ? "bg-ppuri-amber/10 text-ppuri-amber"
                          : "bg-ppuri-red/10 text-ppuri-red"
                        }`}>
                          {r.score_percentage}점
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ===== INTRO =====
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-xl text-muted-foreground">←</button>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <h1 className="text-title font-bold text-foreground">위기 시뮬레이션</h1>
            </div>
            {pastResults.length > 0 && (
              <button 
                onClick={() => setPhase("growth")}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <TrendingUp size={13} />
                성장 기록
              </button>
            )}
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center mb-6 animate-fade-in">
            <Mascot mood="thinking" size="lg" className="mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-2">실전 위기, 미리 연습해요</h2>
            <p className="text-small text-muted-foreground leading-relaxed">
              실제 역사 속 투자 위기를 시뮬레이션해요.
              <br />감정을 다스리고 올바른 판단을 연습하세요.
            </p>
          </div>

          {/* 첫 방문 툴팁 — 1회성 안내 (위기 훈련 미경험자만) */}
          {pastResults.length === 0 && !tooltipDismissed && (
            <div className="mb-4 bg-accent border-2 border-primary/30 rounded-2xl p-4 animate-fade-in relative">
              <button
                onClick={() => {
                  localStorage.setItem("ppuri_crisis_tooltip_dismissed", "1");
                  setTooltipDismissed(true);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground text-sm font-bold flex items-center justify-center transition-colors"
                aria-label="닫기"
              >
                ×
              </button>
              <div className="flex items-start gap-2 pr-6">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-small font-bold text-foreground mb-1">
                    위기 훈련이 뭔가요?
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    실제 폭락장이 오기 전에 <strong className="text-foreground">머리로 미리 연습</strong>하는 시뮬레이션이에요. 정답은 없어요. 어떤 선택을 하든 그 결과로 배우게 됩니다.
                  </p>
                  <p className="text-[11px] text-primary mt-2 font-medium">
                    ⏱️ 약 2분 · 3가지 상황 선택지
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Custom Scenario Button */}
          <button
            onClick={generateAIScenario}
            disabled={generatingAI}
            className="w-full mb-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-2 border-violet-500/30 rounded-2xl p-5 text-left hover:border-violet-500/50 transition-all press-effect animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                {generatingAI ? (
                  <Loader2 size={20} className="text-violet-500 animate-spin" />
                ) : (
                  <Sparkles size={20} className="text-violet-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-body font-bold text-foreground">
                  {generatingAI ? "시나리오 생성 중..." : "🤖 AI 맞춤 시나리오"}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {holdings.length > 0 
                    ? `${holdings.map(h => h.company_name_kr).slice(0, 3).join(", ")} 기반 위기 상황`
                    : "보유 종목을 등록하면 맞춤 시나리오를 만들어요"
                  }
                </p>
              </div>
            </div>
          </button>

          {/* AI generated scenarios */}
          {aiScenarios.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">AI가 만든 시나리오</p>
              <div className="space-y-3">
                {aiScenarios.map((s, i) => {
                  const Icon = s.icon;
                  const attempts = pastResults.filter(r => r.scenario_id === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => startScenario(s)}
                      className="w-full bg-card border-2 border-violet-500/20 rounded-2xl p-5 text-left hover:border-violet-500/40 transition-all press-effect"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <Icon size={20} className="text-violet-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-body font-bold text-foreground">{s.title}</h3>
                            <span className="text-[9px] bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">AI</span>
                          </div>
                          {attempts > 0 && (
                            <p className="text-[10px] text-muted-foreground">{attempts}회 도전</p>
                          )}
                        </div>
                      </div>
                      <p className="text-small text-muted-foreground whitespace-pre-line pl-[52px]">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard scenarios */}
          <div className="space-y-3">
            {scenarios.map((s, i) => {
              const Icon = s.icon;
              const attempts = pastResults.filter(r => r.scenario_id === s.id).length;
              const bestScore = pastResults.filter(r => r.scenario_id === s.id)
                .reduce((best, r) => Math.max(best, r.score_percentage), 0);
              
              return (
                <button
                  key={s.id}
                  onClick={() => startScenario(s)}
                  className="w-full bg-card border-2 border-border rounded-2xl p-5 text-left hover:border-primary/50 transition-all press-effect animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.iconColor + "15" }}>
                      <Icon size={20} color={s.iconColor} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-body font-bold text-foreground">{s.title}</h3>
                      {attempts > 0 && (
                        <p className="text-[10px] text-muted-foreground">{attempts}회 도전 · 최고 {bestScore}점</p>
                      )}
                    </div>
                  </div>
                  <p className="text-small text-muted-foreground whitespace-pre-line pl-[52px]">{s.description}</p>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ===== RESULT =====
  if (phase === "result" && selectedScenario) {
    const pct = Math.round((totalScore / maxScore) * 100);
    const grade = pct >= 80 ? { label: "위기 대응 마스터", color: "#58CC02", msg: "당신은 어떤 폭풍이 와도 살아남을 투자자예요!" }
      : pct >= 60 ? { label: "침착한 투자자", color: "#3B82F6", msg: "좋은 판단이 많았어요. 조금만 더 연습하면 완벽해요!" }
      : pct >= 40 ? { label: "성장 중인 투자자", color: "#F59E0B", msg: "감정에 흔들린 순간이 있었지만, 배움이 있었어요!" }
      : { label: "감정적 투자자", color: "#EF4444", msg: "괜찮아요! 여기서 연습하는 것 자체가 대단한 거예요!" };

    const prevBest = pastResults
      .filter(r => r.scenario_id === selectedScenario.id && r.id !== pastResults[0]?.id)
      .reduce((best, r) => Math.max(best, r.score_percentage), 0);
    const isNewBest = prevBest > 0 && pct > prevBest;
    const survival = getSurvivalInfo(pastResults);

    return (
      <div className="min-h-screen bg-background flex flex-col items-center px-6 pt-8 pb-6 animate-fade-in">
        <Mascot mood={getMood()} size="xl" className="mb-3" />
        <h1 className="text-display text-foreground mb-1">{grade.label}</h1>
        <p className="text-small text-muted-foreground mb-4 text-center">{grade.msg}</p>

        {isNewBest && (
          <div className="bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4 flex items-center gap-2 animate-slide-up">
            <Trophy size={14} className="text-primary" />
            <span className="text-xs font-bold text-primary">자기 최고 기록 갱신!</span>
          </div>
        )}

        <div className="w-full max-w-sm bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-4 text-center">
          <p className="text-small text-primary font-medium mb-1">위기 대응 점수</p>
          <p className="text-4xl font-black text-primary">{pct}점</p>
          <p className="text-xs text-primary/70 mt-1">{totalScore}/{maxScore}점</p>
        </div>

        {/* Step breakdown */}
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-small font-semibold text-foreground mb-3">단계별 결과</p>
          <div className="space-y-2">
            {stepScores.map((score, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">상황 {i + 1}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${(score / 3) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground">{score}/3</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical insight */}
        <div className="w-full max-w-sm bg-accent/50 border border-border rounded-xl p-4 mb-4 flex items-start gap-3">
          <Mascot mood="thinking" size="sm" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary mb-1">역사적 교훈</p>
            <p className="text-small text-foreground">{selectedScenario.historicalContext}</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {/* Share button */}
          <PpuriButton 
            fullWidth 
            onClick={() => setShowShareCard(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-none"
          >
            <Share2 size={16} className="mr-2" />
            결과 공유하기
          </PpuriButton>

          {pastResults.length >= 2 && (
            <PpuriButton fullWidth variant="secondary" onClick={() => setPhase("growth")}>
              <TrendingUp size={16} className="mr-2" />
              나의 성장 그래프 보기
            </PpuriButton>
          )}
          <PpuriButton fullWidth onClick={() => { setPhase("intro"); setSelectedScenario(null); }}>
            다른 시나리오 도전하기
          </PpuriButton>
          <PpuriButton variant="secondary" fullWidth onClick={() => navigate("/")}>
            홈으로
          </PpuriButton>
        </div>

        {/* Share Card Modal */}
        {showShareCard && (
          <ShareCard
            scenarioTitle={selectedScenario.title}
            scorePercent={pct}
            totalScore={totalScore}
            maxScore={maxScore}
            survivalLevel={survival.label}
            survivalIcon={survival.icon}
            attemptCount={pastResults.length}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </div>
    );
  }

  // ===== PLAYING =====
  if (!selectedScenario) return null;
  const step = selectedScenario.steps[stepIndex];
  const progress = ((stepIndex + 1) / selectedScenario.steps.length) * 100;
  const ScenarioIcon = selectedScenario.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setPhase("intro")} className="text-muted-foreground text-xl">✕</button>
        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{stepIndex + 1}/{selectedScenario.steps.length}</span>
      </div>

      <div className="flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
        {/* Situation */}
        <div className="bg-card border-2 border-border rounded-2xl p-5 mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedScenario.iconColor + "15" }}>
              <ScenarioIcon size={14} color={selectedScenario.iconColor} />
            </div>
            <p className="text-xs font-semibold text-primary">상황 {stepIndex + 1}</p>
          </div>
          <p className="text-body text-foreground leading-relaxed mb-3">{step.situation}</p>
          <p className="text-small text-muted-foreground italic">{step.emotion}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {step.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const showResult = selectedOption !== null;
            const scoreColor = showResult
              ? opt.score >= 3 ? "border-primary bg-primary/5"
                : opt.score >= 2 ? "border-yellow-500 bg-yellow-50"
                : "border-destructive/50 bg-destructive/5"
              : "";

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selectedOption !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? scoreColor + " scale-[1.02]"
                    : showResult ? "border-border opacity-50"
                    : "border-border hover:border-primary/30"
                } disabled:cursor-default`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-small font-bold text-muted-foreground shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-body text-foreground">{opt.text}</span>
                </div>
                {showResult && isSelected && (
                  <div className="mt-3 pl-10">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-full ${s <= opt.score ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedOption !== null && (
          <div className="bg-accent/50 border border-border rounded-xl p-4 mb-4 flex items-start gap-3 animate-fade-in">
            <Mascot mood={getMood()} size="sm" />
            <div className="flex-1">
              <p className="text-small text-foreground leading-relaxed">
                {step.options[selectedOption].feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      {selectedOption !== null && (
        <div className="px-4 pb-6 max-w-lg mx-auto w-full animate-slide-up">
          <PpuriButton fullWidth onClick={handleNext} disabled={saving}>
            {saving ? "저장 중..." : stepIndex + 1 < selectedScenario.steps.length ? "다음 상황 →" : "결과 보기"}
          </PpuriButton>
        </div>
      )}
    </div>
  );
}
