import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase, getOrCreateUser } from "@/lib/supabase";
import { checkLimit, limitReachedResponse } from "@/lib/subscription";

export const dynamic = "force-dynamic";

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

  const { allowed, plan, limit } = await checkLimit(userId, "pantry_items");
  if (!allowed) return limitReachedResponse(plan, limit, "pantry_items");

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

  const updates: Record<string, unknown> = {};
  if (body.opened !== undefined) updates.opened = body.opened;
  if (body.name !== undefined) updates.name = body.name;
  if (body.category !== undefined) updates.category = body.category;
  if (body.quantity !== undefined) updates.quantity = body.quantity;
  if ("amount" in body) updates.amount = body.amount ?? null;
  if (body.expiration_date !== undefined) updates.expiration_date = body.expiration_date;
  if (body.location !== undefined) updates.location = body.location;

  const { error } = await supabase
    .from("pantry_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("PATCH pantry error:", error.message, "updates:", JSON.stringify(updates));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
