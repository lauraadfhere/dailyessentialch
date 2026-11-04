import Image from "next/image";
import Link from "next/link";
import { amazonLink, type Book } from "@/lib/books";
import { messages, type Locale } from "@/lib/i18n";
import { SITE_NAME, bookJsonLd, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { SiteFooter, SiteHeader } from "./site-chrome";
import BookReviews from "./book-reviews";

function formatLabel(book: Book, page: (typeof messages)[Locale]["ebooks"]) {
  if (book.type === "ebook") return page.ebook;
  if (book.type === "paperback") return page.paperback;
  return page.ebookAndPrint;
}

/** One title's page: cover, details, the Amazon buy link and its reader reviews. */
export function BookPage({ locale, book }: { locale: Locale; book: Book }) {
  const copy = messages[locale];
  const page = copy.ebooks;
  const text = copy.book;
  const backArrow = copy.dir === "rtl" ? "→" : "←";
  const breadcrumbs = breadcrumbJsonLd([
    { name: SITE_NAME, path: `/${locale}` },
    { name: page.title, path: `/${locale}/ebooks` },
    { name: book.shortTitle, path: `/${locale}/books/${book.slug}` },
  ]);

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(bookJsonLd(book, locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-9 sm:py-20 lg:px-12">
        <Link
          href={`/${locale}/ebooks`}
          className="text-[11px] font-semibold tracking-[.16em] text-[#77736b] transition hover:text-[#a28d00]"
        >
          {backArrow} {text.backToLibrary}
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(220px,340px)_minmax(0,1fr)] lg:gap-16">
          <div className="relative w-full max-w-[340px] overflow-hidden border border-[#e2e0d9] bg-[#f7f4eb]">
            <Image
              src={book.cover}
              alt={book.title}
              width={900}
              height={1350}
              priority
              sizes="(max-width: 1024px) 80vw, 340px"
              className="h-auto w-full"
            />
            {book.isNew && (
              <span className="absolute start-2 top-2 bg-[#f2d600] px-2 py-1 text-[10px] font-bold tracking-[.12em] text-[#1b1b1b]">
                {page.newRelease}
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[.16em] text-[#8f8d85]">
              {book.series ? book.series.toUpperCase() : page.ebook.toUpperCase()}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[.95] tracking-[-.05em] sm:text-6xl">{book.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4e4d48]">{book.excerpt}</p>

            <h2 className="sr-only">{text.details}</h2>
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 border-y border-[#e2e0d9] py-5 text-sm">
              <div>
                <dt className="text-[10px] font-semibold tracking-[.14em] text-[#8f8d85]">{text.format.toUpperCase()}</dt>
                <dd className="mt-1 text-[#383735]">{formatLabel(book, page)}</dd>
              </div>
              {book.ageRange && (
                <div>
                  <dt className="text-[10px] font-semibold tracking-[.14em] text-[#8f8d85]">{text.ages.toUpperCase()}</dt>
                  <dd className="mt-1 text-[#383735]">{book.ageRange}</dd>
                </div>
              )}
              {book.series && (
                <div className="col-span-2">
                  <dt className="text-[10px] font-semibold tracking-[.14em] text-[#8f8d85]">{text.series.toUpperCase()}</dt>
                  <dd className="mt-1 text-[#383735]">{book.series}</dd>
                </div>
              )}
            </dl>

            <a
              className="mt-7 inline-flex w-fit items-center gap-2 bg-[#1b1b1b] px-5 py-3 text-[11px] font-semibold tracking-[.14em] text-white transition hover:bg-[#a28d00]"
              href={amazonLink(book)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {page.viewOnAmazon}
              <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-3 text-xs text-[#72726d]">{page.amazonNote}</p>
          </div>
        </div>
      </section>

      <BookReviews bookSlug={book.slug} locale={locale} copy={copy.reviews} />
      <SiteFooter />
    </main>
  );
}
