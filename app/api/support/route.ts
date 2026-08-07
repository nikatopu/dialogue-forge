import { NextResponse, type NextRequest } from "next/server";
import { supportRequestSchema } from "@/schemas/supportSchema";
import { sendSupportEmail } from "@/lib/support/sendSupportEmail";

/** Per-IP throttle. In-memory, so it resets on redeploy — enough to blunt spam. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const now = Date.now();

  if (isRateLimited(clientIp(req), now)) {
    return NextResponse.json(
      { error: "Too many messages sent recently. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed request body." },
      { status: 400 },
    );
  }

  // Re-validated server-side — the client check is a convenience, not a guarantee.
  const parsed = supportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the form and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Honeypot tripped — accept silently so bots learn nothing.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const result = await sendSupportEmail(parsed.data, {
    submittedAt: new Date(now).toISOString(),
  });

  if (!result.ok) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[support] send failed:",
        result.reason,
        result.detail ?? "",
      );
    }
    const error =
      result.reason === "not_configured"
        ? "Email delivery is not configured on this deployment yet."
        : "We couldn't send your message right now. Please try again shortly.";
    return NextResponse.json({ error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
