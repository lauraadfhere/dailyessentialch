import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { notFound, redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import { getPost, type Post } from "@/lib/parse";
import { getLocale, messages, type Locale } from "@/lib/i18n";
import { ARTICLE_TAGS, looksLikeHtml, parseRichText, richTextToPlain } from "@/lib/richtext";
import { DEFAULT_OG_IMAGE, OG_IMAGE_SIZE, OG_LOCALES, SITE_NAME, articleJsonLd, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import RichArticleContent from "../../components/rich-article-content";
import ArticleToc from "./article-toc";
import PostEnhancements from "./post-enhancements";

// Self-hosted so the article face is preloaded from our own origin instead of
// waiting on a third-party stylesheet.
const imperial = localFont({
  src: "../../fonts/imperial.woff2",
  weight: "400",
  display: "swap",
});

type PostPageProps = { params: Promise<{ slug: string }>; locale?: Locale };

/** Meta description from the excerpt, falling back to the first words of the body. */
function descriptionFor(post: Post) {
  const source = post.excerpt.trim() || post.content;
  const text = looksLikeHtml(source)
    ? richTextToPlain(parseRichText(source, ARTICLE_TAGS))
    : source.replace(/[#*_>`]/g, " ");
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 160 ? `${clean.slice(0, 157).replace(/[\s,;:.-]+$/, "")}…` : clean;
}

/** Per-post canonical, Open Graph article tags and description for every locale route. */
export async function postMetadata(params: PostPageProps["params"], locale: Locale = "en"): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  const copy = messages[locale];
  if (!post) return { title: copy.post.allPosts, robots: { index: false, follow: false } };

  const description = descriptionFor(post) || copy.post.authorBio;
  // A record holds one language only, so the locale routes that merely repeat it point
  // their canonical at the owning locale instead of competing with it as duplicates.
  const owner = getLocale(post.locale);
  const canonical = `/${owner}/posts/${post.slug}`;
  const cover = post.coverImage && /^https?:\/\//.test(post.coverImage) ? post.coverImage : DEFAULT_OG_IMAGE;
  const image = cover === DEFAULT_OG_IMAGE
    ? { url: cover, ...OG_IMAGE_SIZE, alt: post.title }
    : { url: cover, alt: post.title };

  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALES[owner],
      title: post.title,
      description,
      section: post.category,
      authors: [copy.author.name],
      ...(post.publishedAt ? { publishedTime: post.publishedAt, modifiedTime: post.publishedAt } : {}),
      images: [image],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [cover] },
  };
}

export async function PostPage({ params, locale = "en" }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  if (post.slug !== slug) redirect(`/${locale}/posts/${post.slug}`);

  const copy = messages[getLocale(locale)];
  const backArrow = copy.dir === "rtl" ? "→" : "←";
  // Structured data describes the article itself, so it is keyed on the owning locale.
  const owner = getLocale(post.locale);
  const breadcrumbs = breadcrumbJsonLd([
    { name: SITE_NAME, path: `/${owner}` },
    { name: messages[owner].home.latestPosts, path: `/${owner}#posts` },
    { name: post.title, path: `/${owner}/posts/${post.slug}` },
  ]);

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <SiteHeader />
      <article className={`${imperial.className} mx-auto max-w-3xl px-5 py-16 sm:px-9 sm:py-24`}>
        <Link href={`/${locale}#posts`} className="text-[11px] font-semibold tracking-[.16em] text-[#77736b] transition hover:text-[#a28d00]">{backArrow} {copy.post.allPosts}</Link>
        <p className="mt-14 text-[11px] font-semibold tracking-[.18em] text-[#77736b]">{post.category}</p>
        <h1 className="mt-5 text-5xl font-medium leading-[.92] tracking-[-.07em] sm:text-7xl">{post.title}</h1>
        {post.excerpt && <p className="mt-9 max-w-2xl text-2xl leading-9 tracking-[-.03em] text-[#57554f]">{post.excerpt}</p>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd(post, owner, descriptionFor(post) || copy.post.authorBio)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
        <RichArticleContent content={post.content} />
        <aside className="mt-16 border-y border-[#d8d8d4] py-7 sm:flex sm:items-center sm:gap-6">
          <Image src="/d-buckky-moral.png" alt={copy.author.name} width={112} height={112} className="h-20 w-20 rounded-full bg-[#f2d600] object-cover object-top" />
          <div className="mt-5 sm:mt-0">
            <p className="text-[11px] font-semibold tracking-[.16em] text-[#77736b]">{copy.post.aboutAuthor}</p>
            <Link href={`/${locale}/author`} className="mt-2 inline-block text-xl font-medium tracking-[-.035em] transition hover:text-[#a28d00]">{copy.author.name}</Link>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#57554f]">{copy.post.authorBio}</p>
          </div>
        </aside>
      </article>
      <ArticleToc label={copy.post.contents} />
      <PostEnhancements slug={post.slug} postId={post.id} copy={messages[locale].comments} />
      <SiteFooter />
    </main>
  );
}

export default function DefaultPostPage({ params }: PostPageProps) {
  return <PostPage params={params} />;
}
