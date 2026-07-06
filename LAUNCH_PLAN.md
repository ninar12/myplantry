# Plantry — Beta Launch Plan

**Window:** July 5 – ~July 26, 2026 (3 weeks)
**Type:** Soft/closed beta launch, monetization live at launch
**Audience:** home cooks/meal preppers, food-waste/sustainability-minded users, indie AI product enthusiasts

---

## 0. Read this first — timeline risk

You asked for Stripe live at launch on a 2-3 week clock. Checked Linear: **NRH-45 (Stripe integration) is still sitting in Backlog, untouched** — no branch, no started date. That's not a polish task, it's Checkout sessions, webhooks, subscription state sync, and testing against Supabase's `subscriptions` table. Realistically 4-6 focused days if nothing goes sideways, more like 6-8 with webhook edge cases and testing.

There's also **NRH-52, an urgent open bug** (location change silently corrupts expiry dates) that's been sitting since May. Shipping a beta with a data-corruption bug in the core pantry flow is worse than shipping a week later without it.

Recommendation: Stripe becomes the Week 1 critical path, above every other bug or feature. If it slips past day 10, fall back to "everyone's comped Pro during beta, billing flips on at public launch" rather than pushing the whole beta date — that was the original plan in your project notes, and it's a reasonable escape hatch, not a failure. Your call, but the plan below assumes Stripe holds the timeline; the fallback is noted at each checkpoint.

---

## 1. Positioning

**One-liner:** Plantry is the pantry app that tells you what to cook *before* your food goes bad — not another recipe box you have to plan around.

**Core wedge vs. every other meal-planning app:** they start from a recipe and make you shop. Plantry starts from what's already in your kitchen (including what's about to expire) and uses AI to generate recipes around it.

**Three messaging angles, one per audience segment:**

| Audience | Angle | Proof point to lead with |
|---|---|---|
| Home cooks / meal preppers | "Stop guessing what to make for dinner" | AI recipe generation from your actual pantry, Kitchen AI chat |
| Food-waste / sustainability | "Cook what's expiring before it's garbage" | Shelf-life tracking (433-item USDA FoodKeeper DB), expiry-first recipe scoring |
| Indie/AI product enthusiasts | "Solo-built AI app with real RAG, not a ChatGPT wrapper" | Gemini + Supabase pgvector, TheMealDB-seeded recipe corpus, receipt-scan ingestion |

Keep these separate. A food-waste pitch and an "AI wrapper" pitch read as different products to different people — don't blend them into one generic landing page paragraph.

---

## 2. Technical readiness checklist

Must-ship before any invite goes out:

- [ ] **NRH-45** — Stripe Checkout + webhooks + plan sync (critical path, see §0)
- [ ] **NRH-52** — Fix expiry-date corruption on location change (urgent, data-integrity bug)
- [ ] Landing page copy pass — confirm the redesigned landing page (already shipped per recent commits) reflects real, current features (receipt scanning, Kitchen AI, recipe import) rather than the README's older "simulated integration" language
- [ ] Decide and document beta pricing: comped Pro for all beta users, or real paid tiers from day one — this determines whether Stripe blocks launch or just needs to work post-launch
- [ ] Basic email — at minimum a transactional "you're in" + password/magin-link flow if not already covered by NextAuth; expiry-warning emails (NRH-34) can wait
- [ ] Error monitoring / logging check — you don't have a support team, so you need to see errors happening in near-real-time during beta week

Nice-to-have, not launch-blocking:
- NRH-55 (dietary hard filters), NRH-53 (recipes_db expansion), NRH-56 (recipe scoring) — all improve retention but won't block a beta cohort from getting value on day one.

---

## 3. Three-week calendar

### Week 1 (Jul 6 – Jul 12): Build + prep
- **Mon-Wed:** Stripe integration (NRH-45) — full focus, no other feature work
- **Wed-Thu:** NRH-52 bugfix + regression test
- **Thu:** Landing page copy/proof-point pass for the 3 audience angles (can be 3 lightweight variants of the hero section, or one page that speaks to all three without contradiction)
- **Fri:** Set up a waitlist/invite mechanism if you don't have one — even a simple Supabase table + Tally/Google Form is enough for a closed beta; no need to build custom infra
- **Weekend:** Draft all launch assets (see §4) so they're ready, not written under pressure

