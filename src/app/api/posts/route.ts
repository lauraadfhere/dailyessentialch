import { getPosts } from "@/lib/parse";
import { searchPosts } from "@/lib/post-search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale")?.toLowerCase();
  const query = params.get("q")?.slice(0, 200) ?? "";
  try {
    const posts = await getPosts(locale);
    return Response.json({ posts: query.trim() ? searchPosts(posts, query) : posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load posts.";
    return Response.json({ error: message }, { status: 503 });
  }
}
