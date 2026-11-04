import Link from "next/link";
import { connection } from "next/server";
import { books } from "@/lib/books";
import { getReviewsForModeration, type ModeratedReview } from "@/lib/reviews";
import { ReviewActions } from "../../review-actions";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function bookFor(slug: string) {
  return books.find((book) => book.slug === slug) ?? null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      <span aria-hidden="true" className="text-[13px] tracking-[.08em] text-[#c45500]">
        {"★".repeat(rating)}
        <span className="text-[#c9c9c9]">{"☆".repeat(Math.max(0, 5 - rating))}</span>
      </span>
    </span>
  );
}

const filters = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "all", label: "All" },
];

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  const { status } = await searchParams;
  const filter = status === "approved" || status === "all" ? status : "pending";

  let reviews: ModeratedReview[] = [];
  let error = "";
  try {
    reviews = await getReviewsForModeration();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load reviews.";
  }

  const pending = reviews.filter((review) => !review.isApproved).length;
  const visible = reviews.filter((review) => (filter === "pending" ? !review.isApproved : filter === "approved" ? review.isApproved : true));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Book reviews</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Reader reviews stay hidden until you approve them. Reply from here to show an author response under the review on the book page.
          {" "}
          {pending === 0 ? "Nothing is waiting for moderation." : `${pending} ${pending === 1 ? "review is" : "reviews are"} waiting.`}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#d5d9d9] bg-white px-3 py-2 text-[13px]">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={`/admin/reviews?status=${item.key}`}
            className={`rounded px-3 py-1.5 ${filter === item.key ? "bg-[#e7f4f7] font-semibold text-[#007185]" : "text-[#0f1111] hover:bg-[#f2f3f3]"}`}
          >
            {item.label}
            {item.key === "pending" && pending > 0 ? ` (${pending})` : ""}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-[#d5d9d9] bg-white px-5 py-8 text-[13px] text-[#565959]">
          {error ? "Reviews could not be loaded." : filter === "pending" ? "No reviews are waiting for approval." : "Nothing in this view."}
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((review) => {
            const book = bookFor(review.bookSlug);
            return (
              <article key={review.id} className="rounded-lg border border-[#d5d9d9] bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e7e7] px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.title && <p className="text-[13px] font-semibold">{review.title}</p>}
                    </div>
                    <p className="mt-1 text-[12px] text-[#565959]">
                      {review.name}
                      {" · "}
                      {formatDate(review.createdAt)}
                      {" · "}
                      <Link href={`/en/books/${review.bookSlug}`} target="_blank" className="text-[#007185] hover:underline">
                        {book ? book.shortTitle : review.bookSlug}
                      </Link>
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${review.isApproved ? "bg-[#f0f2f2] text-[#067d62]" : "bg-[#fdf0f2] text-[#b12704]"}`}>
                    {review.isApproved ? "Published" : "Pending"}
                  </span>
                </div>

                <p className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-6 text-[#0f1111]">{review.content}</p>

                <div className="border-t border-[#e7e7e7] px-5 py-3">
                  <ReviewActions id={review.id} isApproved={review.isApproved} author={review.name} replies={review.replies} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
