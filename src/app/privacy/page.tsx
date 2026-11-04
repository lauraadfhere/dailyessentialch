import Link from "next/link";
import { messages, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export function PrivacyPage({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.privacy;
  const backArrow = copy.dir === "rtl" ? "→" : "←";
  return <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]"><SiteHeader /><article className="mx-auto max-w-3xl px-5 py-16 sm:px-9 sm:py-24"><p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.eyebrow}</p><h1 className="mt-5 text-5xl font-medium tracking-[-.065em] sm:text-7xl">{page.title}</h1><p className="mt-12 text-lg leading-8 text-[#4e4d48]">{page.intro}</p><h2 className="mt-12 text-2xl font-medium">{page.sectionTitle}</h2><p className="mt-4 leading-8 text-[#4e4d48]">{page.sectionBody}</p><Link href={`/${locale}`} className="mt-12 inline-block text-[11px] font-semibold tracking-[.16em] underline underline-offset-4">{backArrow} {page.backHome}</Link></article><SiteFooter /></main>;
}

export default function Page() {
  return <PrivacyPage locale="en" />;
}
