"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getLocale, messages, type Locale } from "@/lib/i18n";
import { LanguageMenu, SiteFooter } from "./components/site-chrome";

type Post = { id: string; slug: string; title: string };
type CategoryIconName = "journal" | "library" | "shop" | "discover";

const categories: { key: "journal" | "ebooks" | "shop" | "marketplace"; href: string; icon: CategoryIconName }[] = [
  { key: "journal", href: "#posts", icon: "journal" },
  { key: "ebooks", href: "ebooks", icon: "library" },
  { key: "shop", href: "shop", icon: "shop" },
  { key: "marketplace", href: "marketplace", icon: "discover" },
];

function CategoryIcon({ name }: { name: CategoryIconName }) {
  const paths = {
    journal: <><path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" /><path d="M8.5 4.5v15M11 9h4M11 12.5h4" /></>,
    library: <><path d="M5 5.5h4v13H5zM10 4.5h4v14h-4zM15 6.5h4v12h-4z" /><path d="M5 19.5h14" /></>,
    shop: <><path d="M4 9h16l-1 11H5L4 9Z" /><path d="m6 9 1.5-5h9L18 9M9 12.5a3 3 0 0 0 6 0" /></>,
    discover: <><circle cx="12" cy="12" r="7.5" /><path d="m14.8 9.2-1.9 4-4 1.9 1.9-4 4-1.9ZM12 3v2M12 19v2M3 12h2M19 12h2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-7 w-7">{paths[name]}</svg>;
}

export function Home({ locale: initialLocale = "en" }: { locale?: string }) {
  const locale = getLocale(initialLocale) as Locale;
  const copy = messages[locale];
  const base = `/${locale}`;
  const arrow = copy.dir === "rtl" ? "←" : "→";

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = copy.dir;
  }, [locale, copy.dir]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const response = await fetch(`/api/posts?locale=${encodeURIComponent(locale)}`, { signal: controller.signal });
        const data = await response.json() as { posts?: Post[]; error?: string };
        if (!response.ok) throw new Error(data.error || copy.home.loadError);
        setPosts(data.posts ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setLoadError(error instanceof Error ? error.message : copy.home.loadError);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadPosts();
    return () => controller.abort();
  }, [locale, copy.home.loadError]);

  const visiblePosts = posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));
  const postsPerPage = 30;
  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / postsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = visiblePosts.slice((safePage - 1) * postsPerPage, safePage * postsPerPage);

  return (
    <main lang={locale} dir={copy.dir} className="home-page min-h-screen bg-[#1b1b1b] font-sans">
      <header id="top" className="relative bg-[#1c1c1c] px-5 py-6 text-white sm:px-9 lg:px-12">
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-3"><a href="#top" aria-label={copy.a11y.home}><Image src="/daily-essential-white.png" alt="Daily Essential" width={4000} height={1009} sizes="(max-width: 640px) 160px, 192px" priority className="h-auto w-40 sm:w-48" /></a><span aria-hidden="true" className="header-read-tag hidden sm:inline-block">READ</span></div>
            <div className="flex items-center gap-3">
              <a className="amazon-author-link" href="https://www.amazon.com/stores/author/B0HPTRT8FN/about?ingress=0&visitId=3582be7a-e747-46e5-9936-f41a5de8cd40&ref_=aufs_ap_ahdr_dsk_ab&ccs_id=53d2a28f-5397-4dec-a3ff-1491c53ec2a5" target="_blank" rel="noreferrer" aria-label={copy.a11y.amazon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 16.4 9.1 7.2h2.2l2.9 9.2H12l-.6-2H8.8l-.6 2H6.1Zm3.9-6.6-.8 2.9h1.6l-.8-2.9Z" /><path d="M5.8 18.2c3.5 2.1 8.2 2.1 11.8 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></a>
              <a className="flex h-5 w-5 items-center justify-center text-[#f2d600] transition hover:scale-110 hover:text-white" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="Daily Essential on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M5.1 3.5A2.1 2.1 0 1 1 5 7.7a2.1 2.1 0 0 1 .1-4.2ZM3.3 9h3.6v11.5H3.3V9Zm5.8 0h3.5v1.6h.1c.5-.9 1.7-2 3.7-2 4 0 4.7 2.5 4.7 5.8v6.1h-3.6V15c0-1.3 0-3-2-3s-2.3 1.4-2.3 2.9v5.6H9.1V9Z" /></svg></a>
              <a className="flex h-5 w-5 items-center justify-center text-[#f2d600] transition hover:scale-110 hover:text-white" href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="Daily Essential on YouTube"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5S6.4 4.5 4.5 5A3 3 0 0 0 2.4 7.1C2 9 2 12 2 12s0 3 .4 4.9A3 3 0 0 0 4.5 19c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.9ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg></a>
              <LanguageMenu locale={locale} />
              <button className="ms-1 text-3xl leading-none text-white/80 transition hover:scale-110 hover:text-white" type="button" onClick={() => setSearchOpen(true)} aria-label={copy.a11y.search}>&#8981;</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium" aria-label={copy.a11y.mainNav}>
              <a className="site-nav-link transition" href="#posts">{copy.nav.latest}</a>
              <a className="site-nav-link transition" href={`${base}/author`}>{copy.nav.author}</a>
              <a className="site-nav-link transition" href={`${base}/about`}>{copy.nav.about}</a>
              <a className="site-nav-link transition" href={`${base}/contact`}>{copy.nav.contact}</a>
              <a className="site-nav-link transition" href={`${base}/ebooks`}>{copy.nav.ebooks}</a>
              <a className="site-nav-link transition" href={`${base}/shop`}>{copy.nav.shop}</a>
            </nav>
            <a className="text-[11px] font-semibold tracking-[0.14em] text-white/60 transition hover:text-white sm:hidden" href="#posts">{copy.home.searchLabel}</a>
          </div>
          <a className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-white/60 transition hover:text-white" href="#posts">{copy.home.scrollToPosts} <span className="text-base leading-none" aria-hidden="true">&#8595;</span></a>
        </div>
        {searchOpen && <div className="absolute inset-x-0 top-0 z-10 bg-[#1c1c1c] px-5 py-6 sm:px-9 lg:px-12"><form className="mx-auto flex max-w-7xl items-center gap-4" role="search" onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="post-search">{copy.home.searchLabel}</label><input id="post-search" autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} className="min-w-0 flex-1 border-b border-white/60 bg-transparent py-2 text-lg text-white outline-none placeholder:text-white/45" placeholder={copy.home.searchPlaceholder} /><button type="button" className="text-[11px] font-semibold tracking-[0.14em] text-white/70 hover:text-white" onClick={() => setSearchOpen(false)}>{copy.home.close.toUpperCase()}</button></form></div>}
      </header>

      <section className="home-author-hero overflow-hidden bg-[#f2d600] px-5 py-3 text-[#1b1b1b] sm:px-9 sm:py-4 lg:px-12" aria-labelledby="home-author-heading">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[-.02em]">{copy.home.authorKicker}</p>
            <h1 id="home-author-heading" className="mt-1 text-4xl font-semibold tracking-[-.015em] leading-[1] sm:text-5xl">{copy.author.name}</h1>
            <p className="home-author-text mt-2 max-w-2xl text-base leading-6 sm:text-lg">{copy.home.authorLead}</p>
            <p className="home-author-text mt-3 max-w-2xl text-sm leading-6 sm:text-base">{copy.home.authorStory}</p>
            <p className="mt-3 text-sm font-semibold italic leading-6 sm:text-base">{copy.home.authorTagline}</p>
            <a href={`${base}/author`} className="home-author-link mt-3 inline-flex items-center gap-2 text-sm font-medium">{copy.home.meetAuthor} <span aria-hidden="true">→</span></a>
          </div>
          <Image src="/heroimage.png" alt={copy.author.name} width={1064} height={1479} priority className="hidden h-auto w-28 shrink-0 object-contain sm:block sm:w-36 lg:w-44" />
        </div>
      </section>

      <section id="posts" className="bg-white px-5 py-14 text-[#1b1b1b] sm:px-9 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <div className="home-section-heading mb-6">
              <h2 className="admin-display text-[34px] font-normal leading-tight text-[#0f1111]">{copy.home.latestPosts}</h2>
            </div>
            <nav aria-label={copy.home.latestPosts}>
            {isLoading && Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-baseline gap-5 py-3 sm:gap-8 sm:py-4" aria-hidden="true"><span className="h-3 w-5 animate-pulse bg-[#e5e5e1]" /><span className="h-7 w-4/5 animate-pulse bg-[#e5e5e1] sm:w-3/5" /></div>
            ))}
            {!isLoading && paginatedPosts.map((post, index) => (
              <a key={post.id} href={`/${locale}/posts/${post.slug}`} className="post-row flex items-baseline gap-4 py-4 sm:gap-7">
                <span className="post-index w-6 shrink-0 text-xs font-medium">{String((safePage - 1) * postsPerPage + index + 1).padStart(2, "0")}</span>
                <span className="post-title admin-display flex-1 text-xl font-normal sm:text-2xl">{post.title}</span>
                <span className="post-arrow shrink-0 text-base" aria-hidden="true">{arrow}</span>
              </a>
            ))}
            {!isLoading && loadError && <p className="py-6 text-sm text-[#9f321f]">{copy.home.loadError}</p>}
            {!isLoading && !loadError && visiblePosts.length === 0 && <p className="py-6 text-sm text-[#72726d]">{copy.home.noPosts}</p>}
            </nav>
            {!isLoading && !loadError && visiblePosts.length > postsPerPage && <nav className="mt-10 flex flex-wrap items-center gap-2" aria-label={copy.home.latestPosts}><button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safePage === 1} className="pagination-control" aria-label={copy.a11y.previousPage}>←</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} type="button" onClick={() => setCurrentPage(index + 1)} className={`pagination-control ${safePage === index + 1 ? "is-active" : ""}`} aria-current={safePage === index + 1 ? "page" : undefined}>{index + 1}</button>)}<button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safePage === totalPages} className="pagination-control" aria-label={copy.a11y.nextPage}>→</button></nav>}
          </div>
          <aside className="voxel-panel relative min-h-72 overflow-hidden bg-[#101010] text-white lg:sticky lg:top-6" aria-label="Dark voxel-inspired art card">
            <div className="voxel-point" aria-hidden="true" />
            <div className="voxel-art voxel-art-one" aria-hidden="true" /><div className="voxel-art voxel-art-two" aria-hidden="true" />
            <div className="voxel-floor" aria-hidden="true" />
            <div className="relative z-10 flex min-h-72 flex-col justify-between p-6">
              <p className="text-[10px] font-bold tracking-[0.18em] text-white/55">{copy.home.pixelLabel}</p>
              <p className="max-w-44 text-2xl font-semibold leading-none tracking-[-0.05em]">{copy.home.pixelQuote}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-showcase bg-[#f7f4eb] px-5 py-10 text-[#1b1b1b] sm:px-9 sm:py-14 lg:px-12" aria-labelledby="home-showcase-heading">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 sm:gap-8">
          <h2 id="home-showcase-heading" className="showcase-title max-w-3xl text-3xl font-medium leading-[1.02] tracking-[-.055em] sm:text-5xl">{copy.footer.tagline}</h2>
        </div>
      </section>

      <section className="bg-[#1c1c1c] px-5 py-14 text-white sm:px-9 sm:py-20 lg:px-12" aria-labelledby="explore-heading">
        <div className="mx-auto max-w-7xl">
          <div className="home-section-heading home-section-heading-dark">
            <span className="home-section-mark" aria-hidden="true">✦</span>
            <h2 id="explore-heading" className="max-w-xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{copy.home.exploreHeading}</h2>
            <span className="home-section-rule" aria-hidden="true" />
          </div>
          <div className="mt-10 grid gap-px overflow-hidden bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const item = copy.home.categories[category.key];
              const href = category.href.startsWith("#") ? category.href : `${base}/${category.href}`;
              return (
                <a key={category.key} href={href} className="category-card group min-h-52 overflow-hidden bg-[#1c1c1c] p-6 transition-colors duration-300 hover:bg-[#292929] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#f2d600]">
                 
                  <span className="category-icon flex h-12 w-12 items-center justify-center rounded-full bg-[#f2d600] text-[#1b1b1b] transition-transform duration-300 ease-out group-hover:-translate-y-1"><CategoryIcon name={category.icon} /></span>
                  <h3 className="mt-12 text-xl font-medium tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-2 max-w-52 text-sm leading-6 text-white/65">{item.description}</p>
                  <span className="mt-5 inline-block text-sm text-[#f2d600] transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden="true">→</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
      <a href="#top" className="fixed bottom-5 end-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c] text-lg text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black" aria-label={copy.a11y.backToTop}>&#8593;</a>
    </main>
  );
}

export default function HomePage() {
  return <Home locale="en" />;
}
