import type { Post } from "./parse";
import { richTextToPlain, parseRichText, ARTICLE_TAGS, looksLikeHtml } from "./richtext";

/** Lowercases and strips accents so "café" matches "cafe". */
function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Splits a query into unique, non-empty terms. */
export function searchTerms(query: string): string[] {
  const terms = normalize(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 0)
    .slice(0, 8);
  return [...new Set(terms)];
}

function bodyText(content: string) {
  return looksLikeHtml(content) ? richTextToPlain(parseRichText(content, ARTICLE_TAGS)) : content;
}

/**
 * Scores a post against the query terms. Every term must match somewhere (AND search),
 * and matches in the title count more than the category, excerpt or body.
 * Returns 0 when the post does not match.
 */
export function scorePost(post: Post, terms: string[], body: string): number {
  if (terms.length === 0) return 1;
  const title = normalize(post.title);
  const category = normalize(post.category ?? "");
  const excerpt = normalize(post.excerpt ?? "");
  const text = normalize(body);
  const phrase = terms.join(" ");

  let score = 0;
  for (const term of terms) {
    const inTitle = title.includes(term);
    const inCategory = category.includes(term);
    const inExcerpt = excerpt.includes(term);
    const inBody = text.includes(term);
    if (!inTitle && !inCategory && !inExcerpt && !inBody) return 0;
    if (inTitle) score += 10;
    if (inCategory) score += 6;
    if (inExcerpt) score += 4;
    if (inBody) score += 1;
  }
  if (title.includes(phrase)) score += 15;
  if (title.startsWith(terms[0])) score += 3;
  return score;
}

/** Filters and ranks posts for a query, best match first. Ties keep the original (newest-first) order. */
export function searchPosts(posts: Post[], query: string): Post[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return posts;
  return posts
    .map((post, index) => ({ post, index, score: scorePost(post, terms, bodyText(post.content)) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.post);
}
