import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { notifyDiscord } from "@/lib/notify";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://www.myplantry.app";

interface ExpiringItemRow {
  name: string;
  expiration_date: string;
  location: string;
  user_id: string;
  users: { email: string; name: string | null } | null;
}

interface DigestItem {
  item_name: string;
  expiration_date: string;
  location: string;
}

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function buildEmailHtml(name: string | null, items: DigestItem[]): string {
  const greeting = name ? `Hey ${name.split(" ")[0]}` : "Hey there";
  const plural = items.length === 1 ? "thing is" : "things are";

  const itemRows = items
    .map((item) => {
      const days = daysUntil(item.expiration_date);
      const daysLabel = days <= 0 ? "expired" : days === 1 ? "1 day left" : `${days} days left`;
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e2de;">
            <div style="font-weight: 600; color: #1b1c1a; font-size: 14px;">${item.item_name}</div>
            <div style="color: #707974; font-size: 12px; text-transform: capitalize;">${item.location}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e4e2de; text-align: right; white-space: nowrap;">
            <span style="color: #ef4444; font-weight: 600; font-size: 13px;">${daysLabel}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f3ef; padding: 32px 16px;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #003527 0%, #064e3b 100%); padding: 28px 24px;">
      <p style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">🌱 Plantry</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="color: #1b1c1a; font-size: 16px; margin: 0 0 4px;">${greeting},</p>
      <p style="color: #404944; font-size: 14px; margin: 0 0 20px;">
        ${items.length} ${plural} expiring soon in your pantry:
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemRows}
      </table>
      <a href="${APP_URL}/dashboard"
         style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #003527; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">
        Open Plantry
      </a>
    </div>
  </div>
</div>`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("expiration-alerts: RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email sending is not configured" }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const now = new Date();
  const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("pantry_items")
    .select("name, expiration_date, location, user_id, users!inner(email, name)")
    .gte("expiration_date", now.toISOString())
    .lte("expiration_date", threeDaysOut.toISOString())
    .order("user_id", { ascending: true })
    .order("expiration_date", { ascending: true });

  if (error) {
    console.error("expiration-alerts query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as ExpiringItemRow[];

  const byUser = new Map<string, { email: string; name: string | null; items: DigestItem[] }>();
  for (const row of rows) {
    if (!row.users?.email) continue;
    const entry = byUser.get(row.user_id) ?? { email: row.users.email, name: row.users.name, items: [] };
    entry.items.push({ item_name: row.name, expiration_date: row.expiration_date, location: row.location });
    byUser.set(row.user_id, entry);
  }

  let successCount = 0;
  let failureCount = 0;

  for (const { email, name, items } of byUser.values()) {
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: `🌱 ${items.length} things expiring soon in your Plantry`,
        html: buildEmailHtml(name, items),
      });
      if (result.error) throw new Error(result.error.message);
      successCount++;
    } catch (e) {
      console.error(`expiration-alerts send error for ${email}:`, e);
      failureCount++;
    }
  }

  await notifyDiscord(`Expiry digest sent to ${successCount} users, ${failureCount} failures`);

  return NextResponse.json({ usersNotified: successCount, failures: failureCount });
}
