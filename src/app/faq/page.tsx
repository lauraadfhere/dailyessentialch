import { messages, type Locale } from "@/lib/i18n";
import { faqJsonLd, jsonLd } from "@/lib/seo";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

const faqIcons = [
  // Chat bubble
  <path key="a" d="M4 5h16v11H9l-5 4V5Z" />,
  // Info
  <><circle key="b1" cx="12" cy="12" r="9" /><path key="b2" d="M12 11v5M12 8h.01" /></>,
  // Book
  <path key="c" d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 0v16" />,
  // Shield
  <path key="d" d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3Z" />,
  // Clock
  <><circle key="e1" cx="12" cy="12" r="9" /><path key="e2" d="M12 7v5l3 2" /></>,
  // Mail
  <><rect key="f1" x="3" y="5" width="18" height="14" rx="1" /><path key="f2" d="m3 7 9 6 9-6" /></>,
];

export function FaqPage({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.faq;
  return <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(page.questions)) }} /><SiteHeader /><section className="mx-auto max-w-3xl px-5 py-16 sm:px-9 sm:py-24"><p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.eyebrow}</p><h1 className="mt-5 text-5xl font-medium tracking-[-.065em] sm:text-7xl">{page.title}</h1><div className="mt-14 space-y-8">{page.questions.map((item, index) => <div key={item.question} className="border-b border-[#dededb] pb-8"><div className="flex items-center gap-4"><svg className="h-7 w-7 shrink-0 text-[#a28d00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{faqIcons[index % faqIcons.length]}</svg><h2 className="text-2xl font-medium">{item.question}</h2></div><p className="mt-3 pl-11 leading-8 text-[#4e4d48]">{item.answer}</p></div>)}</div></section><SiteFooter /></main>;
}

export default function Page() {
  return <FaqPage locale="en" />;
}
