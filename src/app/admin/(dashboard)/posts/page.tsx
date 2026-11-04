import Link from "next/link";
import { connection } from "next/server";
import { getPosts, type Post } from "@/lib/parse";
import { DeletePostButton } from "../../delete-post-button";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminPostsPage() {
  await connection();

  let posts: Post[] = [];
  let error = "";
  try {
    posts = await getPosts();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load posts.";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-display text-[32px] font-medium leading-tight">Posts</h1>
          <p className="mt-1 text-[13px] text-[#565959]">Create, edit and remove the content published on the storefront.</p>
        </div>
        <Link href="/admin/posts/new" className="rounded bg-[#007185] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b]">
          Add a post
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <section className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
        {posts.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-[#565959]">{error ? "Posts could not be loaded." : "No posts yet."}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-[#f0f2f2] text-[12px] text-[#565959]">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Title</th>
                <th className="px-5 py-2.5 font-semibold">Language</th>
                <th className="px-5 py-2.5 font-semibold">Category</th>
                <th className="px-5 py-2.5 font-semibold">Status</th>
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-[#e7e7e7] align-top">
                  <td className="px-5 py-3">
                    <Link href={`/admin/posts/${post.slug}`} className="font-medium text-[#007185] hover:underline">{post.title}</Link>
                    <p className="mt-0.5 text-[12px] text-[#565959]">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-3 uppercase">{post.locale || "en"}</td>
                  <td className="px-5 py-3">{post.category}</td>
                  <td className="px-5 py-3">
                    <span className={post.status === "draft" ? "text-[#b12704]" : "text-[#067d62]"}>{post.status === "draft" ? "Draft" : "Published"}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">{formatDate(post.publishedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/admin/posts/${post.slug}`} className="text-[13px] text-[#007185] hover:underline">Edit</Link>
                      <Link href={`/${post.locale || "en"}/posts/${post.slug}`} target="_blank" className="text-[13px] text-[#007185] hover:underline">View</Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
