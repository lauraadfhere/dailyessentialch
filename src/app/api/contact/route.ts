import { isSameOriginRequest } from "@/lib/admin-auth";
import { createContactMessage, readContactInput } from "@/lib/contact";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
const submissions = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Coarse in-process throttle; it blunts form spam without another dependency. */
function tooManySubmissions(ip: string) {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  submissions.set(ip, recent);

  if (submissions.size > 500) {
    for (const [key, times] of submissions) {
      if (!times.some((time) => now - time < WINDOW_MS)) submissions.delete(key);
    }
  }

  return recent.length > MAX_SUBMISSIONS;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  if (tooManySubmissions(clientIp(request))) {
    return Response.json({ error: "Too many messages sent. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Bots fill the decoy field; accept quietly so they do not learn it was ignored.
  if (typeof (body as { website?: unknown })?.website === "string" && (body as { website: string }).website.trim()) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const parsed = readContactInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await createContactMessage(parsed.input);
    return Response.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send your message.";
    return Response.json({ error: message }, { status: 503 });
  }
}
