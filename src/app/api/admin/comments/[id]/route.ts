import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { deleteComment, setCommentApproval } from "@/lib/parse";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A comment id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const isApproved = (body as { isApproved?: unknown })?.isApproved;
  if (typeof isApproved !== "boolean") return Response.json({ error: "isApproved must be true or false." }, { status: 400 });

  try {
    await setCommentApproval(id, isApproved);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the comment.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A comment id is required." }, { status: 400 });

  try {
    await deleteComment(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the comment.";
    return Response.json({ error: message }, { status: 503 });
  }
}
