import type { Metadata } from "next";
import { amazonLink, books, type Book } from "@/lib/books";
import { locales, messages, type Locale, type QuestionCopy } from "@/lib/i18n";
import type { Post } from "@/lib/parse";

/** Single source of truth for absolute URLs (sitemap, robots, canonicals, OG tags). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dailyessential.ch").replace(/\/+$/, "");
export const SITE_NAME = "Daily Essential";
export const SITE_DESCRIPTION = "Notes on everyday objects, rituals, and ideas — plus books by D. Buckky Moral.";
export const DEFAULT_OG_IMAGE = "/d-buckky-moral.png";
export const OG_IMAGE_SIZE = { width: 2000, height: 2000 };

export const OG_LOCALES: Record<Locale, string> = { en: "en_CH", fr: "fr_CH", ar: "ar_AR" };

/** Profiles that verify the author/organisation entities; only stable public URLs belong here. */
export const SOCIAL_PROFILES = [
  "https://www.amazon.com/stores/author/B0HPTRT8FN/about",
  "https://www.youtube.com/@DailyEssential-g3y",
];

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Every localised route hides behind its locale prefix; these are the canonical paths. */
export function localePath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

/** Absolute URL for a locale route, used in canonicals and structured data. */
export function absoluteUrl(locale: Locale, path = "") {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** Structured data needs absolute media URLs; records may store site-relative paths. */
export function absoluteMedia(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Stable @id for the author entity, so the article and author pages describe one person. */
export function authorId(locale: Locale) {
  return `${absoluteUrl(locale, "/author")}#person`;
}

/**
 * hreflang map for a page path ("" for the home page). Every locale exists for the
 * shared pages, so a visitor landing on a French URL can be pointed at its siblings.
 */
export function languageAlternates(path = "") {
  return {
    en: localePath("en", path),
    fr: localePath("fr", path),
    ar: localePath("ar", path),
    "x-default": localePath("en", path),
  };
}

/** Word count of a post body, tolerating both HTML and Markdown payloads. */
export function wordCount(value: string) {
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|[\]-]/g, " ")
    .replace(/&[a-z]+;/gi, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** schema.org duration (ISO 8601) for a body of text, at ~200 words per minute. */
function readingTime(words: number) {
  return `PT${Math.max(1, Math.round(words / 200))}M`;
}

type PageMetadataInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  /** Set false for placeholder pages that should stay crawlable but out of the index. */
  index?: boolean;
};

export function pageMetadata({ locale, path = "", title, description, index = true }: PageMetadataInput): Metadata {
  const url = localePath(locale, path);
  const image = { url: DEFAULT_OG_IMAGE, ...OG_IMAGE_SIZE, alt: SITE_NAME };

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: locales.filter((other) => other !== locale).map((other) => OG_LOCALES[other]),
      url,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
  };
}

/** Home-page metadata: the site name carries the title, the tagline carries the description. */
export function homeMetadata(locale: Locale): Metadata {
  const copy = messages[locale];
  return pageMetadata({
    locale,
    path: "",
    title: `${SITE_NAME} | ${copy.home.latestPosts}`,
    description: `${copy.home.authorLead} ${copy.home.exploreHeading}`,
  });
}

/** The author as a reusable schema node (no @context, so it can be embedded). */
export function personNode(locale: Locale) {
  const author = messages[locale].author;
  return {
    "@type": "Person",
    "@id": authorId(locale),
    name: author.name,
    url: absoluteUrl(locale, "/author"),
    image: absoluteMedia(DEFAULT_OG_IMAGE),
    jobTitle: author.kicker,
    sameAs: SOCIAL_PROFILES,
  };
}

/** Person structured data for the author page, with the profile copy managed in the CMS. */
export function personJsonLd(locale: Locale, overrides: { name?: string; description?: string; image?: string } = {}) {
  const node = personNode(locale);
  return {
    "@context": "https://schema.org",
    ...node,
    name: overrides.name?.trim() || node.name,
    description: overrides.description?.trim() || messages[locale].author.lead,
    ...(overrides.image ? { image: absoluteMedia(overrides.image) } : {}),
  };
}

/** Publisher node shared by the site and article graphs. */
export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
    sameAs: SOCIAL_PROFILES,
  };
}

/** Site-level graph embedded once in the root layout. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: [...locales],
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** Crumb trail for article and section pages, so results can show the hierarchy. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** FAQ answers already rendered on the page, marked up so they can win rich results. */
export function faqJsonLd(questions: QuestionCopy[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * Book catalogue markup. Only facts the site actually shows are included: no offers,
 * ratings or ISBNs, because inventing those breaks rich-result eligibility.
 */
export function bookListJsonLd(locale: Locale, listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: books.length,
    itemListElement: books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        name: book.title,
        description: book.excerpt,
        image: absoluteMedia(book.cover),
        url: amazonLink(book),
        author: personNode(locale),
        bookFormat: book.type === "ebook" ? "https://schema.org/EBook" : "https://schema.org/Paperback",
        inLanguage: "en",
        ...(book.series ? { isPartOf: { "@type": "BookSeries", name: book.series } } : {}),
        ...(book.ageRange ? { audience: { "@type": "PeopleAudience", suggestedMinAge: Number(book.ageRange.split("–")[0]) || undefined, suggestedMaxAge: Number(book.ageRange.split("–")[1]) || undefined } } : {}),
      },
    })),
  };
}

/** Metadata for a title's page, kept short enough for search snippets. */
export function bookMetadata(book: Book, locale: Locale): Metadata {
  const copy = messages[locale];
  const description = book.excerpt.length > 160 ? `${book.excerpt.slice(0, 157).replace(/[\s,;:.-]+$/, "")}…` : book.excerpt;
  return pageMetadata({
    locale,
    path: `/books/${book.slug}`,
    title: `${book.shortTitle} | ${copy.author.name}`,
    description,
  });
}

/** Structured data for one title's own page. Ratings stay out until reviews are rendered. */
export function bookJsonLd(book: Book, locale: Locale) {
  const url = absoluteUrl(locale, `/books/${book.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#book`,
    name: book.title,
    description: book.excerpt,
    url,
    image: absoluteMedia(book.cover),
    author: personNode(locale),
    bookFormat: book.type === "ebook" ? "https://schema.org/EBook" : "https://schema.org/Paperback",
    inLanguage: "en",
    sameAs: amazonLink(book),
    ...(book.series ? { isPartOf: { "@type": "BookSeries", name: book.series } } : {}),
    ...(book.ageRange
      ? {
          audience: {
            "@type": "PeopleAudience",
            suggestedMinAge: Number(book.ageRange.split("–")[0]) || undefined,
            suggestedMaxAge: Number(book.ageRange.split("–")[1]) || undefined,
          },
        }
      : {}),
  };
}

/** Article structured data, so search results can show headline, date and author. */
export function articleJsonLd(post: Post, locale: Locale, description: string) {
  const url = absoluteUrl(locale, `/posts/${post.slug}`);
  const words = wordCount(post.content || post.excerpt);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description,
    url,
    inLanguage: locale,
    ...(post.publishedAt ? { datePublished: post.publishedAt, dateModified: post.publishedAt } : {}),
    image: [absoluteMedia(post.coverImage || DEFAULT_OG_IMAGE)],
    articleSection: post.category,
    keywords: post.category,
    wordCount: words,
    timeRequired: readingTime(words),
    author: personNode(locale),
    publisher: organizationNode(),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage`, url },
  };
}

/** JSON-LD is embedded in a <script> tag, so "</script>" must not survive stringification. */
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
