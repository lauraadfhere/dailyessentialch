import { getBook } from "@/lib/books";
import {
  MAX_REVIEW_CONTENT,
  MAX_REVIEW_NAME,
  MAX_REVIEW_TITLE,
  createReview,
  getApprovedReviews,
  summariseReviews,
} from "@/lib/reviews";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("book")?.trim() ?? "";
  const book = slug ? getBook(slug) : null;
  if (!book) return Response.json({ error: "Unknown book." }, { status: 404 });

  try {
    const reviews = await getApprovedReviews(book.slug);
    return Response.json(
      { reviews, summary: summariseReviews(reviews) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reviews.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let input: { bookSlug?: unknown; name?: unknown; rating?: unknown; title?: unknown; content?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const bookSlug = typeof input.bookSlug === "string" ? input.bookSlug.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const rating = typeof input.rating === "number" ? Math.round(input.rating) : 0;

  if (!getBook(bookSlug)) return Response.json({ error: "Unknown book." }, { status: 400 });
  if (!name || name.length > MAX_REVIEW_NAME) {
    return Response.json({ error: "Enter a name within the allowed length." }, { status: 400 });
  }
  if (!content || content.length > MAX_REVIEW_CONTENT) {
    return Response.json({ error: "Enter a review within the allowed length." }, { status: 400 });
  }
  if (title.length > MAX_REVIEW_TITLE) {
    return Response.json({ error: "The review title is too long." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return Response.json({ error: "Choose a rating from 1 to 5 stars." }, { status: 400 });
  }

  try {
    const review = await createReview({ bookSlug, name, rating, title, content });
    return Response.json({ review, pending: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the review.";
    return Response.json({ error: message }, { status: 503 });
  }
}
