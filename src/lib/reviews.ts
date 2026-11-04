// Server-only reader reviews for the book catalogue.
// Writes and moderation use the master key, so this module must never reach a Client Component.
// Reviews live in the Parse class `Review`; author replies are records on the same class
// with `isAdminReply: true` and `parentReviewId` pointing at the review they answer.

import { config, writeHeaders } from "./parse";

export const MAX_REVIEW_NAME = 80;
export const MAX_REVIEW_TITLE = 120;
export const MAX_REVIEW_CONTENT = 2_000;

const REVIEW_CLASS = "Review";
const AUTHOR_NAME = "D. Buckky Moral";

type ParseDate = { __type?: string; iso?: string };
type ParseRecord = Record<string, unknown> & { objectId: string };
type ParseResponse = { results?: ParseRecord[]; error?: string };

export type ReviewReply = { id: string; content: string; createdAt: string | null };

export type BookReview = {
  id: string;
  bookSlug: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string | null;
  replies: ReviewReply[];
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: { stars: number; count: number }[];
};

export type ModeratedReview = BookReview & { isApproved: boolean };

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function dateValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as ParseDate).iso === "string") return (value as ParseDate).iso!;
  return null;
}

function ratingValue(value: unknown): number {
  const rating = typeof value === "number" ? value : Number(textValue(value));
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

async function queryReviews(where: unknown, order = "-createdAt", limit = 300): Promise<ParseRecord[]> {
  const { url } = config();
  const parameters = new URLSearchParams({ where: JSON.stringify(where), order, limit: String(limit) });
  const response = await fetch(`${url}/classes/${REVIEW_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = await response.json() as ParseResponse;
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

async function writeReview(path: string, method: string, payload?: unknown) {
  const { url } = config();
  const response = await fetch(`${url}/classes/${path}`, {
    method,
    headers: writeHeaders(),
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { objectId?: string; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body;
}

function toReply(record: ParseRecord): ReviewReply {
  return { id: record.objectId, content: textValue(record.content), createdAt: dateValue(record.createdAt) };
}

function toReview(record: ParseRecord, replies: ReviewReply[]): BookReview {
  return {
    id: record.objectId,
    bookSlug: textValue(record.bookSlug),
    name: textValue(record.userName) || "Reader",
    rating: ratingValue(record.rating),
    title: textValue(record.title),
    content: textValue(record.content),
    createdAt: dateValue(record.createdAt),
    replies,
  };
}

function groupReplies(records: ParseRecord[]) {
  const grouped = new Map<string, ReviewReply[]>();
  for (const record of records) {
    const parent = textValue(record.parentReviewId);
    if (!parent) continue;
    const replies = grouped.get(parent) ?? [];
    replies.push(toReply(record));
    grouped.set(parent, replies);
  }
  return grouped;
}

/** Average, total and per-star counts for the published reviews of one book. */
export function summariseReviews(reviews: BookReview[]): ReviewSummary {
  const rated = reviews.filter((review) => review.rating >= 1 && review.rating <= 5);
  const total = rated.reduce((sum, review) => sum + review.rating, 0);
  return {
    count: rated.length,
    average: rated.length ? Math.round((total / rated.length) * 10) / 10 : 0,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: rated.filter((review) => review.rating === stars).length })),
  };
}

export async function getApprovedReviews(bookSlug: string): Promise<BookReview[]> {
  const records = await queryReviews({
    $and: [
      { bookSlug },
      { isApproved: true },
      { isDeleted: { $ne: true } },
      { isAdminReply: { $ne: true } },
    ],
  });
  if (records.length === 0) return [];

  const replies = await queryReviews({
    $and: [{ parentReviewId: { $in: records.map((record) => record.objectId) } }, { isDeleted: { $ne: true } }],
  }, "createdAt");

  const grouped = groupReplies(replies);
  return records.map((record) => toReview(record, grouped.get(record.objectId) ?? []));
}

export async function createReview(input: { bookSlug: string; name: string; rating: number; title: string; content: string }) {
  const created = await writeReview(REVIEW_CLASS, "POST", {
    bookSlug: input.bookSlug,
    userName: input.name,
    rating: input.rating,
    title: input.title,
    content: input.content,
    isApproved: false,
    isDeleted: false,
    isAdminReply: false,
  });
  if (!created.objectId) throw new Error("Parse did not return the new review id.");
  return { id: created.objectId };
}

export async function getReviewsForModeration(): Promise<ModeratedReview[]> {
  const records = await queryReviews({ isDeleted: { $ne: true } });
  const replies = groupReplies(records.filter((record) => record.isAdminReply === true));
  return records
    .filter((record) => record.isAdminReply !== true)
    .map((record) => ({ ...toReview(record, replies.get(record.objectId) ?? []), isApproved: record.isApproved === true }));
}

export async function setReviewApproval(id: string, isApproved: boolean) {
  await writeReview(`${REVIEW_CLASS}/${id}`, "PUT", { isApproved });
}

/** Reviews are kept for reference; deleting only hides them from the site and the moderation queue. */
export async function deleteReview(id: string) {
  await writeReview(`${REVIEW_CLASS}/${id}`, "PUT", { isDeleted: true });
}

export async function createAdminReply(reviewId: string, content: string) {
  const [review] = await queryReviews({
    $and: [{ objectId: reviewId }, { isAdminReply: { $ne: true } }, { isDeleted: { $ne: true } }],
  }, "-createdAt", 1);
  if (!review) throw new Error("That review no longer exists.");

  const created = await writeReview(REVIEW_CLASS, "POST", {
    bookSlug: textValue(review.bookSlug),
    parentReviewId: reviewId,
    userName: AUTHOR_NAME,
    content,
    isApproved: true,
    isDeleted: false,
    isAdminReply: true,
  });
  if (!created.objectId) throw new Error("Parse did not return the new reply id.");
  return { id: created.objectId };
}

export async function deleteAdminReply(replyId: string) {
  await writeReview(`${REVIEW_CLASS}/${replyId}`, "PUT", { isDeleted: true });
}
