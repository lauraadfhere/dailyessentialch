import Link from "next/link";
import { messages, type Locale } from "@/lib/i18n";
import { getLegal, type LegalPageKey } from "@/lib/legal";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

/** Renders managed legal copy: "## " starts a section heading, blank lines separate paragraphs. */
export async function LegalPage({ locale = "en", pageKey }: { locale?: Locale; pageKey: LegalPageKey }) {
  const copy = messages[locale];
  const page = copy.privacy;
  const legal = await getLegal(pageKey);
  const backArrow = copy.dir === "rtl" ? "→" : "←";
  const blocks = legal.body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-9 sm:py-24">
        <p className="text-[11px] font-semibold tracking-[.18em] text-[#72726d]">{page.eyebrow}</p>
        <h1 className="mt-5 text-5xl font-medium tracking-[-.065em] sm:text-7xl">{legal.title}</h1>
        {legal.intro && <p className="mt-12 text-lg leading-8 text-[#4e4d48]">{legal.intro}</p>}
        {blocks.map((block, index) =>
          block.startsWith("## ") ? (
            <h2 key={index} className="mt-12 text-2xl font-medium">{block.slice(3)}</h2>
          ) : (
            <p key={index} className="mt-4 leading-8 text-[#4e4d48]">{block}</p>
          ),
        )}
        {legal.updatedAt && (
          <p className="mt-12 text-[12px] text-[#72726d]">
            Last updated {new Date(legal.updatedAt).toLocaleDateString(locale === "en" ? "en-GB" : locale)}
          </p>
        )}
        <Link href={`/${locale}`} className="mt-12 inline-block text-[11px] font-semibold tracking-[.16em] underline underline-offset-4">{backArrow} {page.backHome}</Link>
      </article>
      <SiteFooter />
    </main>
  );
}
