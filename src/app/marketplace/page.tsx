import Link from "next/link";
import { messages, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export function MarketplacePage({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.marketplace;
  return <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]"><SiteHeader /><section className="mx-auto max-w-7xl px-5 py-16 sm:px-9 sm:py-24 lg:px-12"><p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.eyebrow}</p><h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[.92] tracking-[-.065em] sm:text-7xl">{page.title}</h1><p className="mt-8 max-w-xl text-lg leading-8 text-[#4e4d48]">{page.body}</p><Link href={`/${locale}#posts`} className="mt-12 inline-block bg-[#1b1b1b] px-5 py-3 text-[11px] font-semibold tracking-[.14em] text-white transition hover:bg-[#a28d00]">{page.cta}</Link></section><SiteFooter /></main>;
}

export default function Page() {
  return <MarketplacePage locale="en" />;
}
