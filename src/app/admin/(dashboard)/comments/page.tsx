import Link from "next/link";
import { connection } from "next/server";
import { getCommentsForModeration, type ModeratedComment } from "@/lib/parse";
import { CommentActions } from "../../comment-actions";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const filters = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
];

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  const { status } = await searchParams;
  const filter = status === "approved" || status === "all" ? status : "pending";

  let comments: ModeratedComment[] = [];
  let error = "";
  try {
    comments = await getCommentsForModeration();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load comments.";
  }

  const pending = comments.filter((comment) => !comment.isApproved).length;
  const visible = comments.filter((comment) => (filter === "pending" ? !comment.isApproved : filter === "approved" ? comment.isApproved : true));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Comments</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Reader comments stay hidden until you approve them. {pending === 0 ? "Nothing is waiting for moderation." : `${pending} ${pending === 1 ? "comment is" : "comments are"} waiting.`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#d5d9d9] bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={`/admin/comments?status=${item.key}`}
            className={`rounded px-3 py-1.5 ${filter === item.key ? "bg-[#e7f4f7] font-semibold text-[#007185]" : "text-[#0f1111] hover:bg-[#f2f3f3]"}`}
          >
            {item.label}
            {item.key === "pending" && pending > 0 ? ` (${pending})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-[#d5d9d9] bg-white px-5 py-8 text-[13px] text-[#565959]">
          {error ? "Comments could not be loaded." : filter === "pending" ? "No comments are waiting for approval." : "Nothing in this view."}
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-[#d5d9d9] bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e7e7] px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{comment.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#565959]">
                    {formatDate(comment.createdAt)}
                    {comment.slug ? (
                      <>
                        {" · on "}
                        <Link href={`/en/posts/${comment.slug}`} target="_blank" className="text-[#007185] hover:underline">{comment.slug}</Link>
                      </>
                    ) : null}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${comment.isApproved ? "bg-[#f0f2f2] text-[#067d62]" : "bg-[#fdf0f2] text-[#b12704]"}`}>
                  {comment.isApproved ? "Published" : "Pending"}
                </span>
              </div>

              <p className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-6 text-[#0f1111]">{comment.message}</p>

              <div className="flex flex-wrap items-center gap-4 border-t border-[#e7e7e7] px-5 py-2.5">
                <CommentActions id={comment.id} isApproved={comment.isApproved} author={comment.name} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
