import { Leaf, Check, Sparkles, Users } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "A great way to get started.",
    cta: "Current plan",
    ctaDisabled: true,
    highlight: false,
    features: [
      "Up to 30 pantry items",
      "5 saved recipes",
      "10 AI recipe generations/day",
      "Grocery list",
      "Cooking consultant",
    ],
    locked: [
      "Photo & receipt scanning",
      "Unlimited everything",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$7.99",
    period: "per month",
    description: "For the home cook who wants it all.",
    cta: "Upgrade to Pro",
    ctaDisabled: false,
    highlight: true,
    features: [
      "Unlimited pantry items",
      "Unlimited saved recipes",
      "Unlimited AI recipe generation",
      "Photo & receipt scanning",
      "Grocery list",
      "Cooking consultant",
      "Priority support",
    ],
    locked: [],
  },
  {
    id: "team",
    name: "Team",
    price: "$19.99",
    period: "per month",
    description: "Share your kitchen with the whole household.",
    cta: "Upgrade to Team",
    ctaDisabled: false,
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 5 household members",
      "Shared pantry & grocery list",
      "Shared recipe collection",
      "Admin controls",
    ],
    locked: [],
  },
];

export default function UpgradePage() {
  return (
    <div
      className="min-h-screen py-16 px-6"
      style={{ background: "#fbf9f5", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* Back link */}
      <div className="max-w-4xl mx-auto mb-10">
        <Link
          href="/dashboard"
          className="text-sm font-medium inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ color: "#2b6954" }}
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-5"
          style={{ background: "#cce6d9", color: "#0b513d" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simple, honest pricing
        </div>
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-4"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
        >
          Your kitchen, fully unlocked.
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#404944" }}>
          Start free and upgrade when you&apos;re ready. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-3xl p-7 flex flex-col gap-6 relative"
            style={
              plan.highlight
                ? { background: "linear-gradient(145deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }
                : { background: "#ffffff", border: "1px solid #e4e2de" }
            }
          >
            {plan.highlight && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#cce6d9", color: "#003527" }}
              >
                Most popular
              </div>
            )}

            {/* Plan name & icon */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: plan.highlight ? "rgba(255,255,255,0.15)" : "#f5f3ef",
                }}
              >
                {plan.id === "team" ? (
                  <Users className="w-4 h-4" style={{ color: plan.highlight ? "#ffffff" : "#003527" }} />
                ) : (
                  <Leaf className="w-4 h-4" style={{ color: plan.highlight ? "#ffffff" : "#003527" }} />
                )}
              </div>
              <span
                className="font-bold text-base"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: plan.highlight ? "#ffffff" : "#003527" }}
              >
                {plan.name}
              </span>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-end gap-1.5">
                <span
                  className="text-4xl font-extrabold"
                  style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: plan.highlight ? "#ffffff" : "#003527" }}
                >
                  {plan.price}
                </span>
                <span className="text-sm pb-1.5" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#707974" }}>
                  {plan.period}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.65)" : "#404944" }}>
                {plan.description}
              </p>
            </div>

            {/* CTA */}
            <button
              disabled={plan.ctaDisabled}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:cursor-default"
              style={
                plan.highlight
                  ? { background: "#ffffff", color: "#003527" }
                  : plan.ctaDisabled
                  ? { background: "#f5f3ef", color: "#707974", border: "1px solid #e4e2de" }
                  : { background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }
              }
            >
              {plan.cta}
            </button>

            {/* Features */}
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: plan.highlight ? "#95d3ba" : "#2b6954" }}
                  />
                  <span style={{ color: plan.highlight ? "rgba(255,255,255,0.85)" : "#1b1c1a" }}>{f}</span>
                </li>
              ))}
              {plan.locked.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                  <span className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center text-xs">–</span>
                  <span style={{ color: plan.highlight ? "#ffffff" : "#1b1c1a" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-sm mt-12" style={{ color: "#707974" }}>
        Questions?{" "}
        <a href="mailto:hello@myplantry.com" className="font-medium underline" style={{ color: "#2b6954" }}>
          hello@myplantry.com
        </a>
      </p>
    </div>
  );
}
