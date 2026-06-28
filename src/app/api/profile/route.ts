import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { supabase, getOrCreateUser } from "@/lib/supabase"

export interface UserPreferences {
  display_name: string | null
  default_location: "fridge" | "pantry" | "freezer"
  expiry_warning_days: 1 | 3 | 7
  dietary_prefs: string[]
  cuisine_prefs: string[]
  notif_meal_reminders: boolean
  notif_expiry_alerts: boolean
  notif_grocery_restock: boolean
}

const DEFAULTS: UserPreferences = {
  display_name: null,
  default_location: "fridge",
  expiry_warning_days: 3,
  dietary_prefs: [],
  cuisine_prefs: [],
  notif_meal_reminders: true,
  notif_expiry_alerts: true,
  notif_grocery_restock: true,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ preferences: data ?? { ...DEFAULTS, user_id: userId } })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = await getOrCreateUser(session.user.email, session.user.name)
  const body = await req.json()

  const allowed = [
    "display_name",
    "default_location",
    "expiry_warning_days",
    "dietary_prefs",
    "cuisine_prefs",
    "notif_meal_reminders",
    "notif_expiry_alerts",
    "notif_grocery_restock",
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ preferences: data })
}
