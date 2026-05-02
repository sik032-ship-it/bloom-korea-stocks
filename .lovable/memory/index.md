# Project Memory

## Core
PPURI (뿌리) - Duolingo-style behavioral investing app for Korean US stock investors.
Primary green #58CC02, white bg, Noto Sans KR font. Mobile-first, max-w-lg.
Lovable Cloud enabled. Tables: profiles, holdings, sentences. Auth with auto-profile trigger.
Korean UI language. Gamification: streaks, levels (씨앗→숲), daily sentences.
홈 화면은 "오늘의 레슨" 단일 CTA + TimeMachine 프리뷰만. 나머지는 네비로.
온보딩 답변(experience/goal/daily_goal)은 반드시 profiles에 저장하고 UX에 반영.
**PX 원칙**: 완성도보다 경험. 모든 결정은 감정 곡선 + 리텐션 행동 + 마찰 최소화 셋의 균형으로 판단.

## Memories
- [Design system](mem://design/tokens) — PPURI color palette, typography, spacing, component styles
- [Database schema](mem://features/database) — profiles and holdings tables with RLS
- [Onboarding personalization](mem://features/onboarding-personalization) — 수준별 인사 + Streak Freeze 자동 보호
- [PX 원칙](mem://preferences/px-principle) — Product Experience 판단 기준 (감정·리텐션·마찰 균형)
