# Project architecture rules

- Use `src/utils/treeGrowth.ts` as the only source of truth for tree stages, thresholds, and growth detection so home progress and lesson rewards cannot diverge.