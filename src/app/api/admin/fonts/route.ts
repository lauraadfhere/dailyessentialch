import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { normaliseFontSettings } from "@/lib/font-config";
import { getFontSettings, saveFontSettings } from "@/lib/font-settings";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(await getFontSettings());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request body." }, { status: 400 });

  const parsed = normaliseFontSettings(body as Record<string, unknown>);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return Response.json(await saveFontSettings(parsed));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the fonts.";
    return Response.json({ error: message }, { status: 503 });
  }
}
