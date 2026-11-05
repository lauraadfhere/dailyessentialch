// Keep this module in server-only entry points (route handlers, metadata, and Server Components).
// It reads PARSE_REST_KEY and must never be imported by a Client Component.

export type PostTranslation = { title: string; excerpt: string; content: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  locale: string | null;
  publishedAt: string | null;
  coverImage: string | null;
  /** Optional per-language versions of the title, excerpt and body, keyed by locale. */
  translations: Record<string, PostTranslation>;
};

type ParseDate = { __type?: string; iso?: string };
type ParseRecord = Record<string, unknown> & { objectId: string };
type ParseResponse = { results?: ParseRecord[]; error?: string };

const PUBLISHED_STATUSES = new Set(["published", "publish", "live", "public"]);
const POST_CLASSES = ["Article", "BlogPost", "Note"] as const;

export function config() {
  const url = process.env.PARSE_SERVER_URL;
  const appId = process.env.PARSE_APP_ID;
  const restKey = process.env.PARSE_REST_KEY;

  if (!url || !appId || !restKey) {
    throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");
  }

  return { url: url.replace(/\/$/, ""), appId, restKey };
}

function dateValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as ParseDate).iso === "string") return (value as ParseDate).iso!;
  return null;
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function contentValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join("\n\n");
  return textValue(value);
}

function categoryValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const category = value as Record<string, unknown>;
    return textValue(category.name) || textValue(category.slug);
  }
  return "JOURNAL";
}

function imageValue(record: ParseRecord): string | null {
  for (const key of ["coverImage", "imageUrl", "image", "url"]) {
    const value = record[key];
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object" && typeof (value as Record<string, unknown>).url === "string") return (value as Record<string, unknown>).url as string;
  }
  return null;
}

function isPublished(record: ParseRecord): boolean {
  const status = textValue(record.status).toLowerCase();
  return !status || PUBLISHED_STATUSES.has(status);
}

function translationsValue(value: unknown): Record<string, PostTranslation> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, PostTranslation> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const translation = {
      title: textValue(item.title),
      excerpt: textValue(item.excerpt),
      content: contentValue(item.content),
    };
    if (translation.title || translation.content) result[key.toLowerCase()] = translation;
  }
  return result;
}

