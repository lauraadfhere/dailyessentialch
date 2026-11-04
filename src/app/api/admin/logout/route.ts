import { endSession, isSameOriginRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  await endSession();
  return Response.json({ ok: true });
}
