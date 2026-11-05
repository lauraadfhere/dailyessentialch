import Link from "next/link";
import { connection } from "next/server";
import { getCategories, getPost, type CategoryOption, type Post } from "@/lib/parse";
import { PostForm } from "../../../post-form";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;

  let post: Post | null = null;
  let error = "";
  try {
    post = await getPost(slug);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load the post.";
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <h1 className="admin-display text-[32px] font-medium leading-tight">Edit post</h1>
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">
          {error || "That post could not be found."}
        </p>
        <Link href="/admin/posts" className="text-[13px] text-[#007185] hover:underline">← Back to posts</Link>
      </div>
    );
  }

  let categories: CategoryOption[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Edit post</h1>
        <p className="mt-1 text-[13px] text-[#565959]">
          <Link href="/admin/posts" className="text-[#007185] hover:underline">Posts</Link>
          <span className="mx-1.5">/</span>
          {post.title}
        </p>
      </div>
      <PostForm
        mode="edit"
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          locale: post.locale || "en",
          status: post.status,
          category: post.category === "JOURNAL" ? "" : post.category,
          publishedAt: post.publishedAt,
          coverImage: post.coverImage,
          translations: post.translations,
        }}
      />
    </div>
  );
}
