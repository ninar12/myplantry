import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { supabase, getOrCreateUser } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId)
    .order("expiration_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    amount: row.amount ?? undefined,
    opened: row.opened,
    expiration_date: new Date(row.expiration_date).toISOString(),
    location: row.location,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);
  const body = await req.json();

  const { data, error } = await supabase
    .from("pantry_items")
    .insert({
      user_id: userId,
      name: body.name,
      category: body.category,
      quantity: body.quantity ?? 1,
      amount: body.amount ?? null,
      opened: body.opened ?? false,
      expiration_date: body.expiration_date,
      location: body.location ?? "fridge",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    item: {
      id: data.id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      amount: data.amount ?? undefined,
      opened: data.opened,
      expiration_date: new Date(data.expiration_date).toISOString(),
      location: data.location,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);
  const body = await req.json();

  const { error } = await supabase
    .from("pantry_items")
    .update({ opened: body.opened })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
