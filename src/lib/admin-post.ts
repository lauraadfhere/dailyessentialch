import type { PostInput } from "./parse";
import { locales } from "./i18n";
import { isSafeImageUrl } from "./profile";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "") || `post-${Date.now()}`;
}

export type ParsedInput = { input: PostInput } | { error: string };

export function readPostInput(body: unknown, existingPublishedAt: string | null = null): ParsedInput {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A title is required." };
  if (title.length > 200) return { error: "Keep the title under 200 characters." };

  const content = typeof raw.content === "string" ? raw.content.trim() : "";
  if (!content) return { error: "Post content is required." };

  const slugInput = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const status = raw.status === "draft" ? "draft" : "published";
  const localeRaw = typeof raw.locale === "string" ? raw.locale.trim().toLowerCase() : "";
  const locale = (locales as readonly string[]).includes(localeRaw) ? localeRaw : null;
  const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim() : null;
  const excerpt = typeof raw.excerpt === "string" ? raw.excerpt.trim() : "";
  const publishedAt = status === "published" ? existingPublishedAt || new Date().toISOString() : null;
  const coverImage = typeof raw.coverImage === "string" && raw.coverImage.trim() ? raw.coverImage.trim() : null;
  if (coverImage && !isSafeImageUrl(coverImage)) return { error: "The cover must be a site path or an http(s) image link." };

  const translations: Record<string, { title: string; excerpt: string; content: string }> = {};
  if (raw.translations && typeof raw.translations === "object" && !Array.isArray(raw.translations)) {
    for (const [key, value] of Object.entries(raw.translations as Record<string, unknown>)) {
      const code = key.trim().toLowerCase();
      if (!(locales as readonly string[]).includes(code)) continue;
      if (!value || typeof value !== "object") continue;
      const entry = value as Record<string, unknown>;
      const entryTitle = typeof entry.title === "string" ? entry.title.trim() : "";
      const entryExcerpt = typeof entry.excerpt === "string" ? entry.excerpt.trim() : "";
      const entryContent = typeof entry.content === "string" ? entry.content.trim() : "";
      if (entryTitle.length > 200) return { error: `Keep the ${code} title under 200 characters.` };
      if (!entryTitle && !entryContent) continue;
      translations[code] = { title: entryTitle, excerpt: entryExcerpt, content: entryContent };
    }
  }

  return { input: { title, slug: slugify(slugInput || title), content, excerpt, locale, status, category, publishedAt, coverImage, translations } };
}
