import { adminConfigured, checkCredentials, isSameOriginRequest, startSession } from "@/lib/admin-auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const key = clientKey(request);
  const now = Date.now();
  const record = failures.get(key);
  if (record && record.resetAt > now && record.count >= MAX_FAILURES) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  if (!adminConfigured()) {
    return Response.json({ error: "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to enable the admin area." }, { status: 503 });
  }

  let input: { email?: unknown; password?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password || !checkCredentials(email, password)) {
    const current = failures.get(key);
    if (!current || current.resetAt <= now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
    else current.count += 1;
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  failures.delete(key);
  await startSession();
  return Response.json({ ok: true });
}
