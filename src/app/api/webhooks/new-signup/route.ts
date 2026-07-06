import { NextRequest, NextResponse } from "next/server";

interface SupabaseWebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SIGNUP_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as SupabaseWebhookPayload;

  if (payload.type !== "INSERT" || payload.table !== "users" || !payload.record) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { email, name, created_at } = payload.record as {
    email?: string;
    name?: string | null;
    created_at?: string;
  };

  const message = `New Plantry signup: ${email ?? name ?? "unknown"} at ${created_at ?? "unknown time"}`;

  try {
    await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
      method: "POST",
      body: message,
    });
  } catch {
    // Don't let a failed ntfy call surface as a 500 — Supabase would retry the webhook.
  }

  return NextResponse.json({ ok: true });
}