function toPost(record: ParseRecord): Post | null {
  const slug = textValue(record.slug);
  const title = textValue(record.title);
  if (!slug || !title || !isPublished(record)) return null;

  const content = contentValue(record.content);
  return {
    id: record.objectId,
    slug,
    title,
    excerpt: textValue(record.excerpt) || content.split(/\r?\n\s*\r?\n/)[0]?.replace(/^#{1,6}\s+/, "") || "",
    content,
    category: categoryValue(record.category),
    status: textValue(record.status).toLowerCase() || "published",
    locale: textValue(record.locale).toLowerCase() || null,
    publishedAt: dateValue(record.publishedAt) || dateValue(record.createdAt),
    coverImage: imageValue(record),
    translations: translationsValue(record.translations),
  };
}

async function query(className: string, parameters: URLSearchParams): Promise<ParseRecord[]> {
  const { url, appId, restKey } = config();
  const response = await fetch(`${url}/classes/${className}?${parameters}`, {
    headers: {
      "X-Parse-Application-Id": appId,
      "X-Parse-REST-API-Key": restKey,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  const body = await response.json() as ParseResponse;
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

function orderPosts(posts: Post[]) {
  return posts.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

/** Returns the post in the requested language when a translation exists, otherwise the original text. */
export function localizePost(post: Post, locale?: string): Post {
  const translation = locale ? post.translations[locale] : undefined;
  if (!translation) return post;
  return {
    ...post,
    title: translation.title || post.title,
    excerpt: translation.excerpt || post.excerpt,
    content: translation.content || post.content,
  };
}

export async function getPosts(locale?: string): Promise<Post[]> {
  const parameters = new URLSearchParams({ order: "-publishedAt", limit: "100", include: "category" });
  const results = await Promise.all(POST_CLASSES.map((className) => query(className, parameters)));
  const unique = new Map<string, Post>();

  for (const record of results.flat()) {
    const post = toPost(record);
    if (!post) continue;
    if (!unique.has(post.slug)) unique.set(post.slug, post);
  }

  return orderPosts([...unique.values()]).map((post) => localizePost(post, locale));
}

export async function getPost(slug: string): Promise<Post | null> {
  async function findBySlug(candidate: string) {
    const parameters = new URLSearchParams({ where: JSON.stringify({ slug: candidate }), limit: "1", include: "category" });
    const results = await Promise.all(POST_CLASSES.map((className) => query(className, parameters)));
    for (const record of results.flat()) {
      const post = toPost(record);
      if (post) return post;
    }
    return null;
  }

  const exactPost = await findBySlug(slug);
  if (exactPost || slug.endsWith("s")) return exactPost;

  // Preserve old singular links when the published canonical slug ends in "s".
  return findBySlug(`${slug}s`);
}

export type Comment = { id: string; name: string; message: string; createdAt: string | null };

export async function getComments({ slug, postId }: { slug: string; postId?: string }): Promise<Comment[]> {
  const postReference = postId ? [{ articleSlug: slug }, { articleId: postId }] : [{ articleSlug: slug }];
  const parameters = new URLSearchParams({
    where: JSON.stringify({ $and: [{ $or: postReference }, { isApproved: true }, { isDeleted: { $ne: true } }] }),
    order: "createdAt",
    limit: "100",
  });
  const records = await query("Comment", parameters);
  return records.map((record) => ({ id: record.objectId, name: textValue(record.userName) || textValue(record.author) || "Reader", message: textValue(record.content), createdAt: dateValue(record.createdAt) }));
}

export async function createComment(input: { slug: string; postId?: string; name: string; message: string }) {
  const { url, appId, restKey } = config();
  const response = await fetch(`${url}/classes/Comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-REST-API-Key": restKey },
    body: JSON.stringify({ articleSlug: input.slug, articleId: input.postId, userName: input.name, author: input.name, content: input.message, isApproved: false, isDeleted: false, likes: 0, dislikes: 0, isReply: false, replyCount: 0 }),
    cache: "no-store",
  });
  const body = await response.json() as { objectId?: string; createdAt?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save comment.");
  return { id: body.objectId, name: input.name, message: input.message, createdAt: body.createdAt ?? null };
}

export type ModeratedComment = Comment & { slug: string; isApproved: boolean; isReply: boolean };

/** Moderation needs the master key, because the REST key only sees approved rows. */
async function adminQuery(className: string, parameters: URLSearchParams): Promise<ParseRecord[]> {
  const { url } = config();
  const response = await fetch(`${url}/classes/${className}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = await response.json() as ParseResponse;
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

export async function getCommentsForModeration(): Promise<ModeratedComment[]> {
  const parameters = new URLSearchParams({
    where: JSON.stringify({ isDeleted: { $ne: true } }),
    order: "-createdAt",
    limit: "200",
  });
  const records = await adminQuery("Comment", parameters);
  return records.map((record) => ({
    id: record.objectId,
    name: textValue(record.userName) || textValue(record.author) || "Reader",
    message: textValue(record.content),
    createdAt: dateValue(record.createdAt),
    slug: textValue(record.articleSlug),
    isApproved: record.isApproved === true,
    isReply: record.isReply === true,
  }));
}

export async function setCommentApproval(id: string, isApproved: boolean) {
  await writeRequest(`Comment/${id}`, "PUT", { isApproved });
}

/** Comments are kept for reference; deleting only hides them from the site and this queue. */
export async function deleteComment(id: string) {
  await writeRequest(`Comment/${id}`, "PUT", { isDeleted: true });
}

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string | null;
  status: "draft" | "published";
  category: string | null;
  publishedAt: string | null;
  coverImage: string | null;
  /** Per-language title, excerpt and body; empty strings remove a translation. */
  translations?: Record<string, PostTranslation>;
};

export type CategoryOption = { id: string; name: string; slug: string };

const DEFAULT_POST_CLASS = "Article";

export function writeHeaders() {
  const { appId, restKey } = config();
  // Writes need the master key when the class-level permissions restrict the REST key.
  // This runs on the server only; the key is never exposed to the browser.
  const masterKey = process.env.PARSE_MASTER_KEY;
  return {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": appId,
    ...(masterKey ? { "X-Parse-Master-Key": masterKey } : { "X-Parse-REST-API-Key": restKey }),
  };
}

async function writeRequest(path: string, method: string, payload?: unknown) {
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

/** Posts live in one of several classes, so resolve which class owns an object id. */
async function postClassFor(objectId: string): Promise<string | null> {
  for (const className of POST_CLASSES) {
    const { url } = config();
    const parameters = new URLSearchParams({ where: JSON.stringify({ objectId }), limit: "1" });
    const response = await fetch(`${url}/classes/${className}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
    if (!response.ok) continue;
    const body = await response.json() as ParseResponse;
    if (body.results?.length) return className;
  }
  return null;
}

/** Stores an uploaded file in Parse and returns its public URL. */
export async function uploadParseFile(name: string, contentType: string, bytes: ArrayBuffer): Promise<string> {
  const { url } = config();
  const response = await fetch(`${url}/files/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: { ...writeHeaders(), "Content-Type": contentType },
    body: bytes,
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok || !body.url) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.url;
}

async function categoryPointer(name: string) {
  const { url } = config();
  const parameters = new URLSearchParams({ where: JSON.stringify({ $or: [{ name }, { slug: name }] }), limit: "1" });
  const response = await fetch(`${url}/classes/Category?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  if (!response.ok) return null;
  const body = await response.json() as ParseResponse;
  const match = body.results?.[0];
  return match ? { __type: "Pointer", className: "Category", objectId: match.objectId } : null;
}

export async function getCategories(): Promise<CategoryOption[]> {
  const { url } = config();
  const parameters = new URLSearchParams({ limit: "100", order: "name" });
  const response = await fetch(`${url}/classes/Category?${parameters}`, { headers: writeHeaders(), cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) return [];
  const body = await response.json() as ParseResponse;
  return (body.results ?? []).map((record) => ({
    id: record.objectId,
    name: textValue(record.name),
    slug: textValue(record.slug),
  })).filter((category) => category.name || category.slug);
}

async function postFields(input: PostInput) {
  const fields: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    status: input.status,
  };
  if (input.locale) fields.locale = input.locale;
  const translations: Record<string, PostTranslation> = {};
  for (const [locale, entry] of Object.entries(input.translations ?? {})) {
    const title = entry.title.trim();
    const excerpt = entry.excerpt.trim();
    const content = entry.content.trim();
    if (title || excerpt || content) translations[locale] = { title, excerpt, content };
  }
  fields.translations = translations;
  fields.coverImage = input.coverImage;
  if (input.publishedAt) fields.publishedAt = { __type: "Date", iso: input.publishedAt };
  if (input.category) {
    const pointer = await categoryPointer(input.category);
    if (pointer) fields.category = pointer;
  }
  return fields;
}

export async function createPost(input: PostInput): Promise<{ id: string }> {
  const created = await writeRequest(DEFAULT_POST_CLASS, "POST", await postFields(input));
  if (!created.objectId) throw new Error("Parse did not return the new post id.");
  return { id: created.objectId };
}

export async function updatePost(objectId: string, input: PostInput): Promise<void> {
  const className = await postClassFor(objectId);
  if (!className) throw new Error("That post no longer exists.");
  await writeRequest(`${className}/${objectId}`, "PUT", await postFields(input));
}

export async function deletePost(objectId: string): Promise<void> {
  const className = await postClassFor(objectId);
  if (!className) throw new Error("That post no longer exists.");
  await writeRequest(`${className}/${objectId}`, "DELETE");
}
