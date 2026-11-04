import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { deleteAdminReply } from "@/lib/reviews";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; replyId: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { replyId } = await params;
  if (!replyId) return Response.json({ error: "A reply id is required." }, { status: 400 });

  try {
    await deleteAdminReply(replyId);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the reply.";
    return Response.json({ error: message }, { status: 503 });
  }
}
