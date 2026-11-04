import Image from "next/image";
import Link from "next/link";
import { amazonLink, books, type Book } from "@/lib/books";
import { messages, type Copy, type Locale } from "@/lib/i18n";
import { bookListJsonLd, jsonLd } from "@/lib/seo";
import { SiteFooter, SiteHeader } from "./site-chrome";

function formatLabel(book: Book, copy: Copy["ebooks"]) {
  if (book.type === "ebook") return copy.ebook;
  if (book.type === "paperback") return copy.paperback;
  return copy.ebookAndPrint;
}

export function BookLibrary({ locale }: { locale: Locale }) {
  const copy = messages[locale];
  const page = copy.ebooks;
  const arrow = copy.dir === "rtl" ? "←" : "→";

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(bookListJsonLd(locale, page.title)) }} />
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-9 sm:py-20 lg:px-12">
        <p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[.92] tracking-[-.065em] sm:text-7xl">{page.title}</h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-[#4e4d48]">{page.intro}</p>

        <ul className="mt-14 flex list-none flex-col gap-6">
          {books.map((book) => {
            const bookHref = `/${locale}/books/${book.slug}`;
            return (
              <li key={book.id} className="grid grid-cols-1 gap-6 border border-[#dedcd3] bg-white p-5 sm:grid-cols-[160px_1fr] sm:p-6 lg:grid-cols-[180px_1fr_260px] lg:gap-8">
                <Link href={bookHref} className="relative block w-40 shrink-0 overflow-hidden self-start sm:w-full">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    width={900}
                    height={1350}
                    sizes="(max-width: 640px) 160px, 180px"
                    className="h-auto w-full shadow-[0_2px_6px_rgba(0,0,0,.15)]"
                  />
                  {book.isNew && (
                    <span className="absolute start-2 top-2 bg-[#f2d600] px-2 py-1 text-[10px] font-bold tracking-[.12em] text-[#1b1b1b]">{page.newRelease}</span>
                  )}
                </Link>

                <div className="min-w-0">
                  <h2 className="text-2xl font-normal leading-tight tracking-[-.02em] sm:text-[26px]">
                    <Link className="text-[#0f1111] transition hover:text-[#c45500]" href={bookHref}>
                      {book.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-[#565959]">
                    {book.series ? <span>{book.series}</span> : <span>{page.ebook}</span>}
                    {book.ageRange && <span> · {page.ages} {book.ageRange}</span>}
                    <span className="mx-2 text-[#cccccc]">|</span>
                    <span>{copy.book.format}: {formatLabel(book, page)}</span>
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#0f1111]">{book.excerpt}</p>
                  {(book.rating || book.pages || book.isbn) && (
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-[#0f1111]">
                      {book.rating !== undefined && (
                        <>
                          <dt className="font-bold">Rating</dt>
                          <dd>{"★".repeat(Math.round(book.rating))}{"☆".repeat(5 - Math.round(book.rating))} {book.rating.toFixed(1)}{book.ratingCount !== undefined ? ` (${book.ratingCount} ratings)` : ""}</dd>
                        </>
                      )}
                      {book.pages !== undefined && (
                        <>
                          <dt className="font-bold">Pages</dt>
                          <dd>{book.pages}</dd>
                        </>
                      )}
                      {book.isbn && (
                        <>
                          <dt className="font-bold">ISBN</dt>
                          <dd>{book.isbn}</dd>
                        </>
                      )}
                    </dl>
                  )}
                  <Link href={`${bookHref}#reviews`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#007185] transition hover:text-[#c45500] hover:underline">
                    {copy.reviews.heading}
                    <span aria-hidden="true">{arrow}</span>
                  </Link>
                </div>

                <aside className="border border-[#d5d9d9] bg-[#f7f8f8] p-4 lg:self-start">
                  <p className="text-sm font-bold text-[#0f1111]">{formatLabel(book, page)}</p>
                  {book.price && (
                    <p className="mt-1 text-2xl font-normal text-[#0f1111]">
                      <span className="align-top text-xs">$</span>
                      {book.price}
                    </p>
                  )}
                  <a
                    className="mt-4 flex w-full items-center justify-center rounded-full border border-[#fcd200] bg-[#ffd814] px-4 py-2 text-sm font-medium text-[#0f1111] transition hover:bg-[#f7ca00]"
                    href={amazonLink(book)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {page.viewOnAmazon}
                  </a>
                </aside>
              </li>
            );
          })}
        </ul>

        <p className="mt-14 text-xs font-medium tracking-[.02em] text-[#72726d]">{page.amazonNote}</p>
      </section>
      <SiteFooter />
    </main>
  );
}
