import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, getOrCreateUser } from "@/lib/supabase";

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

  // ntfy notifications are temporarily disabled: the topic is a free-tier ntfy.sh
  // topic that can't be access-restricted, so publishing here would broadcast real
  // user emails + bug text on a publicly readable topic. Re-enable once this is
  // swapped for a private Discord webhook.

  return NextResponse.json({ id: data.id });
}
