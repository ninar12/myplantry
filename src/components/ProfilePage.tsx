"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  User,
  MapPin,
  Bell,
  ChefHat,
  Check,
  Save,
  Loader2,
  LogOut,
} from "lucide-react"

interface Preferences {
  display_name: string | null
  default_location: "fridge" | "pantry" | "freezer"
  expiry_warning_days: 1 | 3 | 7
  dietary_prefs: string[]
  cuisine_prefs: string[]
  notif_meal_reminders: boolean
  notif_expiry_alerts: boolean
  notif_grocery_restock: boolean
}

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
]

const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "American",
  "Indian",
]

const DEFAULTS: Preferences = {
  display_name: null,
  default_location: "fridge",
  expiry_warning_days: 3,
  dietary_prefs: [],
  cuisine_prefs: [],
  notif_meal_reminders: true,
  notif_expiry_alerts: true,
  notif_grocery_restock: true,
}

function PillToggle({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
        active
          ? "bg-[#003527] text-white border-[#003527] shadow-sm"
          : "bg-white text-[#003527]/60 border-[#003527]/15 hover:border-[#003527]/30 hover:text-[#003527]"
      }`}>
      {active && <Check className="w-3 h-3" />}
      {label}
    </button>
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
        checked ? "bg-[#003527]" : "bg-[#003527]/15"
      }`}>
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS)
  const [profileName, setProfileName] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)

  const email = session?.user?.email ?? ""
  const avatarInitial =
    (profileName || session?.user?.name || email)?.[0]?.toUpperCase() ?? "?"

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ preferences }) => {
        if (!preferences) return
        setPrefs({
          display_name: preferences.display_name ?? null,
          default_location: preferences.default_location ?? "fridge",
          expiry_warning_days: preferences.expiry_warning_days ?? 3,
          dietary_prefs: preferences.dietary_prefs ?? [],
          cuisine_prefs: preferences.cuisine_prefs ?? [],
          notif_meal_reminders: preferences.notif_meal_reminders ?? true,
          notif_expiry_alerts: preferences.notif_expiry_alerts ?? true,
          notif_grocery_restock: preferences.notif_grocery_restock ?? true,
        })
        setProfileName(
          preferences.display_name ?? session?.user?.name ?? ""
        )
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveProfile() {
    setSavingProfile(true)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: profileName || null }),
    })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  async function savePreferences() {
    setSavingPrefs(true)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_location: prefs.default_location,
        expiry_warning_days: prefs.expiry_warning_days,
        dietary_prefs: prefs.dietary_prefs,
        cuisine_prefs: prefs.cuisine_prefs,
        notif_meal_reminders: prefs.notif_meal_reminders,
        notif_expiry_alerts: prefs.notif_expiry_alerts,
        notif_grocery_restock: prefs.notif_grocery_restock,
      }),
    })
    setSavingPrefs(false)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  function togglePill(
    key: "dietary_prefs" | "cuisine_prefs",
    value: string
  ) {
    setPrefs((p) => ({
      ...p,
      [key]: p[key].includes(value)
        ? p[key].filter((v) => v !== value)
        : [...p[key], value],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-[#003527]/40" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Profile Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#003527]/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-xl bg-[#2b6954]/15 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#003527]" />
          </div>
          <h2 className="font-semibold text-[#003527]">Profile</h2>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#2b6954]/15 flex items-center justify-center text-[#003527] font-bold text-3xl mb-3">
            {avatarInitial}
          </div>
          <p className="text-xs text-[#003527]/40">{email}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-1.5 uppercase tracking-wide">
              Display Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#f5f3ef] rounded-xl px-4 py-2.5 text-sm text-[#003527] placeholder-[#003527]/30 focus:outline-none focus:bg-[#e8e6e2] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-[#f5f3ef] rounded-xl px-4 py-2.5 text-sm text-[#003527]/40 cursor-not-allowed"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#003527] text-white text-sm font-semibold hover:bg-[#2b6954] transition-colors disabled:opacity-60">
            {savingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {profileSaved ? "Saved!" : "Save Changes"}
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#003527]/10 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-xl bg-[#2b6954]/15 flex items-center justify-center">
            <ChefHat className="w-3.5 h-3.5 text-[#003527]" />
          </div>
          <h2 className="font-semibold text-[#003527]">Preferences</h2>
        </div>

        <div className="flex flex-col gap-6">
          {/* Default location */}
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-1.5 uppercase tracking-wide">
              <MapPin className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Default ingredient location
            </label>
            <select
              value={prefs.default_location}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  default_location: e.target.value as Preferences["default_location"],
                }))
              }
              className="w-full bg-[#f5f3ef] rounded-xl px-4 py-2.5 text-sm text-[#003527] focus:outline-none focus:bg-[#e8e6e2] transition-colors appearance-none cursor-pointer">
              <option value="fridge">Fridge</option>
              <option value="pantry">Pantry</option>
              <option value="freezer">Freezer</option>
            </select>
          </div>

          {/* Expiry warning */}
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-1.5 uppercase tracking-wide">
              <Bell className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Expiry warning threshold
            </label>
            <select
              value={prefs.expiry_warning_days}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  expiry_warning_days: Number(e.target.value) as 1 | 3 | 7,
                }))
              }
              className="w-full bg-[#f5f3ef] rounded-xl px-4 py-2.5 text-sm text-[#003527] focus:outline-none focus:bg-[#e8e6e2] transition-colors appearance-none cursor-pointer">
              <option value={1}>1 day before</option>
              <option value={3}>3 days before</option>
              <option value={7}>7 days before</option>
            </select>
          </div>

          {/* Dietary preferences */}
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-2 uppercase tracking-wide">
              Dietary preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <PillToggle
                  key={opt}
                  label={opt}
                  active={prefs.dietary_prefs.includes(opt)}
                  onToggle={() => togglePill("dietary_prefs", opt)}
                />
              ))}
            </div>
          </div>

          {/* Cuisine preferences */}
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-2 uppercase tracking-wide">
              Cuisine preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((opt) => (
                <PillToggle
                  key={opt}
                  label={opt}
                  active={prefs.cuisine_prefs.includes(opt)}
                  onToggle={() => togglePill("cuisine_prefs", opt)}
                />
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-xs font-semibold text-[#003527]/50 mb-3 uppercase tracking-wide">
              Notifications
            </label>
            <div className="flex flex-col gap-3">
              {[
                {
                  key: "notif_meal_reminders" as const,
                  label: "Meal reminders",
                  desc: "Reminders to cook before items expire",
                },
                {
                  key: "notif_expiry_alerts" as const,
                  label: "Expiry alerts",
                  desc: "Alerts when items are about to expire",
                },
                {
                  key: "notif_grocery_restock" as const,
                  label: "Grocery restock",
                  desc: "Suggestions to restock pantry staples",
                },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-[#003527]">{label}</p>
                    <p className="text-xs text-[#003527]/40">{desc}</p>
                  </div>
                  <Toggle
                    checked={prefs[key]}
                    onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={savePreferences}
            disabled={savingPrefs}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#003527] text-white text-sm font-semibold hover:bg-[#2b6954] transition-colors disabled:opacity-60">
            {savingPrefs ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : prefsSaved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {prefsSaved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  )
}
