---
name: Mascot Dialogue Engine
description: Context-aware mascot dialogue system with personalized messages based on user state
type: feature
---
- `src/utils/mascotDialogue.ts` — centralized dialogue engine
- Greeting reacts to: first visit, comeback (3d/7d), streak broken, level-up imminent (90%+), holding names, time of day, today done status
- Quiz feedback: `getCorrectMessage(streak)` varies by consecutive correct count; `getWrongMessage()` randomized encouragement
- Completion: `getCompletionInsight(accuracy, isRepeat)` gives investing wisdom
- Motivation: `getLessonMotivation()` before quiz starts
- Empty states: `getEmptyStateMessage(type)` for holdings/sentences/archive
- Loading: `getLoadingMessage()` random cute messages
- Streak broken: comfort banner on homepage with dismiss button
