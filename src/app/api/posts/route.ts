import { getPosts } from "@/lib/parse";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale")?.toLowerCase();
  try {
    return Response.json({ posts: await getPosts(locale) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load posts.";
    return Response.json({ error: message }, { status: 503 });
  }
}
