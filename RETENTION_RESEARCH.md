# How to Make MyPlantry Get Used More — Research + Plan
*July 16, 2026 — combines industry research with Plantry's actual beta data*

## The core diagnosis

Your beta data matches the industry failure pattern for pantry apps almost exactly, which is good news — it means the fixes are known.

**The industry pattern:** pantry/meal apps die from (1) manual-entry burden, (2) inventory drift — the pantry stops matching reality after partial use/snacking/unlogged items, so people stop trusting it, and (3) tracking without action — inventory that doesn't visibly feed into "what's for dinner" feels like a chore with no payoff.

**Your data:** all 3 active testers had one ~1-hour session on July 6 and never returned organically. Nobody hit a wall (they added items, generated recipes) — they just had no reason to come back. That's a *trigger* problem, not a product-quality problem.

**The retention math that matters:** users who return 3+ times in week one are ~10x more likely to still be active at day 30. Day-1 retention benchmarks sit around 25-30% for consumer apps. Recovery windows for lapsed users close within 3-7 days — your testers are past that, which is why the personal re-engagement emails (already drafted) matter more than any automated system for this cohort.

## The framework, mapped to Plantry

The Hook Model (trigger → action → variable reward → investment) is the standard lens. Plantry's loop audit:

| Hook stage | What Plantry has | The gap |
|---|---|---|
| **External trigger** | Nothing (no notifications of any kind) | ← THE gap. Nothing ever brings anyone back |
| **Internal trigger** | "What's for dinner?" — genuinely daily, genuinely universal | App isn't yet associated with that moment |
| **Action** | "Cook what you have" is one tap — good | Empty/stale pantry makes the tap worthless first |
| **Variable reward** | AI recipes ARE naturally variable — good bones | Only variable if the pantry changes; a static pantry returns similar recipes |
| **Investment** | Pantry data, saved recipes, preferences — real switching costs | Inventory drift erodes it: the more the pantry lies, the less the investment holds |

## What to change, ranked by evidence × effort

### Tier 1 — the external trigger (do first; you're already on it)
1. **Expiry email digests (NRH-34, half-built)** — the single highest-leverage change. "Your spinach expires tomorrow" is a *daily, personalized, genuinely useful* reason to open the app — exactly the behavioral-trigger notification the research says still works in 2026 (timely, relevant, respectful — not noise). Finish it, ship it.
2. **Make the digest actionable, not informational** — the email CTA should be "See tonight's recipe using these" (deep link into generate-recipe), not "view your pantry." Tracking without action is the documented failure mode; every notification should end one tap from a recipe.
3. **Grocery restock nudges (NRH-142)** — second trigger type, covers the "pantry went quiet" state the expiry digest can't reach (nothing expiring because nothing's logged).

### Tier 2 — fight inventory drift (the silent killer)
4. **"Did you cook this?" follow-up** — after generating a recipe, next session (or in the digest email): "Did you make the lemon garlic chicken? [Yes → deduct ingredients] [No]". One tap keeps inventory honest AND creates a return visit. This is the cheapest drift-fighter available and nobody in the space does it well.
5. **Fast re-scan as maintenance, not just onboarding** — position the fridge photo as the weekly "sync my pantry" gesture: a "Re-scan your fridge" prompt when the pantry hasn't changed in 7+ days. Your photo-scan already solves manual entry (the #1 documented abandonment cause) — extend it to solve drift too (the #2 cause).
6. **Quick-use gestures** — swipe/tap to mark an item "used up" or "half left" from the pantry list. Every friction ounce here compounds; the research is unanimous that logging friction kills these apps.

### Tier 3 — deepen the reward + investment
7. **Streak-free progress feedback** — show cumulative wins, not guilt: "You've cooked 4 recipes and saved ~$23 of expiring food this month." Money-saved and waste-avoided numbers give the variable reward emotional weight (the food-waste guilt angle is your sustainability audience's internal trigger). Avoid duolingo-style streaks — a pantry app punishing you for eating out reads as tone-deaf.
8. **Weekly "pantry report" email** — even when nothing's expiring: what you have, what you're low on (staples, once NRH-136 ships), one suggested recipe. Gives the app a weekly heartbeat independent of expiry events.
9. **Household sharing (NRH-133, post-beta)** — the research flags "one household member forgetting to log" as a drift cause; shared pantries also make the data investment collective, which raises switching costs. Right call keeping it post-beta, but it's a retention feature, not just a Team-tier feature.

### Explicitly skip (evidence says don't bother)
- **Gamification/streaks/badges** — works for fitness/language, consistently reads as gimmicky in kitchen tools; the win-tracking in #7 covers the same need honestly
- **More AI features** — the recipe generator isn't the bottleneck; the trigger loop is
- **Dark-pattern retention** (hard-to-leave flows, guilt notifications) — legally radioactive in 2026 and poisonous for a friends-and-family beta

## The one-sentence version

MyPlantry's product loop is sound but has no external trigger and no drift defense — finish the expiry emails (NRH-34) with recipe-deep-link CTAs, add the "did you cook it?" one-tap inventory update, and prompt a fridge re-scan when the pantry goes stale, in that order.

## Suggested new tickets (say the word and I'll file them)
- "Did you cook this?" follow-up + ingredient deduction
- Stale-pantry re-scan prompt (7+ days no changes → suggest photo re-sync)
- Quick-use gestures on pantry items (used up / half left)
- Money-saved / waste-avoided stats on dashboard
- Weekly pantry report email (extends NRH-34 infra)

## Sources
- [Appcues — App retention benchmarks + 8 strategies](https://www.appcues.com/blog/app-retention-is-hard-heres-how-to-improve-it)
- [Amplitude — The Hook Model](https://amplitude.com/blog/the-hook-model)
- [Enable3 — Mobile app retention strategies 2026](https://enable3.io/blog/mobile-app-retention-2025)
- [Growth-onomics — Retention benchmarks by industry 2026](https://growth-onomics.com/mobile-app-retention-benchmarks-by-industry-2026/)
- [ProductGrowth — Hook model & daily-habit retention loops](https://productgrowth.in/insights/healthtech/health-app-retention-guide/)
- [OrganizEat — Meal planning app with pantry inventory](https://home.organizeat.com/blog/meal-planning-app-with-pantry-inventory/)
- [OrganizEat — Diet planner app development founder's guide](https://home.organizeat.com/blog/diet-planner-app-development/)
- [Recipy — Pantry tracking apps tested head-to-head](https://recipyapp.com/blog/best-pantry-tracking-apps-2026)
- [MealThinker — Meal planning apps with pantry tracking](https://mealthinker.com/blog/meal-planning-app-pantry-tracking)
- [StriveCloud — Habit formation & user retention](https://www.strivecloud.io/blog/habit-formation-user-retention)
