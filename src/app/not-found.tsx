"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocale, messages } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

export default function NotFound() {
  const locale = getLocale(usePathname().split("/")[1]);
  const copy = messages[locale];
  return (
    <main dir={copy.dir} className="min-h-screen bg-[#1b1b1b] text-white">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 py-16 sm:px-9 sm:py-24 lg:px-12">
        <div className="not-found-block not-found-block-one" aria-hidden="true" />
        <div className="not-found-block not-found-block-two" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid min-h-[58vh] max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="max-w-xl">
            <p className="text-7xl font-black leading-none tracking-[-.08em] text-[#f2d600] sm:text-9xl">404</p>
            <h1 className="mt-6 text-4xl font-medium leading-[.95] tracking-[-.05em] sm:text-6xl">{copy.notFound.title}</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/70">{copy.notFound.body}</p>
            <Link href={`/${locale}`} className="mt-10 inline-flex bg-[#f2d600] px-5 py-3 text-[11px] font-semibold tracking-[.14em] text-[#1b1b1b] transition hover:bg-white">{copy.notFound.cta}</Link>
          </div>
          <div className="pixel-sad-face mx-auto w-full max-w-[420px]" role="img" aria-label="A block-built sad face">
            <span className="pixel-eye pixel-eye-left" aria-hidden="true" />
            <span className="pixel-eye pixel-eye-right" aria-hidden="true" />
            <span className="pixel-mouth" aria-hidden="true" />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
