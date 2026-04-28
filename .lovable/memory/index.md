# Project Memory

## Core
PPURI (뿌리) - Duolingo-style behavioral investing app for Korean US stock investors.
Primary green #58CC02, white bg, Noto Sans KR font. Mobile-first, max-w-lg.
Lovable Cloud enabled. Tables: profiles, holdings, sentences. Auth with auto-profile trigger.
Korean UI language. Gamification: streaks, levels (씨앗→숲), daily sentences.
홈 화면은 "오늘의 레슨" 단일 CTA + TimeMachine 프리뷰만. 나머지는 네비로.
온보딩 답변(experience/goal/daily_goal)은 반드시 profiles에 저장하고 UX에 반영.

## Memories
- [Design system](mem://design/tokens) — PPURI color palette, typography, spacing, component styles
- [Database schema](mem://features/database) — profiles and holdings tables with RLS
- [Onboarding personalization](mem://features/onboarding-personalization) — 수준별 인사 + Streak Freeze 자동 보호
