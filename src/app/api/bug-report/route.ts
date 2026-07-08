import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, getOrCreateUser } from "@/lib/supabase";
import { notifyDiscord } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, page_url } = await req.json();
  if (!description || typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { data, error } = await supabase
    .from("bug_reports")
    .insert({
      user_id: userId,
      email: session.user.email,
      description: description.trim(),
      page_url: typeof page_url === "string" ? page_url : null,
      user_agent: req.headers.get("user-agent"),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notifyDiscord(`🐛 Bug report from ${session.user.email}: ${description.trim().slice(0, 200)}`);

  return NextResponse.json({ id: data.id });
}
