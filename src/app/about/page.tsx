import { messages, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export function AboutPage({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.about;
  return <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]"><SiteHeader /><section className="mx-auto max-w-7xl px-5 py-16 sm:px-9 sm:py-20 lg:px-12"><p className="text-[11px] font-semibold tracking-[0.18em] text-[#72726d]">{page.eyebrow}</p><h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[.91] tracking-[-.07em] sm:text-7xl">{page.title}</h1><div className="mt-16 grid gap-12 md:grid-cols-2"><p className="max-w-md text-lg leading-8 text-[#55534d]">{page.intro}</p><div className="space-y-8"><div><p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.povLabel}</p><p className="mt-3 text-2xl font-medium tracking-[-.04em]">{page.povText}</p></div><div><p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.journalLabel}</p><p className="mt-3 text-2xl font-medium tracking-[-.04em]">{page.journalText}</p></div></div></div></section><SiteFooter /></main>;
}

export default function Page() {
  return <AboutPage locale="en" />;
}
