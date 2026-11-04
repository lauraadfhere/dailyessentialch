import { saveBook, type BookInput } from "@/lib/books-store";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

const TYPES = new Set(["ebook", "paperback", "both"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validNumber(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
}

function readBook(body: unknown): { input: BookInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid book." };
  const record = body as Record<string, unknown>;
  const title = clean(record.title, 160);
  const slug = clean(record.slug, 120);
  const amazonUrl = clean(record.amazonUrl, 500);
  const cover = clean(record.cover, 500);
  const type = clean(record.type, 20);

  if (!title) return { error: "Title is required." };
  if (!SLUG.test(slug)) return { error: "Slug may only use lowercase letters, numbers and hyphens." };
  if (!TYPES.has(type)) return { error: "Choose ebook, paperback or both." };
  if (amazonUrl && !/^https:\/\/(www\.)?amazon\.[a-z.]+\//.test(amazonUrl)) {
    return { error: "The store link must be an https Amazon URL." };
  }
  if (cover && !/^(\/|https:\/\/)/.test(cover)) return { error: "Cover must be a site path or https URL." };

  return {
    input: {
      slug,
      title,
      shortTitle: clean(record.shortTitle, 160) || title,
      price: clean(record.price, 20),
      cover,
      excerpt: clean(record.excerpt, 600),
      amazonUrl,
      type: type as BookInput["type"],
      series: clean(record.series, 160) || undefined,
      ageRange: clean(record.ageRange, 40) || undefined,
      isNew: record.isNew === true,
      isbn: clean(record.isbn, 20) || undefined,
      pages: validNumber(record.pages, 1, 100000),
      rating: validNumber(record.rating, 0, 5),
      ratingCount: validNumber(record.ratingCount, 0, 10000000),
    },
  };
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readBook(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await saveBook(parsed.input);
    return Response.json(saved, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the book.";
    return Response.json({ error: message }, { status: 503 });
  }
}
