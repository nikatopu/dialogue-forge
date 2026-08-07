import { TOPIC_LABELS, type SupportRequest } from "@/schemas/supportSchema";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "provider_error"; detail?: string };

/** The message is user-supplied, so it must never reach the HTML body raw. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendSupportEmail(
  request: SupportRequest,
  meta: { submittedAt: string },
): Promise<SendResult> {
  if (!process.env.SUPPORT_TO_EMAIL || !process.env.SUPPORT_FROM_EMAIL) {
    return { ok: false, reason: "not_configured" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const topicLabel = TOPIC_LABELS[request.topic];
  const subject = `[Dialogue Forge] ${topicLabel} — ${request.email}`;

  const text = [
    `Topic:  ${topicLabel}`,
    `From:   ${request.email}`,
    `Sent:   ${meta.submittedAt}`,
    "",
    request.message,
  ].join("\n");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.6;color:#111">
      <table style="border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:2px 12px 2px 0;color:#666">Topic</td><td><strong>${escapeHtml(topicLabel)}</strong></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#666">From</td><td><a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a></td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#666">Sent</td><td>${escapeHtml(meta.submittedAt)}</td></tr>
      </table>
      <div style="white-space:pre-wrap;padding:12px 16px;border-left:3px solid #ddd;background:#fafafa">${escapeHtml(request.message)}</div>
    </div>
  `.trim();

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SUPPORT_FROM_EMAIL,
        to: [process.env.SUPPORT_TO_EMAIL],
        // Replying in the inbox goes straight back to whoever wrote in.
        reply_to: request.email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        reason: "provider_error",
        detail: detail.slice(0, 500),
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: "provider_error",
      detail: err instanceof Error ? err.message : "Unknown network error",
    };
  }
}
