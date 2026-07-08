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

  // ntfy notifications are temporarily disabled: the topic is a free-tier ntfy.sh
  // topic that can't be access-restricted, so publishing here would broadcast real
  // user emails on a publicly readable topic. Re-enable once this is swapped for a
  // private Discord webhook.

  return NextResponse.json({ ok: true });
}
