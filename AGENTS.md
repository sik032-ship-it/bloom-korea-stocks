# Project architecture rules

- Use `src/utils/treeGrowth.ts` as the only source of truth for tree stages, thresholds, and growth detection so home progress and lesson rewards cannot diverge.
- Treat advanced quizzes as scenario-based application of the PPURI philosophy, never as finance jargon or market-trivia tests; balanced sets must span the core behavioral training tracks.