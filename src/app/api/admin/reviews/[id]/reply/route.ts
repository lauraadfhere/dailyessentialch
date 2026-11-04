import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { MAX_REVIEW_CONTENT, createAdminReply } from "@/lib/reviews";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A review id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = typeof (body as { content?: unknown })?.content === "string" ? ((body as { content: string }).content).trim() : "";
  if (!content || content.length > MAX_REVIEW_CONTENT) {
    return Response.json({ error: "Enter a reply within the allowed length." }, { status: 400 });
  }

  try {
    const reply = await createAdminReply(id, content);
    return Response.json({ reply }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the reply.";
    return Response.json({ error: message }, { status: 503 });
  }
}
