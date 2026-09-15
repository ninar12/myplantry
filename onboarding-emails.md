# Plantry Onboarding Email Sequence

3 emails, one feature per email, ~1-2 days apart after signup. Ties to NRH-140 (blocked by NRH-44 — no email sending infra yet). This is the copy, ready to drop into whatever provider ends up being used.

Each email includes a concrete demo example — a realistic before/after, not just an abstract instruction — so the feature is shown, not just described.

---

## Email 1 — Scan a receipt (send: immediately or Day 1)

**Subject:** Skip the manual typing — just scan your receipt

**Body:**

Hey {{first_name}},

Typing in every grocery item by hand is the fastest way to stop using a pantry app. So don't.

Next time you're back from the store, open Plantry and snap a photo of your receipt. Here's what happens:

> **You scan:** a Trader Joe's receipt with "2% MLK," "BANA," "CHKN BRST 1.2LB"
> **Plantry logs:** 2% Milk, Bananas, Chicken Breast (1.2 lb) — each with an estimated expiration date already filled in

No typing, no guessing at shelf life. Just point your camera and go.

**[Scan your first receipt →]**

— The Plantry team

---

## Email 2 — Photo scan of ingredients (send: Day 2-3)

**Subject:** Didn't keep the receipt? Just photograph what's in your fridge

**Body:**

Hey {{first_name}},

Not everything comes with a receipt — leftovers, farmers market produce, whatever's been in the back of the freezer since forever. For those, skip the receipt scanner and just take a photo of your fridge or pantry shelf instead.

> **You snap:** a photo of your fridge shelf — a carton of eggs, a block of cheddar, a bag of spinach
> **Plantry logs:** Eggs, Cheddar Cheese, Spinach — identified individually, not just "dairy" and "produce," with quantities estimated from what's visible

It's the same idea as the receipt scan, just pointed at your actual shelves instead of a paper receipt.

**[Try a fridge photo scan →]**

— The Plantry team

---

## Email 3 — Generate a recipe (send: Day 4-5)

**Subject:** You've got a pantry. Now let it tell you what's for dinner.

**Body:**

Hey {{first_name}},

Here's the part that makes this worth doing: once Plantry knows what you have, it can tell you what to make with it — prioritizing whatever's about to go bad, so nothing gets wasted.

> **Your pantry has:** Chicken Breast (expires in 2 days), Spinach (expires in 3 days), Garlic, Olive Oil, Lemon
> **Tap "Cook what you have," Plantry suggests:** Lemon Garlic Chicken with Sautéed Spinach — built specifically around what's expiring soonest, using ingredients you already own

No more staring into the fridge wondering what to do with everything before it turns. Just tap and cook.

**[Generate your first recipe →]**

— The Plantry team

---

## Notes for whoever builds the send logic (NRH-140)

- `{{first_name}}` should pull from `users.name` (split on first space if needed, or use as-is if it's already a first name for most beta users)
- CTAs should deep-link into the relevant flow (receipt scan modal, fridge-photo scan modal, RecipeGenerator) rather than just the homepage
- Consider skipping an email if the user already completed that action before it would send (e.g. don't send the "scan a receipt" email to someone who already has 10 pantry items) — avoids feeling tone-deaf
