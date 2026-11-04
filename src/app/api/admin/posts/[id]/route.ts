import { deletePost, updatePost } from "@/lib/parse";
import { readPostInput } from "@/lib/admin-post";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A post id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existingPublishedAt = typeof (body as { publishedAt?: unknown })?.publishedAt === "string"
    ? (body as { publishedAt: string }).publishedAt
    : null;

  const parsed = readPostInput(body, existingPublishedAt);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    await updatePost(id, parsed.input);
    return Response.json({ ok: true, slug: parsed.input.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A post id is required." }, { status: 400 });

  try {
    await deletePost(id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}
