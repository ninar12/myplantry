# MyPlantry — Social Post Drafts
*Centered on the "photo your fridge, no receipt needed" angle. Mix and match per platform.*

---

## Instagram / TikTok (visual-first — pair with a screen recording of the fridge scan)

**Post 1 — the hook**
> POV: you're staring into your fridge like it owes you an answer 🥴
>
> Take a photo of it instead. MyPlantry figures out what you've got, tracks when it expires, and tells you what to cook before anything goes bad.
>
> No typing. No receipts. Just point your camera at the chaos.
>
> 🌱 myplantry.app
> #foodwaste #mealplanning #whatsfordinner #kitchenhacks #AIapp

**Post 2 — the guilt angle (food waste)**
> The average household throws away ~$1,500 of food a year. Not because we don't care — because we forget what's in there.
>
> I built MyPlantry to fix exactly that: snap a photo of your fridge, it logs everything with expiration dates, then builds recipes around whatever's expiring first.
>
> Cook what you have. Waste less. 🌱 myplantry.app

---

## X/Twitter (build-in-public / indie-AI crowd)

**Post 3 — builder angle**
> I got tired of typing groceries into apps, so I made my pantry app do it from a photo.
>
> 📸 fridge photo → Gemini Vision IDs every item → USDA shelf-life data assigns expiry dates → recipes generated around what's dying first
>
> Solo-built on Next.js + Supabase + pgvector. Beta's open: myplantry.app

**Post 4 — the anti-meal-planner take**
> Every meal planning app: "here's a recipe, now go buy 14 things"
>
> MyPlantry: "you already own dinner, here's how to cook it before Thursday"
>
> Photo your fridge. It handles the rest. myplantry.app

---

## LinkedIn (professional network — the "what I've been building" post)

**Post 5**
> For the past few months I've been building MyPlantry — an AI pantry app with one core belief: meal planning is backwards.
>
> Every recipe app starts with a dish and sends you shopping. MyPlantry starts with what's already in your kitchen. Take a photo of your fridge or pantry — no receipt, no manual entry — and it identifies your ingredients, tracks expiration dates against USDA shelf-life data, and generates recipes that use up what's expiring first.
>
> Under the hood: Next.js, Supabase (pgvector + trigram fuzzy matching), Gemini Vision, deployed on Vercel. Built solo, currently in private beta with real households using it.
>
> The most interesting design lesson so far: the #1 thing stopping people from trying a pantry app is the feeling that they "don't have anything to add." Turns out everyone's fridge disagrees — they just needed the camera to do the work.
>
> Beta: myplantry.app — feedback very welcome.

---

## Usage notes
- Posts 1-2 target home cooks/sustainability audiences; 3-4 the indie/AI crowd; 5 your professional network — matches the three launch-plan audience angles, don't cross-post identical text
- Every post leads with the photo-scan, per the promo priority
- The fridge-scan demo GIF (see NEXT_STEPS.md) makes all of these land 10x harder — worth recording before posting the visual ones
- Hold posts until the current committed fixes are deployed and NRH-129's empty state ships — a traffic bump into the current cold-start experience would repeat the "nothing to add" complaint at scale
