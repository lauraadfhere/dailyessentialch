import { adminConfigured, checkCredentials, isSameOriginRequest, startSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
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
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await startSession();
  return Response.json({ ok: true });
}
