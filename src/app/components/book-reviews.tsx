"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Copy, Locale } from "@/lib/i18n";

type Reply = { id: string; content: string; createdAt: string | null };
type Review = {
  id: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string | null;
  replies: Reply[];
};
type Summary = { count: number; average: number; distribution: { stars: number; count: number }[] };

const EMPTY_SUMMARY: Summary = {
  count: 0,
  average: 0,
  distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
};

function Stars({ value, label, className = "" }: { value: number; label: string; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true" className={star <= rounded ? "text-[#a28d00]" : "text-[#d8d6cd]"}>★</span>
      ))}
    </span>
  );
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tag = locale === "ar" ? "ar" : locale === "fr" ? "fr-CH" : "en-GB";
  return date.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });
}

function initials(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "R";
}

export default function BookReviews({ bookSlug, locale, copy }: { bookSlug: string; locale: Locale; copy: Copy["reviews"] }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"" | "ok" | "error">("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/reviews?book=${encodeURIComponent(bookSlug)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as { reviews?: Review[]; summary?: Summary };
        if (!response.ok) throw new Error("Unable to load reviews.");
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? EMPTY_SUMMARY);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [bookSlug]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      setStatus(copy.ratingHint);
      setStatusKind("error");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, name, title, content, rating }),
      });
      if (!response.ok) throw new Error("Unable to save the review.");
      setName("");
      setTitle("");
      setContent("");
      setRating(0);
      setStatus(copy.success);
      setStatusKind("ok");
    } catch {
      setStatus(copy.error);
      setStatusKind("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews" className="mx-auto max-w-7xl border-t border-[#e2e0d9] px-5 py-14 sm:px-9 sm:py-20 lg:px-12">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{copy.heading.toUpperCase()}</p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-.045em] sm:text-4xl">{copy.writeReview}</h2>
        <p className="mt-3 text-sm leading-6 text-[#57554f]">{copy.intro}</p>
      </div>

      <div className="mt-10 grid gap-8 border-y border-[#e2e0d9] py-7 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-14">
        <div>
          <p className="text-5xl font-medium leading-none tracking-[-.05em]">
            {summary.count ? summary.average.toFixed(1) : "—"}
          </p>
          <Stars value={summary.average} label={`${summary.average} ${copy.outOfFive}`} className="mt-3 text-lg" />
          <p className="mt-2 text-xs text-[#72726d]">{copy.basedOn.replace("{count}", String(summary.count))}</p>
        </div>

        <div className="space-y-1.5">
          {summary.distribution.map((row) => {
            const share = summary.count ? Math.round((row.count / summary.count) * 100) : 0;
            return (
              <div key={row.stars} className="flex items-center gap-3 text-xs text-[#72726d]">
                <span className="w-12 shrink-0">{row.stars} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#eeece4]">
                  <span className="block h-full bg-[#a28d00]" style={{ width: `${share}%` }} />
                </span>
                <span className="w-7 shrink-0 text-end">{row.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="order-2 lg:order-1">
          <h3 className="text-lg font-medium tracking-[-.02em]">{copy.heading}</h3>

          {loading && <p className="mt-4 text-sm text-[#72726d]" role="status">{copy.loading}</p>}
          {!loading && loadError && <p className="mt-4 text-sm text-[#72726d]">{copy.unavailable}</p>}
          {!loading && !loadError && reviews.length === 0 && <p className="mt-4 text-sm text-[#72726d]">{copy.none}</p>}

          {reviews.length > 0 && (
            <ul className="mt-6 list-none space-y-6">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-[#e7e5dd] pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f0e8] text-[13px] font-semibold text-[#5c5a52]">
                      {initials(review.name)}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold">{review.name}</p>
                      <p className="text-[11px] text-[#8f8d85]">{formatDate(review.createdAt, locale)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Stars value={review.rating} label={`${review.rating} ${copy.outOfFive}`} className="text-sm" />
                    {review.title && <p className="text-sm font-semibold">{review.title}</p>}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#383735]">{review.content}</p>

                  {review.replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-s-2 border-[#a28d00] ps-4">
                      {review.replies.map((reply) => (
                        <div key={reply.id}>
                          <p className="text-[11px] font-semibold tracking-[.12em] text-[#8f8d85]">{copy.authorResponse.toUpperCase()}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#4e4d48]">{reply.content}</p>
                          <p className="mt-1 text-[11px] text-[#a5a39b]">{formatDate(reply.createdAt, locale)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submitReview} className="order-1 h-fit border border-[#e2e0d9] bg-[#faf9f4] p-5 sm:p-6 lg:order-2 lg:sticky lg:top-8">
          <h3 className="text-lg font-medium tracking-[-.02em]">{copy.writeReview}</h3>

          <fieldset className="mt-5">
            <legend className="text-[12px] font-semibold">{copy.yourRating}</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-1 border px-2.5 py-2 text-[13px] transition ${
                    rating === value
                      ? "border-[#1b1b1b] bg-[#1b1b1b] text-white"
                      : "border-[#d8d6cd] bg-white text-[#4e4d48] hover:border-[#a28d00]"
                  }`}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">★</span>
                  {value}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#8f8d85]">{copy.ratingHint}</p>
          </fieldset>

          <label className="mt-4 block text-[12px] font-semibold" htmlFor="review-name">{copy.name}</label>
          <input
            id="review-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy.namePlaceholder}
            maxLength={80}
            required
            className="mt-1.5 block w-full border border-[#d8d6cd] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a5a39b] focus:border-[#1b1b1b]"
          />

          <label className="mt-4 block text-[12px] font-semibold" htmlFor="review-title">{copy.headline}</label>
          <input
            id="review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={copy.headlinePlaceholder}
            maxLength={120}
            className="mt-1.5 block w-full border border-[#d8d6cd] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a5a39b] focus:border-[#1b1b1b]"
          />

          <label className="mt-4 block text-[12px] font-semibold" htmlFor="review-content">{copy.body}</label>
          <textarea
            id="review-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={copy.bodyPlaceholder}
            maxLength={2000}
            required
            rows={5}
            className="mt-1.5 block w-full resize-y border border-[#d8d6cd] bg-white px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-[#a5a39b] focus:border-[#1b1b1b]"
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full bg-[#1b1b1b] px-5 py-3 text-[11px] font-semibold tracking-[.14em] text-white transition hover:bg-[#a28d00] disabled:opacity-60"
          >
            {busy ? copy.submitting : copy.submit}
          </button>

          {status && (
            <p role="status" aria-live="polite" className={`mt-4 text-xs leading-5 ${statusKind === "error" ? "text-[#b12704]" : "text-[#067d62]"}`}>
              {status}
            </p>
          )}
          <p className="mt-3 text-[11px] leading-5 text-[#8f8d85]">{copy.intro}</p>
        </form>
      </div>
    </section>
  );
}
