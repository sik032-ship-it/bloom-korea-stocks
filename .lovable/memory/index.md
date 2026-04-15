# Project Memory

## Core
PPURI (뿌리) - Duolingo-style behavioral investing app for Korean US stock investors.
Primary green #58CC02, white bg, Noto Sans KR font. Mobile-first, max-w-lg.
Lovable Cloud enabled. Tables: profiles, holdings, sentences, question_templates, subscriptions.
Korean UI language. Gamification: streaks, levels (씨앗→숲), daily lessons with quiz + sentences.
Mascot: cute green squirrel (다람쥐) with sprout hat. 4 moods: default, celebrate, thinking, wave.
Context-aware mascot dialogue engine in src/utils/mascotDialogue.ts.

## Memories
- [Design system](mem://design/tokens) — PPURI color palette, typography, spacing, component styles
- [Database schema](mem://features/database) — profiles and holdings tables with RLS
- [Quiz system](mem://features/quiz) — O/X, multiple choice, fill-blank quiz formats for daily lessons
- [Mascot dialogue](mem://features/mascot-dialogue) — Context-aware dialogue engine with personalized messages
