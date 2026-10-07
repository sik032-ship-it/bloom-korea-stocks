# Project architecture rules

- Use `src/utils/treeGrowth.ts` as the only source of truth for tree stages, thresholds, and growth detection so home progress and lesson rewards cannot diverge.
- Treat every quiz difficulty as practical application of the PPURI philosophy, never as finance jargon or market-trivia tests; balanced sets must span the core behavioral training tracks.
- Pass quest-map stage selection through `/lesson?quest=<stage>&mode=<mode>` and rotate the stable daily set, so replay and free challenge never invent a different stage question.
- Award profile and tree growth once only after every unique daily quest stage is attempted; stage replay and free challenge never duplicate the daily reward.- Merge reviewed weekly AI questions into the daily set via registerWeeklyQuestions (at most one per day, mapped to the user's level difficulty) so the static pool stays fresh without breaking 14-day dedupe.
