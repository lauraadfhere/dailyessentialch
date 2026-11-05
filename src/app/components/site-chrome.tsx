"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLocale, messages, type Locale } from "@/lib/i18n";
import { DEFAULT_LOGO, DEFAULT_LOGO_SETTINGS, type LogoSettings } from "@/lib/logo-config";

const amazonAuthorUrl = "https://www.amazon.com/stores/author/B0HPTRT8FN/about?ingress=0&visitId=3582be7a-e747-46e5-9936-f41a5de8cd40&ref_=aufs_ap_ahdr_dsk_ab&ccs_id=53d2a28f-5397-4dec-a3ff-1491c53ec2a5";

function useLocale() {
  const pathname = usePathname();
  const locale = getLocale(pathname.split("/")[1]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = messages[locale].dir;
  }, [locale]);
  return locale;
}

/** Header and footer logos chosen in the admin. Starts with the bundled defaults so nothing waits on the network. */
export function useSiteLogo(): LogoSettings {
  const [settings, setSettings] = useState<LogoSettings>(DEFAULT_LOGO_SETTINGS);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/logo", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: LogoSettings | null) => {
        if (data?.headerUrl) setSettings(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return settings;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/** Decorative 3D Earth: lettered latitude bands on a shaded sphere that drifts with a wave motion. */
export function AlphabetDome() {
  const cx = 210;
  const cy = 96;
  const radius = 88;
  const rows = Array.from({ length: 23 }, (_, index) => {
    const phi = ((-88 + index * 8) * Math.PI) / 180;
    const rx = Math.max(4, radius * Math.cos(phi));
    const ry = rx * 0.25;
    const y = cy + radius * Math.sin(phi);
    const copies = Math.max(1, Math.ceil((Math.PI * rx) / (ALPHABET.length * 6.5 * 0.42)));
    const opacity = 0.35 + 0.55 * Math.cos(phi);
    return { index, d: `M ${cx - rx} ${y} A ${rx} ${ry} 0 0 0 ${cx + rx} ${y}`, text: `${ALPHABET} `.repeat(copies), opacity };
  });
  return (
    <svg className="footer-alphabet-dome" viewBox="0 0 420 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="footer-earth-shade" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#d9d9d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3a3a36" stopOpacity="0.45" />
        </radialGradient>
        {rows.map((row) => <path key={row.index} id={`footer-alphabet-arc-${row.index}`} d={row.d} fill="none" />)}
      </defs>
      <circle cx={cx} cy={cy} r={radius} fill="#b8b8b3" />
      <g className="footer-earth-spin">
        {rows.map((row) => <text key={row.index} className="footer-alphabet-text" style={{ fillOpacity: row.opacity }}><textPath href={`#footer-alphabet-arc-${row.index}`} startOffset="0">{row.text}</textPath></text>)}
      </g>
      <circle cx={cx} cy={cy} r={radius} fill="url(#footer-earth-shade)" />
    </svg>
  );
}

function AmazonAuthorLink({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  return <a className={`amazon-author-link ${dark ? "amazon-author-link-dark" : ""}`} href={amazonAuthorUrl} target="_blank" rel="noreferrer" aria-label={messages[locale].a11y.amazon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 16.4 9.1 7.2h2.2l2.9 9.2H12l-.6-2H8.8l-.6 2H6.1Zm3.9-6.6-.8 2.9h1.6l-.8-2.9Z" /><path d="M5.8 18.2c3.5 2.1 8.2 2.1 11.8 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></a>;
}

const languageOptions = [
  { locale: "en", label: "English" },
  { locale: "fr", label: "Français" },
  { locale: "ar", label: "العربية" },
] as const;

/** Same page in another locale: swaps the leading locale segment of the current path. */
function localePath(pathname: string, target: Locale) {
  const segments = pathname.split("/");
  if (getLocale(segments[1]) === segments[1]) segments[1] = target;
  else segments.splice(1, 0, target);
  return segments.join("/") || `/${target}`;
}

/** Language switcher: shows the current locale, marks it in the list, and closes on Escape or outside click. */
export function LanguageMenu({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const copy = messages[locale];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30">
      <button ref={buttonRef} type="button" onClick={() => setOpen((current) => !current)} aria-label={copy.a11y.chooseLanguage} aria-expanded={open} aria-haspopup="menu" className="lang-trigger flex items-center gap-1 text-white/85 transition hover:text-[#f2d600]">
        <Image src="/global-language.png" alt="" width={128} height={128} className="h-5 w-5 brightness-0 invert" />
        <span className="text-[11px] font-bold tracking-[.12em]" aria-hidden="true">{locale.toUpperCase()}</span>
        <svg viewBox="0 0 10 6" aria-hidden="true" className={`h-1.5 w-2.5 fill-current transition-transform duration-200 ${open ? "rotate-180" : ""}`}><path d="M0 0h10L5 6z" /></svg>
      </button>
      {open && (
        <div role="menu" className="lang-menu absolute end-0 top-10 z-50 w-56 overflow-visible bg-white py-2 text-[#1c1c1c] shadow-[0_18px_40px_rgba(0,0,0,.35)]">
          <span className="absolute -top-2 end-4 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-[#f2d600]" aria-hidden="true" />
          <p className="px-4 pb-2 pt-1 text-[10px] font-bold tracking-[.16em] text-[#72726d]" aria-hidden="true">{copy.a11y.chooseLanguage.toUpperCase()}</p>
          {languageOptions.map((option) => {
            const active = option.locale === locale;
            return (
              <Link key={option.locale} href={localePath(pathname, option.locale)} role="menuitem" lang={option.locale} dir={option.locale === "ar" ? "rtl" : undefined} aria-current={active ? "true" : undefined} onClick={() => setOpen(false)} className={`lang-menu-item flex items-center justify-between gap-4 px-4 py-3 text-sm font-semibold transition-colors ${active ? "is-active" : ""}`}>
                <span>{option.label}</span>
                {active && <span className="lang-menu-check" aria-hidden="true">✓</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const locale = useLocale();
  const logo = useSiteLogo();
  const copy = messages[locale];
  const base = `/${locale}`;
  return <header dir={copy.dir} className="relative bg-[#232323] px-5 py-6 text-white sm:px-9 lg:px-12"><div className="relative z-10 mx-auto max-w-7xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Link className="home-link" href={base} aria-label={copy.a11y.home}><Image src={logo.headerUrl} unoptimized={logo.headerUrl !== DEFAULT_LOGO} alt="Daily Essential" width={4000} height={1009} sizes={`${logo.headerWidth}px`} priority style={{ width: logo.headerWidth }} className="h-auto" /></Link><span aria-hidden="true" className="header-read-tag inline-block">READ</span></div><div className="flex items-center gap-4"><LanguageMenu locale={locale} /><AmazonAuthorLink /><Link className="text-3xl leading-none text-white/80 transition hover:text-[#f2d600]" href={`${base}#posts`} aria-label={copy.a11y.search}>⌕</Link></div></div><nav className="utility-nav mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base font-semibold sm:text-lg" aria-label={copy.a11y.mainNav}><Link className="site-nav-link transition" href={base}>{copy.nav.home}</Link><Link className="site-nav-link transition" href={`${base}#posts`}>{copy.nav.latest}</Link><Link className="site-nav-link transition" href={`${base}/author`}>{copy.nav.author}</Link><Link className="site-nav-link transition" href={`${base}/about`}>{copy.nav.about}</Link><Link className="site-nav-link transition" href={`${base}/contact`}>{copy.nav.contact}</Link><Link className="site-nav-link transition" href={`${base}/ebooks`}>{copy.nav.ebooks}</Link><Link className="site-nav-link transition" href={`${base}/shop`}>{copy.nav.shop}</Link></nav></div></header>;
}

export function SiteFooter() {
  const locale = useLocale();
  const logo = useSiteLogo();
  const copy = messages[locale];
  const base = `/${locale}`;
  return <footer dir={copy.dir} className="bg-[#c7c7c3] px-5 py-6 text-[#222222] sm:px-9 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center text-center"><AlphabetDome /><Link className="home-link" href={base} aria-label={copy.a11y.home}><Image src={logo.footerUrl} unoptimized={logo.footerUrl !== DEFAULT_LOGO} alt="Daily Essential" width={4000} height={1009} sizes={`${logo.footerWidth}px`} style={{ width: logo.footerWidth }} className={`h-auto ${logo.footerUrl === DEFAULT_LOGO ? "brightness-0" : ""}`} /></Link><p className="footer-tagline mt-3 text-lg font-semibold tracking-[-.02em] text-black/85">{copy.footer.tagline}</p><div className="mt-4 flex items-center justify-center gap-5"><AmazonAuthorLink dark /><a className="footer-social-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label={copy.a11y.linkedIn}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 3.5A2.1 2.1 0 1 1 5 7.7a2.1 2.1 0 0 1 .1-4.2ZM3.3 9h3.6v11.5H3.3V9Zm5.8 0h3.5v1.6h.1c.5-.9 1.7-2 3.7-2 4 0 4.7 2.5 4.7 5.8v6.1h-3.6V15c0-1.3 0-3-2-3s-2.3 1.4-2.3 2.9v5.6H9.1V9Z" /></svg></a><a className="footer-social-link" href="https://www.youtube.com/@DailyEssential-g3y" target="_blank" rel="noreferrer" aria-label={copy.a11y.youTube}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5S6.4 4.5 4.5 5A3 3 0 0 0 2.4 7.1C2 9 2 12 2 12s0 3 .4 4.9A3 3 0 0 0 4.5 19c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.9ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg></a><a className="footer-admin-link" href="/admin/login" aria-label={copy.a11y.admin} title={copy.a11y.admin}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 3.6h4.3a2 2 0 0 1 2 2v12.8a2 2 0 0 1-2 2h-4.3" /><path d="m9.6 8.4 3.6 3.6-3.6 3.6" /><path d="M4 12h9" /></svg></a></div><p className="mt-3 text-[11px] font-semibold tracking-[.14em] text-black/60">{copy.footer.copyright}</p><nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-semibold tracking-[.12em] text-black/55" aria-label={copy.a11y.footerNav}><Link className="footer-nav-link transition" href={`${base}/privacy`}>{copy.footer.privacy}</Link><Link className="footer-nav-link transition" href={`${base}/terms`}>{copy.footer.terms}</Link><Link className="footer-nav-link transition" href={`${base}/author`}>{copy.footer.author}</Link><Link className="footer-nav-link transition" href={`${base}/contact`}>{copy.footer.contact}</Link><Link className="footer-nav-link transition" href={`${base}/faq`}>{copy.footer.faq}</Link><Link className="footer-nav-link transition" href={`${base}/marketplace`}>{copy.footer.marketplace}</Link></nav></div></footer>;
}
