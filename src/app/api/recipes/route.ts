import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { supabase, getOrCreateUser } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { data, error } = await supabase
    .from("saved_recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    recipes: data.map((row) => ({
      id: row.id,
      title: row.title,
      ingredients: row.ingredients,
      instructions: row.instructions,
      match_percentage: row.match_percentage ?? undefined,
      created_at: row.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);
  const body = await req.json();

  const { data, error } = await supabase
    .from("saved_recipes")
    .insert({
      user_id: userId,
      title: body.title,
      ingredients: body.ingredients,
      instructions: body.instructions,
      match_percentage: body.match_percentage ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    recipe: {
      id: data.id,
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      match_percentage: data.match_percentage ?? undefined,
      created_at: data.created_at,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
