import { messages, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function ComingSoonPage({ locale, kind }: { locale: Locale; kind: "shop" | "ebooks" }) {
  const copy = messages[locale];
  const page = copy[kind];
  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-[#1b1b1b] font-sans text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-9 lg:px-12">
        <p className="text-[11px] font-semibold tracking-[.18em] text-white/60">{copy.nav[kind]}</p>
        <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">{page.title}</h1>
        <p className="mt-4 text-lg text-white/80">{page.comingSoon}</p>
      </section>
      <SiteFooter />
    </main>
  );
}
