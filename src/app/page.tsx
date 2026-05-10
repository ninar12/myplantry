import LandingSignInButton from "@/components/LandingSignInButton";
import { Leaf, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";

const STATS = [
  { value: "50,000+", label: "Home chefs" },
  { value: "40%", label: "Less food waste" },
  { value: "∞", label: "AI recipes" },
];

const EXPERIENCE = [
  {
    num: "01",
    icon: "🥬",
    title: "Curated Larder",
    body: "Beyond tracking. An intentional inventory system that honors your ingredients and breathes life into your kitchen.",
  },
  {
    num: "02",
    icon: "✨",
    title: "AI Advisor",
    body: "Intelligent meal orchestration — generating recipes from exactly what you have, eliminating the guesswork.",
  },
  {
    num: "03",
    icon: "🌿",
    title: "Organic Ritual",
    body: "A philosophy of mindful cooking. Every ingredient has a story; we help you tell it beautifully.",
  },
];

const SEASONAL = [
  {
    season: "Late Summer",
    title: "Heirloom Tomato Tart",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB47t7sGlu1PXNfnn3NOCIaKWypA8RQ0KpUl21q-0z0Tutkny5FtGCBFok-nfwPoMJu8rj4E5UmaRUxlI-PtRznpvI2vP9fBsTBo7R1-DrYwJYTdX1OfA2I-4aYC6v3BIGdlPx505zpAPafYixkW6rxQpA3-4rBQLhDnRvzMszAvk6S5V6wLMv26z3WuxRiUc66vYCSCLKxFrT5h6VpyYxl3ZthLX6PRvuCFpL3SME_75473Ez4fqCQwyf0GPyGph4VJQLK8ixECg",
  },
  {
    season: "Pantry Staple",
    title: "Smoked Paprika Hummus",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV-zaL9xtZ72GudSuss-6e5ZVWgxqDAAzLMfp8i68o_3a3lPCUykztrw9r4pEfibL8C3rWBkD-k65AyTYIEOd5nmIA9_VU-ppNNdwzPNgcBKBgv4wPUdzexY4M8HnlobiTiMkaclLhisNqmXOwFdZsBByJNbjRgxm1pXZfT7YxMEM2SjTUdt7hcUU3rrrPw6NX0WUSn16Vq1B829XCDhUAzjPOt-REd1YPb51U212exZX9QzA9wKMg1eZ_oZvm6t_Ml3wVHO5Q",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ background: "#fbf9f5", color: "#1b1c1a", fontFamily: "var(--font-manrope), sans-serif" }}
    >

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(251,249,245,0.88)", borderBottom: "1px solid rgba(191,201,195,0.4)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl" style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>
              Plantry
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#404944" }}>
            <a href="#experience" className="hover:text-[#003527] transition-colors">Features</a>
            <a href="#seasonal" className="hover:text-[#003527] transition-colors">Seasonal</a>
            <a href="#philosophy" className="hover:text-[#003527] transition-colors">Philosophy</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ color: "#003527", background: "#f5f3ef", border: "1px solid #bfc9c3" }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="hidden sm:inline-flex text-sm font-semibold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -z-0 pointer-events-none" style={{ background: "rgba(176,240,214,0.18)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl -z-0 pointer-events-none" style={{ background: "rgba(6,78,59,0.08)" }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — copy */}
          <div className="flex flex-col gap-7">
            <div
              className="inline-flex items-center gap-2 self-start text-sm font-medium px-4 py-1.5 rounded-full"
              style={{ background: "#cce6d9", color: "#0b513d" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered pantry &amp; meal planning
            </div>

            <h1
              className="text-5xl md:text-6xl font-extrabold leading-[1.05]"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
            >
              The art of the<br />
              <span style={{ color: "#2b6954" }}>curated larder.</span>
            </h1>

            <p className="text-lg leading-relaxed max-w-lg" style={{ color: "#404944" }}>
              Track your ingredients, reduce food waste, and generate delicious recipes from exactly what you have. A premium kitchen companion for the intentional cook.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <LandingSignInButton size="large" />
              <a
                href="#experience"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors hover:opacity-80"
                style={{ background: "#f5f3ef", color: "#003527", border: "1px solid #bfc9c3" }}
              >
                Explore Features
              </a>
            </div>

            {/* AI suggestion chip */}
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-sm mt-1 max-w-sm"
              style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#2b6954" }}>AI Suggestion</p>
                <p className="text-sm italic leading-relaxed" style={{ color: "#404944" }}>&ldquo;Use your remaining heirloom tomatoes for a gazpacho.&rdquo;</p>
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
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,53,39,0.4) 0%, transparent 55%)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
        <div
          className="rounded-2xl px-6 py-5 grid grid-cols-3 divide-x"
          style={{ background: "#ffffff", border: "1px solid #e4e2de", divideColor: "#e4e2de" }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-4">
              <span
                className="text-2xl md:text-3xl font-extrabold"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
              >
                {value}
              </span>
              <span className="text-xs font-medium" style={{ color: "#707974" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Experience (numbered) ── */}
      <section id="experience" className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#2b6954" }}>The Experience</p>
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
            >
              Everything you need to<br className="hidden md:block" /> master your kitchen.
            </h2>
          </div>
          <span className="text-4xl font-extrabold tabular-nums" style={{ color: "#e4e2de", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
            01 / 03
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1 — dark */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "linear-gradient(145deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.12)" }}>
              {EXPERIENCE[0].icon}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{EXPERIENCE[0].num}</p>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>{EXPERIENCE[0].title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{EXPERIENCE[0].body}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {["Organic Produce", "Dry Goods", "Fine Oils"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2 — light */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#f5f3ef" }}>
              {EXPERIENCE[1].icon}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#bfc9c3" }}>{EXPERIENCE[1].num}</p>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>{EXPERIENCE[1].title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#404944" }}>{EXPERIENCE[1].body}</p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "#2b6954" }}>
              <Sparkles className="w-4 h-4" />
              Powered by Gemini AI
            </div>
          </div>

          {/* Card 3 — surface */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "#f5f3ef", border: "1px solid #bfc9c3" }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#cce6d9" }}>
              {EXPERIENCE[2].icon}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#bfc9c3" }}>{EXPERIENCE[2].num}</p>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>{EXPERIENCE[2].title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#404944" }}>{EXPERIENCE[2].body}</p>
            </div>
            <div className="mt-auto pt-2 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#003527" }}>AI</div>
                <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white" style={{ background: "#4c6359" }}>24</div>
              </div>
              <span className="text-xs" style={{ color: "#707974" }}>Available 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }} className="py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(149,211,186,0.12) 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto px-6 md:px-8 text-center">
          <div className="text-5xl mb-6" style={{ color: "rgba(149,211,186,0.5)" }}>&ldquo;</div>
          <blockquote
            className="text-2xl md:text-3xl font-medium leading-relaxed text-white mb-8"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: "-0.01em" }}
          >
            Cooking is a dance; your kitchen is the stage. We provide the choreography.
          </blockquote>
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(149,211,186,0.7)" }}>The Plantry Philosophy</p>
        </div>
      </section>

      {/* ── Seasonal Inspirations ── */}
      <section id="seasonal" className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#2b6954" }}>In Your Kitchen</p>
            <h2
              className="text-4xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
            >
              Seasonal Inspirations
            </h2>
          </div>
          <a href="/auth/signup" className="hidden md:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70" style={{ color: "#2b6954" }}>
            See all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {SEASONAL.map(({ season, title, img }) => (
            <div
              key={title}
              className="group relative rounded-3xl overflow-hidden aspect-[16/9] cursor-pointer"
              style={{ boxShadow: "0 8px 32px rgba(0,53,39,0.08)" }}
            >
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,53,39,0.75) 0%, rgba(0,53,39,0.1) 60%, transparent 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(149,211,186,0.9)" }}>{season}</p>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}>{title}</h3>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section id="philosophy" style={{ background: "#f5f3ef" }} className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2zODdwGtVVRcirjzMywRXEtR1O-lSLhatTGXWq0a0H3wq5mSxsGJC3EZ76TkzbXhzOIlkrfWVkQfc4n_-W9D85OS2g2bkGUVbkdH86zaqAmS_iCadH53qN0VjI6CCSXce2uq584K2mAMEeV3NROiamQQVj0r2iASqWFIe88YTtruAu50zTmIt6hImoGFSzrCCYb4AwHf0wUkyvX59w_Ux4feK-Y7-XC6AOFQbXrNt5wv2DperxSNqEQqf1UR2lPvu1dGrpeOP_w"
                alt="Fresh vegetables"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stat card */}
            <div
              className="absolute -bottom-5 -right-4 md:-right-6 rounded-2xl px-5 py-4 shadow-lg"
              style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
            >
              <p className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}>40%</p>
              <p className="text-xs text-[#707974] mt-0.5">less food waste</p>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:pl-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#2b6954" }}>Our Philosophy</p>
              <h2
                className="text-4xl font-bold tracking-tight leading-tight mb-5"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
              >
                Ingredients are the beginning of a story.
              </h2>
              <p className="leading-relaxed" style={{ color: "#404944" }}>
                We believe that a well-organized kitchen is the foundation of a creative life. Plantry isn&apos;t just about avoiding waste — it&apos;s about making every meal an intentional experience.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { title: "Zero-Waste Mindset", body: "Intelligent tracking reduces food waste by up to 40%, saving you money and helping the planet." },
                { title: "Cook With Confidence", body: "Always know what's in your kitchen. No more digging through the fridge or guessing expiry dates." },
                { title: "Grocery List Sync", body: "Mark items as bought and they automatically land in your pantry — with expiry dates filled in by AI." },
              ].map(({ title, body }) => (
                <div key={title} className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#2b6954" }} />
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: "#003527" }}>{title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "#404944" }}>{body}</p>
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
        style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(149,211,186,0.15) 0%, transparent 60%)" }} />
        <div className="relative max-w-2xl mx-auto px-6 md:px-8 flex flex-col items-center gap-7">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{ background: "rgba(149,211,186,0.2)", color: "rgba(149,211,186,0.9)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Join 50,000+ home chefs
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: "-0.02em" }}
          >
            Ready to elevate your culinary routine?
          </h2>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
            Start free. Cook smarter. Waste less.
          </p>
          <LandingSignInButton size="large" />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#fbf9f5", borderTop: "1px solid rgba(191,201,195,0.5)" }} className="py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg" style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>Plantry</span>
          </div>
          <nav className="flex items-center gap-6 text-sm" style={{ color: "#707974" }}>
            <a href="#experience" className="hover:text-[#003527] transition-colors">Features</a>
            <a href="#philosophy" className="hover:text-[#003527] transition-colors">Philosophy</a>
            <a href="/auth/signup" className="hover:text-[#003527] transition-colors">Get Started</a>
          </nav>
          <p className="text-sm" style={{ color: "#707974" }}>© 2025 Plantry. The Curated Larder.</p>
        </div>
      </footer>

    </div>
  );
}
