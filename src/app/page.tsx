import LandingSignInButton from "@/components/LandingSignInButton"
import Image from "next/image"
import { Leaf, Sparkles, CheckCircle2 } from "lucide-react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"

const EMOJI = (name: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/emojis/${name}.png`

const EXPERIENCE = [
  {
    num: "01",
    icon: EMOJI("lettuce"),
    title: "Your Whole Pantry",
    body: "Everything you have, in one place. Know exactly what's in your fridge, freezer, and pantry — without digging around or forgetting what you bought.",
  },
  {
    num: "02",
    icon: EMOJI("chili-pepper"),
    title: "Recipes from Real Life",
    body: `Tell Plantry what's in your kitchen and it'll generate real, delicious recipes from exactly what you have. No more "what's for dinner?" panic.`,
  },
  {
    num: "03",
    icon: EMOJI("lemon"),
    title: "Nothing Goes to Waste",
    body: "Get reminders before things expire, plan meals around what needs using, and actually cook everything you buy. Your grocery budget will thank you.",
  },
]

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#fbf9f5",
        color: "#1b1c1a",
        fontFamily: "var(--font-manrope), sans-serif",
      }}>
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: "rgba(251,249,245,0.88)",
          borderBottom: "1px solid rgba(191,201,195,0.4)",
        }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)",
              }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-bold text-xl tracking-tight"
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                color: "#003527",
              }}>
              myplantry
            </span>
          </div>
          <nav
            className="hidden md:flex items-center gap-8 text-sm font-medium"
            style={{ color: "#404944" }}>
            <a
              href="#experience"
              className="hover:text-[#003527] transition-colors">
              Features
            </a>
            <a
              href="#philosophy"
              className="hover:text-[#003527] transition-colors">
              Philosophy
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-80"
              style={{
                color: "#003527",
                background: "#f5f3ef",
                border: "1px solid #bfc9c3",
              }}>
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="hidden sm:inline-flex text-sm font-semibold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)",
              }}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Ambient blobs */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -z-0 pointer-events-none"
          style={{ background: "rgba(176,240,214,0.18)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl -z-0 pointer-events-none"
          style={{ background: "rgba(6,78,59,0.08)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-7">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#2b6954" }}>
              Your plan + your pantry
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold leading-[1.05]"
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                color: "#003527",
                letterSpacing: "-0.02em",
              }}>
              Less stress,
              <br />
              <span style={{ color: "#2b6954" }}>waste less.</span>
            </h1>

            <p
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "#404944" }}>
              Log what&apos;s in your kitchen, get recipes from exactly what you
              have, and actually use everything you buy. Currently in beta —
              sign in, try it out, and let us know what you think!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <LandingSignInButton size="large" />
              <a
                href="#experience"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors hover:opacity-80"
                style={{
                  background: "#f5f3ef",
                  color: "#003527",
                  border: "1px solid #bfc9c3",
                }}>
                Explore Features
              </a>
            </div>

            {/* AI suggestion chip */}
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-sm mt-1 max-w-sm"
              style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #003527 0%, #064e3b 100%)",
                }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                  style={{ color: "#2b6954" }}>
                  AI Suggestion
                </p>
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: "#404944" }}>
                  &ldquo;Your broccoli is expiring soon. One idea: air-fry it
                  with your left over Caesar dressing.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8D9Je2ofiK5hjf9c0VRV_oIUO77H9A4zkLkiI5Xj2Lch57OyU45qn0m8m1kU0cbci9ZOYwpyHNh9rU9J28tOrRP1vmVMu7c3T_7zFU_2Hqp2frQMsqkexueiNww4YOu1oQvZwsBYHXQ4nCQze6z-7m8bzJ66nPsg909rmlnQv3FDeGUf1XANL1o7pdbVRVqhOZVt9Bd-OuE3iiVClzyLV76RpSnRRJswf4vHqCnUQMT1VbdD2o-3ynEFUCQxAA4JSYjfpfY0K9A"
                alt="Luxury kitchen larder"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,53,39,0.4) 0%, transparent 55%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Emoji marquee ── */}
      <div
        className="w-full overflow-hidden py-6 select-none"
        style={{
          borderTop: "1px solid rgba(191,201,195,0.3)",
          borderBottom: "1px solid rgba(191,201,195,0.3)",
          background: "rgba(204,230,217,0.15)",
        }}>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .emoji-marquee {
            display: flex;
            width: max-content;
            animation: marquee 32s linear infinite;
          }
          .emoji-marquee:hover { animation-play-state: paused; }
        `}</style>
        <div className="emoji-marquee">
          {[
            "apple",
            "asparagus",
            "bananas",
            "beet",
            "blueberries",
            "butter",
            "carrot",
            "cherries",
            "chili-pepper",
            "corn",
            "cucumbers",
            "garlic",
            "grapes-green",
            "jam-jar",
            "kiwi",
            "leek",
            "lettuce",
            "mango",
            "milk",
            "olives",
            "onion",
            "orange-slice",
            "peach",
            "pear",
            "pumpkin",
            "raspberries",
            "graza",
            "strawberries",
            "tomato",
            "watermelon",
            "pasta",
            // duplicate for seamless loop
            "apple",
            "asparagus",
            "bananas",
            "beet",
            "blueberries",
            "butter",
            "carrot",
            "cherries",
            "chili-pepper",
            "corn",
            "cucumbers",
            "garlic",
            "grapes-green",
            "jam-jar",
            "kiwi",
            "leek",
            "lettuce",
            "mango",
            "milk",
            "olives",
            "onion",
            "orange-slice",
            "peach",
            "pear",
            "tomato1",
            "raspberries",
            "graza",
            "strawberries",
            "tomato",
            "watermelon",
            "pasta",
          ].map((name, i) => (
            <img
              key={i}
              src={EMOJI(name)}
              alt={name}
              width={52}
              height={52}
              className="mx-4 flex-shrink-0"
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 1px 3px rgba(0,53,39,0.12))",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#2b6954" }}>
              Simple by design
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                color: "#003527",
                letterSpacing: "-0.02em",
              }}>
              How it works
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
          {[
            {
              step: "01",
              emoji: EMOJI("blueberries"),
              title: "Add your ingredients",
              desc: "Scan a receipt, type it in, or snap a photo. Done in seconds.",
              bg: "#e8f5ee",
            },
            {
              step: "02",
              emoji: EMOJI("leek"),
              title: "Your pantry, organized",
              desc: "Everything in one place with expiry dates tracked automatically.",
              bg: "#AFDDA6",
            },
            {
              step: "03",
              emoji: EMOJI("corn"),
              title: "Generate recipes",
              desc: "Real recipes from exactly what you have. No missing ingredients.",
              bg: "#cce6d9",
            },
            {
              step: "04",
              emoji: EMOJI("garlic"),
              title: "Ask the Kitchen AI",
              desc: "Substitutions, timing + techniques",
              bg: "rgb(140, 180, 156)",
            },
            {
              step: "05",
              emoji: EMOJI("carrot"),
              title: "Build your grocery list",
              desc: "Add what you need. Buy it, and it lands straight in your pantry.",
              bg: "#EFFFF0",
            },
            {
              step: "06",
              emoji: EMOJI("peach"),
              title: "Never let things expire",
              desc: "Get notified before something goes bad! MyPlantry will prioritize expiring items.",
              bg: "#fff4e6",
            },
          ].map(({ step, emoji, title, desc, bg }) => (
            <div
              key={step}
              className="flex items-start gap-4 rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <img src={emoji} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p
                  className="text-[10px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: "#bfc9c3" }}>
                  {step}
                </p>
                <h3
                  className="font-bold mb-1"
                  style={{
                    color: "#003527",
                    fontFamily: "var(--font-plus-jakarta), sans-serif",
                  }}>
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5a6360" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experience (numbered) ── */}
      <section
        id="experience"
        className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#2b6954" }}>
              The Experience
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                color: "#003527",
                letterSpacing: "-0.02em",
              }}>
              Everything you need to
              <br className="hidden md:block" /> here&apos;s what it does.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1 — dark */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{
              background: "linear-gradient(145deg, #003527 0%, #064e3b 100%)",
              color: "#ffffff",
            }}>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              <img
                src={EXPERIENCE[0].icon}
                alt=""
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                {EXPERIENCE[0].num}
              </p>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
                {EXPERIENCE[0].title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}>
                {EXPERIENCE[0].body}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {["Organic Produce", "Dry Goods", "Fine Oils"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                  }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2 — light */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "#f5f3ef" }}>
              <img
                src={EXPERIENCE[1].icon}
                alt=""
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#bfc9c3" }}>
                {EXPERIENCE[1].num}
              </p>
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  color: "#003527",
                }}>
                {EXPERIENCE[1].title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#404944" }}>
                {EXPERIENCE[1].body}
              </p>
            </div>
            <div
              className="mt-auto pt-2 flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#2b6954" }}>
              <Sparkles className="w-4 h-4" />
              Powered by Gemini AI
            </div>
          </div>

          {/* Card 3 — surface */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "#f5f3ef", border: "1px solid #bfc9c3" }}>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "#cce6d9" }}>
              <img
                src={EXPERIENCE[2].icon}
                alt=""
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#bfc9c3" }}>
                {EXPERIENCE[2].num}
              </p>
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  color: "#003527",
                }}>
                {EXPERIENCE[2].title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#404944" }}>
                {EXPERIENCE[2].body}
              </p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "#003527" }}>
                  AI
                </div>
                <div
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white"
                  style={{ background: "#4c6359" }}>
                  24
                </div>
              </div>
              <span className="text-xs" style={{ color: "#707974" }}>
                Available 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #b5451b 0%, #8b3214 100%)",
        }}
        className="py-20 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(255,200,150,0.12) 0%, transparent 60%)",
          }}
        />
        {/* Floating pantry items */}
        <img
          src={EMOJI("graza")}
          alt=""
          aria-hidden="true"
          className="absolute left-8 bottom-8 w-16 h-16 object-contain opacity-80 pointer-events-none hidden md:block"
          style={{
            transform: "rotate(-15deg)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        />
        <img
          src={EMOJI("peanut-butter")}
          alt=""
          aria-hidden="true"
          className="absolute right-8 top-8 w-20 h-20 object-contain opacity-80 pointer-events-none hidden md:block"
          style={{
            transform: "rotate(12deg)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        />
        <img
          src={EMOJI("oranges-bag")}
          alt=""
          aria-hidden="true"
          className="absolute right-16 bottom-6 w-20 h-20 object-contain opacity-70 pointer-events-none hidden md:block"
          style={{
            transform: "rotate(-8deg)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        />
        <img
          src={EMOJI("pasta")}
          alt=""
          aria-hidden="true"
          className="absolute left-16 top-8 w-16 h-16 object-contain opacity-75 pointer-events-none hidden md:block"
          style={{
            transform: "rotate(6deg)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 md:px-8 text-center">
          <div
            className="text-5xl mb-6"
            style={{ color: "rgba(149,211,186,0.5)" }}>
            &ldquo;
          </div>
          <blockquote
            className="text-2xl md:text-3xl font-medium leading-relaxed text-white mb-8"
            style={{
              fontFamily: "var(--font-plus-jakarta), sans-serif",
              letterSpacing: "-0.01em",
            }}>
            Your best meals aren&apos;t in a restaurant. They&apos;re already in
            your kitchen, waiting.
          </blockquote>
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,220,180,0.8)" }}>
            MyPlantry Way
          </p>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section
        id="philosophy"
        style={{ background: "#f5f3ef" }}
        className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2zODdwGtVVRcirjzMywRXEtR1O-lSLhatTGXWq0a0H3wq5mSxsGJC3EZ76TkzbXhzOIlkrfWVkQfc4n_-W9D85OS2g2bkGUVbkdH86zaqAmS_iCadH53qN0VjI6CCSXce2uq584K2mAMEeV3NROiamQQVj0r2iASqWFIe88YTtruAu50zTmIt6hImoGFSzrCCYb4AwHf0wUkyvX59w_Ux4feK-Y7-XC6AOFQbXrNt5wv2DperxSNqEQqf1UR2lPvu1dGrpeOP_w"
                alt="Fresh vegetables"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 md:pl-4">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#2b6954" }}>
                Our Philosophy
              </p>
              <h2
                className="text-3xl font-bold tracking-tight leading-tight mb-5"
                style={{
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  color: "#003527",
                  letterSpacing: "-0.02em",
                }}>
                A recipe is only as good as the ingredients you have on hand.
                Tired of guessing?
              </h2>
              <p className="leading-relaxed" style={{ color: "#404944" }}>
                I (Nina Rhone) made this app because I am no stranger to wasting
                food, as hard as I try :(. As life gets more and more
                overwhelming, it&apos;s harder to juggle everything. MyPlantry
                fixes that. I have seeded the app with my own cooking advice,
                recipes, and pantry management tips. I hope it helps you as much
                as it has helped me.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {[
                {
                  title: "Save your precious $$$",
                  body: "The average family throws away $1,500 of food a year. Plantry helps you use what you buy before it goes bad.",
                },
                {
                  title: "No more fridge archaeology",
                  body: "Always know exactly what you have. No more mystery containers or forgotten produce in the back of the drawer.",
                },
                {
                  title: "Groceries → pantry → recipes in seconds",
                  body: "Scan your receipt or snap a photo and MyPlantry adds everything automatically. Expiry dates included.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex items-start gap-4">
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#2b6954" }}
                  />
                  <div>
                    <h4
                      className="font-semibold mb-1"
                      style={{ color: "#003527" }}>
                      {title}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#404944" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative overflow-hidden py-24 md:py-32 text-center"
        style={{
          background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)",
        }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(149,211,186,0.15) 0%, transparent 60%)",
          }}
        />
        <Image
          src="/logo.png"
          alt=""
          width={420}
          height={420}
          className="absolute -bottom-16 -right-16 pointer-events-none select-none"
          style={{ opacity: 0.08 }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto px-6 md:px-8 flex flex-col items-center gap-7">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{
              background: "rgba(149,211,186,0.2)",
              color: "rgba(149,211,186,0.9)",
            }}>
            <Sparkles className="w-3.5 h-3.5" />
            Now in beta — sign in and try it out!
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-plus-jakarta), sans-serif",
              letterSpacing: "-0.02em",
            }}>
            Ready to actually use everything in your fridge?
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
            Free to start. No credit card. Just better cooking.
          </p>
          <LandingSignInButton size="large" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#fbf9f5",
          borderTop: "1px solid rgba(191,201,195,0.5)",
        }}
        className="py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="p-1 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)",
              }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold"
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                color: "#003527",
              }}>
              Plantry
            </span>
          </div>
          <nav
            className="flex items-center gap-6 text-sm"
            style={{ color: "#707974" }}>
            <a
              href="#experience"
              className="hover:text-[#003527] transition-colors">
              Features
            </a>
            <a
              href="#philosophy"
              className="hover:text-[#003527] transition-colors">
              Philosophy
            </a>
            <a
              href="/auth/signup"
              className="hover:text-[#003527] transition-colors">
              Get Started
            </a>
          </nav>
          <p className="text-sm" style={{ color: "#707974" }}>
            © 2025 Plantry. The Curated Larder.
          </p>
        </div>
      </footer>
    </div>
  )
}
