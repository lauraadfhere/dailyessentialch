// Server-only: used by route handlers and Server Components, never by client code.
import { books as seedBooks, type Book } from "@/lib/books";
import { config, writeHeaders } from "@/lib/parse";

const CLASS = "Book";
const TYPES = new Set(["ebook", "paperback", "both"]);

export type BookInput = Omit<Book, "id"> & { id?: number };

type ParseRecord = Record<string, unknown> & { objectId: string };

function textValue(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function toBook(record: ParseRecord): Book | null {
  const slug = textValue(record.slug);
  const title = textValue(record.title);
  if (!slug || !title) return null;
  const type = textValue(record.type);
  return {
    id: typeof record.bookId === "number" ? record.bookId : 0,
    slug,
    title,
    shortTitle: textValue(record.shortTitle) || title,
    price: textValue(record.price),
    cover: textValue(record.cover),
    excerpt: textValue(record.excerpt),
    amazonUrl: textValue(record.amazonUrl),
    type: TYPES.has(type) ? (type as Book["type"]) : "both",
    series: textValue(record.series) || undefined,
    ageRange: textValue(record.ageRange) || undefined,
    isNew: record.isNew === true,
    isbn: textValue(record.isbn) || undefined,
    pages: typeof record.pages === "number" ? record.pages : undefined,
    rating: typeof record.rating === "number" ? record.rating : undefined,
    ratingCount: typeof record.ratingCount === "number" ? record.ratingCount : undefined,
  };
}

/** Read every stored book; falls back to the bundled catalog when Parse has none. */
export async function getStoredBooks(): Promise<Book[]> {
  const { url, appId, restKey } = config();
  const response = await fetch(`${url}/classes/${CLASS}?order=-bookId&limit=500`, {
    headers: { "X-Parse-Application-Id": appId, "X-Parse-REST-API-Key": restKey },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  const stored = (body.results ?? []).map(toBook).filter((book): book is Book => book !== null);
  return stored.length ? stored : seedBooks;
}

/** Create or update a book keyed by its slug. */
export async function saveBook(input: BookInput) {
  const { url, appId, restKey } = config();
  const lookup = await fetch(`${url}/classes/${CLASS}?where=${encodeURIComponent(JSON.stringify({ slug: input.slug }))}&limit=1`, {
    headers: { "X-Parse-Application-Id": appId, "X-Parse-REST-API-Key": restKey },
    cache: "no-store",
  });
  const existing = (await lookup.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!lookup.ok) throw new Error(existing.error || `Parse returned ${lookup.status}.`);
  const current = existing.results?.[0];
  const objectId = current?.objectId;
  // Keep the stored bookId on update so it is never silently reassigned.
  const bookId = typeof current?.bookId === "number" ? current.bookId : input.id ?? Date.now();

  const payload = {
    bookId,
    slug: input.slug,
    title: input.title,
    shortTitle: input.shortTitle,
    price: input.price,
    cover: input.cover,
    excerpt: input.excerpt,
    amazonUrl: input.amazonUrl,
    type: input.type,
    series: input.series ?? "",
    ageRange: input.ageRange ?? "",
    isNew: Boolean(input.isNew),
    isbn: input.isbn ?? "",
    pages: input.pages ?? null,
    rating: input.rating ?? null,
    ratingCount: input.ratingCount ?? null,
  };

  const response = await fetch(`${url}/classes/${CLASS}${objectId ? `/${objectId}` : ""}`, {
    method: objectId ? "PUT" : "POST",
    headers: writeHeaders(),
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return { ...payload };
}