### Week 2 (Jul 13 – Jul 19): Recruit + soft-open
- **Mon:** Send first-wave invites to any warm contacts (friends, family, prior beta testers, Twitter/LinkedIn followers) — target 20-30 real users, not hundreds
- **Tue-Wed:** Post in 1-2 owned/low-risk spaces first (your own social, a build-in-public thread) to catch obvious bugs before wider posting
- **Thu:** First wider push — post to targeted communities (see §5) with the angle matched to each community
- **Fri:** Triage feedback/bugs daily; this week is about finding what's broken, not scaling numbers
- Fallback checkpoint: if Stripe isn't solid by Wed, flip to "beta is free/comped Pro" messaging and ship anyway — don't let billing hold the whole cohort hostage

### Week 3 (Jul 20 – Jul 26): Widen + collect proof
- **Mon-Tue:** Second wave of community posts (different subreddits/channels than week 2 to avoid spamming the same audience twice)
- **Wed:** Reach out to 3-5 beta users for testimonials/quotes — you'll want these for the eventual public launch
- **Thu-Fri:** Retro — what broke, what resonated, what the real activation number looks like (pantry item added → first AI recipe generated is your core "aha" moment; track it)
- Decide go/no-go and rough timing for a public launch (Product Hunt, Hacker News "Show HN", etc.) based on what you learned

---

## 4. Assets to have ready before Week 2

- One-page landing site (already largely done — verify copy matches current features)
- Invite/waitlist form
- A 60-90 second demo video or GIF showing: add pantry item → item nears expiry → AI generates a recipe using it. This is the single highest-leverage asset for both Reddit posts and any future Product Hunt launch.
- 3 short post drafts, one per community type (food-waste, meal-prep, indie/AI) — same product, different lead
- A simple feedback channel: a Discord/Slack, a Tally form, or just "reply to this email" — closed betas live and die on how easy it is to report friction

---

## 5. Where to post (soft-launch scale, not paid)

Reddit is genuinely strong here — it's one of the few places people talk plainly about what breaks in their actual kitchen routines rather than giving polished reviews, and it's a real app-discovery channel for household tools. Match the angle to the sub, don't cross-post the identical text:

- **Food-waste angle:** r/ZeroWaste, r/EatCheapAndHealthy, r/foodhacks
- **Meal-prep / home cook angle:** r/MealPrepSunday, r/budgetfood, r/cookingforbeginners
- **Indie/AI builder angle:** r/SideProject, r/IndieHackers (site + subreddit), r/artificial (careful — this crowd is skeptical of "AI wrapper" framing, lead with the RAG/pgvector/real-data angle from §1)

Always read each community's self-promo rules before posting — several require a minimum account history or restrict direct app links to certain days/threads.

Beyond Reddit: your own network (highest-trust, easiest wins), Indie Hackers "I built this," and a build-in-public thread on X/LinkedIn showing the receipt-scan or Kitchen AI chat in action.

Skip Product Hunt for this phase — that's a public-launch tactic, better saved for once Stripe, the bug fix, and a testimonial base are in place. Doing PH twice (once now, once for real) burns the one-shot novelty PH rewards.

---

## 6. Success metrics for the beta window

Pick 3, don't track twenty:

1. **Activation rate** — % of signups who add ≥1 pantry item AND generate ≥1 AI recipe within 48 hours
2. **Retention signal** — % of activated users who return and generate a second recipe within 7 days
3. **Qualitative** — number of usable testimonials/quotes collected (target: 5+) for the public launch

Vanity metrics to ignore for now: raw signup count, social post likes/upvotes. They don't tell you if the product works.

---

## 7. Open decisions for you

- Final call on beta pricing (comped vs. paid from day one) — affects whether Stripe is truly launch-blocking
- Whether to gate the beta as invite-only (you approve each signup) or open-waitlist (anyone can join, you just don't market widely) — invite-only gives you more control over week 2 bug-finding before wider exposure
