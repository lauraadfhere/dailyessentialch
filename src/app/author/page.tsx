import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { messages, type Locale } from "@/lib/i18n";
import { getProfile, isSafeImageUrl } from "@/lib/profile";
import { jsonLd, pageMetadata, personJsonLd } from "@/lib/seo";
import AuthorHeroArt, { AuthorPen } from "./author-hero-art";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export async function AuthorPage({ locale = "en" }: { locale?: Locale }) {
  await connection();
  const copy = messages[locale];
  const page = copy.author;
  const profile = await getProfile();
  const name = profile.name || page.name;
  const avatar = profile.avatarUrl && isSafeImageUrl(profile.avatarUrl) ? profile.avatarUrl : "";
  const paragraphs = profile.bio
    ? profile.bio.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : page.paragraphs;
  // The CMS profile wins here, so search engines describe the same author the page shows.
  const authorSchema = personJsonLd(locale, { name, description: profile.headline, image: avatar });

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-[#f7f4eb] text-[#1b1b1b]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(authorSchema) }} />
      <SiteHeader />
      <section className="overflow-hidden bg-[#f2d600] px-5 py-14 sm:px-9 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[minmax(0,1fr)_250px_280px] lg:gap-12">
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold tracking-[-.02em]">{page.kicker}</p>
            <h1 className="mt-6 text-5xl font-medium leading-[.9] tracking-[-.065em] sm:text-7xl lg:text-[5.7rem]">{name}</h1>
            <AuthorPen />
            <p className="mt-9 max-w-2xl text-xl leading-8 tracking-[-.025em] sm:text-2xl sm:leading-9">{profile.headline || page.lead}</p>
          </div>
          <div className="relative mx-auto w-full max-w-[250px] self-end lg:max-w-none">
            <div className="absolute inset-x-7 bottom-4 h-12 rounded-[50%] bg-[#1b1b1b]/20 blur-xl" aria-hidden="true" />
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="relative z-10 mx-auto h-auto w-full object-contain" />
            ) : (
              <Image src="/d-buckky-moral.png" alt={name} width={1200} height={1200} priority className="relative z-10 h-auto w-full object-contain" sizes="(max-width: 1024px) 310px, 360px" />
            )}
          </div>
          <AuthorHeroArt />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-9 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.62fr)] lg:gap-24">
          <div className="max-w-2xl space-y-7 text-lg leading-8 text-[#4e4b45] sm:text-xl sm:leading-9">
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <aside className="border-t-2 border-[#1b1b1b] pt-6 lg:mt-2" aria-label={page.metaTitle}>
            <p className="max-w-sm text-3xl font-medium leading-[1.02] tracking-[-.05em] sm:text-4xl">{page.signature}</p>
            <Link href={`/${locale}#posts`} className="author-cta mt-9 inline-flex items-center gap-3 text-[11px] font-semibold tracking-[.15em] text-[#1b1b1b]">{page.cta} <span aria-hidden="true">→</span></Link>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/author",
  title: messages.en.author.metaTitle,
  description: messages.en.author.lead,
});

export default function Page() {
  return <AuthorPage locale="en" />;
}
