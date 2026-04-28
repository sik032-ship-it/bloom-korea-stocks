---
name: Onboarding personalization & safety nets
description: profiles.experience_level/investment_goal/daily_goal/streak_freezes 활용, 수준별 인사·자동 freeze 보호
type: feature
---

# 온보딩 개인화 + 안전장치

## DB 컬럼 (profiles)
- `experience_level` text — "완전 초보" | "조금 해봤어요" | "1년 이상 투자 중" | "베테랑 투자자"
- `investment_goal` text — 노후/자산/자유/학습
- `daily_goal` smallint (1/3/5) — 하루 목표 문장 수
- `onboarded_at` timestamptz
- `streak_freezes` smallint default 2 — 스트릭 보호권 (Duolingo 모델)

## 활용 지점
- `OnboardingPage.handleFinish`: 위 4개 필드 모두 저장 (이전엔 버려졌었음)
- `mascotDialogue.getHomeGreeting`: 첫 방문 시 experienceLevel에 따라 인사 톤 분기 (초보/베테랑/일반)
- `HomePage`: 어제 레슨 빠뜨렸지만 freeze 남으면 자동 1개 차감 + last_sentence_date를 어제로 끌어올려 streak 유지. 사용 시 사용자에게 배너로 안내

## 룰
- streak_freezes는 자동으로 다시 충전되지 않음 (의도). 추후 주간/월간 충전 또는 레벨업 보상으로 재충전 검토.
- 수준별 분기는 점진적 확장: 다음은 레슨 난이도/용어 툴팁/홈 추천 콘텐츠 우선순위로 확대.
