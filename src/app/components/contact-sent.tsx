import Link from "next/link";
import { messages, localePath, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function ContactSent({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.contact.sent;
  const button = "inline-block border border-[#1b1b1b] px-6 py-3 text-[11px] font-semibold tracking-[.14em] transition hover:bg-[#1b1b1b] hover:text-white";

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <SiteHeader />
      <section className="flex flex-col items-center px-5 py-20 text-center sm:py-28">
        <div className="flex h-36 w-36 items-center justify-center rounded-full border-[5px] border-[#8fe3a4]">
          <svg className="h-16 w-16 text-[#8fe3a4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 className="mt-10 font-[family-name:var(--font-handwritten)] text-5xl font-semibold leading-none sm:text-6xl">{page.title}</h1>
        <p className="mt-5 max-w-xl font-[family-name:var(--font-handwritten)] text-2xl leading-snug text-[#5f6368] sm:text-3xl">{page.body}</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link className={button} href={localePath(locale, "")}>{page.home}</Link>
          <Link className={button} href={localePath(locale, "/contact")}>{page.another}</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
