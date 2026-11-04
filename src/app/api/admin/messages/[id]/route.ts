import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { deleteContactMessage, setContactHandled } from "@/lib/contact";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A message id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const isHandled = (body as { isHandled?: unknown })?.isHandled;
  if (typeof isHandled !== "boolean") return Response.json({ error: "isHandled must be true or false." }, { status: 400 });

  try {
    await setContactHandled(id, isHandled);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the message.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A message id is required." }, { status: 400 });

  try {
    await deleteContactMessage(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the message.";
    return Response.json({ error: message }, { status: 503 });
  }
}
