import { createComment, getComments } from "@/lib/parse";
import { normalizeRichText } from "@/lib/richtext";

const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 2_000;

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  const postId = new URL(request.url).searchParams.get("postId")?.trim();
  if (!slug) return Response.json({ error: "A post slug is required." }, { status: 400 });
  try {
    return Response.json({ comments: await getComments({ slug, postId }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load comments.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let input: { slug?: unknown; postId?: unknown; name?: unknown; message?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  const postId = typeof input.postId === "string" ? input.postId.trim() : undefined;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const rawMessage = typeof input.message === "string" ? input.message.trim() : "";
  // Comments may carry rich formatting; keep only the allowlisted markup before storing.
  const { html: message, text } = rawMessage ? normalizeRichText(rawMessage) : { html: "", text: "" };
  if (!slug || !name || !text || name.length > MAX_NAME_LENGTH || message.length > MAX_COMMENT_LENGTH) {
    return Response.json({ error: "Enter a name and a comment within the allowed length." }, { status: 400 });
  }

  try {
    const comment = await createComment({ slug, postId, name, message });
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save comment.";
    return Response.json({ error: message }, { status: 503 });
  }
}
