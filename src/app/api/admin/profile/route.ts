import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { getProfile, readProfileInput, saveProfile } from "@/lib/profile";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json({ profile: await getProfile() });
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

  const parsed = readProfileInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return Response.json({ profile: await saveProfile(parsed.input) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the profile.";
    return Response.json({ error: message }, { status: 503 });
  }
}
