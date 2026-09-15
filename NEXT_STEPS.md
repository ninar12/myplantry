# Plantry — Where Things Stand & What's Next
*Audit date: July 16, 2026*

## 🔴 First: one thing that happened while you were working

**Jonathan is actively using the app right now.** He submitted a real bug report today at 4:21am UTC through the in-app button: **"I tricked the AI into writing me a poem."** Two takeaways:
1. The bug-report pipeline works for him now — whatever he was "sending" before never came through this system.
2. He surfaced a real issue: **Kitchen AI has no topic guardrails.** Anyone can use your Gemini budget as a free general-purpose chatbot. The new per-user caps (NRH-138, committed today) limit the cost damage, but the system prompt should also constrain it to cooking/pantry topics. → New ticket worth filing.

## ✅ Shipped / committed recently (verify deployed)

| What | Commit | Status |
|---|---|---|
| Cross-user data leak fix (NRH-137) | `a49bca0` | Deployed & verified live |
| Kitchen AI history persistence fix (NRH-141) | `8d2689b` | Committed — **verify deployed** |
| Login events + last-seen tracking | `545f260` | Committed — **NOT deployed yet** (Jonathan's activity today didn't touch `last_seen_at`, so prod is still on an older build) |
| Gemini usage caps + burst limits (NRH-138) | `1be0b18` | Committed — **verify deployed** |
| Beta banner + bug report (NRH-134/135) | `d0078ec` | Live (Jonathan used it today) |

**→ Action: push/deploy whatever's sitting on main, then confirm the Vercel build picked up all of it.**

## ⚠️ Uncommitted work in the repo right now

- `src/app/api/cron/expiration-alerts/` + `vercel.json` — NRH-34 (expiry emails) is mid-build, not committed. Finish + commit + deploy. Needs: Resend account, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET` in Vercel.
- `onboarding-emails.md` — the 3-feature email copy (you're holding this until later — fine to commit the file, just don't send).
- Also confirm `DISCORD_WEBHOOK_URL` is set in **Vercel** env vars, not just `.env.local` — otherwise bug reports save but don't ping you.

## 🎯 Your stated promo angle: "photo your fridge, no receipt needed"

This is the right message — it directly answers the #1 recurring complaint ("I don't have any groceries to add"). Where it needs to show up, in order of impact:

1. **The empty pantry state** (NRH-129, updated today) — the moment someone thinks "I have nothing to add" is the moment the app should say "No receipt needed — snap a photo of your fridge." Highest-leverage placement, ~smallest build.
2. **Landing page hero** — currently the photo-scan is buried: mentioned at line 338 ("Scan a receipt, type it in, or snap a photo") and line 711, always receipt-first. Flip the order: photo-first ("Point your camera at your fridge — Plantry figures out what you've got"), receipt as the alternative.
3. **The re-engagement emails** (drafted, in your hands to send) — Natalie's and Jon's could add one line: "no receipt needed — just photo your fridge."
4. **The 3-feature onboarding sequence** (on hold per your call) — Email 2 already covers this; consider making it Email 1 when you do send it.
5. **A 30-second demo GIF/video of the fridge scan** — this is THE shareable asset for the eventual wider launch (Reddit/social). Photo → items appear → recipe generated. Worth recording once the empty-state work ships.

## 📋 Priority order when you're back

1. **Deploy everything committed** (5 min) — several fixes are sitting undeployed
2. **Finish + ship NRH-34** (expiry emails — cron code is half-built already; needs your Resend account)
3. **Build NRH-129** (seeded pantry + photo-first empty state — kills the #1 complaint)
4. **File + fix the Kitchen AI guardrail issue** (Jonathan's report — small system-prompt change, pairs with already-committed caps)
5. **NRH-52** (expiry-date bug — still open since May, still Urgent)
6. **Landing page copy flip** (photo-first messaging, item 2 above)
7. **Send the re-engagement emails** (drafts written — waiting on you; Gmail connector needs write permission re-connect if you want me to draft them in Gmail directly)
8. Later: survey (~1-2 weeks after re-engagement), 3-feature onboarding sequence (your call on timing), Stripe (pre-public-launch)

## 📊 Beta cohort snapshot (as of this audit)

- 4 real users: Michelle (6 items, 1 saved recipe, positive feedback + feature idea), des (6 items), Natalie (2 items), Jonathan (0 items but active TODAY via bug report)
- All comped to Pro ✓
- Everyone else in `users` is your accounts + test accounts
- Tasha & Joseph (NRH-79): still not sent — unblocks once you're confident the current build is stable; banner + bug report (its blockers) are live
- Retention picture: everyone's first session was ~1 hour on July 6, no organic returns since — which is exactly why NRH-34 (expiry emails) is the #2 priority above
