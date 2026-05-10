import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase, getOrCreateUser } from "@/lib/supabase"

// GET /api/chat/history — fetch last 50 messages for the current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) {
    console.error("chat history fetch error:", error)
    return NextResponse.json({ messages: [] })
  }

  return NextResponse.json({ messages: data ?? [] })
}

// DELETE /api/chat/history — clear all chat history for the current user
export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", userId)

  if (error) {
    console.error("chat history delete error:", error)
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
