import type { MetadataRoute } from "next";
import { books } from "@/lib/books";
import { locales } from "@/lib/i18n";
import { getPosts } from "@/lib/parse";
import { SITE_URL, localePath, languageAlternates } from "@/lib/seo";

/** Sitemap alternates must be absolute: metadataBase does not apply here. */
const absoluteAlternates = (path: string) =>
  Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([locale, href]) => [locale, `${SITE_URL}${href}`]),
  );

const pages = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/author", priority: 0.9 },
  { path: "/contact", priority: 0.8 },
  { path: "/ebooks", priority: 0.9 },
  { path: "/faq", priority: 0.6 },
  { path: "/marketplace", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  // "/shop" is a "coming soon" placeholder and is noindexed, so it is not submitted.
  { path: "/terms", priority: 0.3 },
];

/** One `<url>` per locale route, each advertising its siblings as hreflang alternates. */
const staticRoutes: MetadataRoute.Sitemap = pages.flatMap((page) =>
  locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale, page.path)}`,
    changeFrequency: "weekly" as const,
    priority: page.priority,
    alternates: { languages: absoluteAlternates(page.path) },
  })),
);

const bookRoutes: MetadataRoute.Sitemap = books.flatMap((book) =>
  locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale, `/books/${book.slug}`)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: absoluteAlternates(`/books/${book.slug}`) },
  })),
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallback = [...staticRoutes, ...bookRoutes];
  try {
    const posts = await getPosts();
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
      const locale = post.locale === "fr" || post.locale === "ar" ? post.locale : "en";
      return {
        url: `${SITE_URL}/${locale}/posts/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
    // De-duplicate: a post reachable through two locales would otherwise repeat.
    const seen = new Set<string>();
    return [...fallback, ...postRoutes].filter((entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    });
  } catch {
    return fallback;
  }
}
