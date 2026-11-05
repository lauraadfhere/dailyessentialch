import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { CookieBanner } from "./components/cookie-banner";
import { fontStack } from "@/lib/font-config";
import { getFontSettings } from "@/lib/font-settings";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, OG_IMAGE_SIZE, OG_LOCALES, jsonLd, languageAlternates, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const handwritten = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
});

// Editorial display face for the author's name; self-hosted like the article font.
const fraunces = localFont({
  src: "./fonts/fraunces-display.woff2",
  weight: "400 900",
  display: "swap",
  variable: "--font-fraunces",
});

// Display face for the author's name in the home hero.
const denitahStellar = localFont({
  src: "../../public/DenitahStellar.otf",
  display: "swap",
  variable: "--font-denitah-stellar",
});

const siteDescription = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Journal`, template: `%s | ${SITE_NAME}` },
  description: siteDescription,
  applicationName: SITE_NAME,
  authors: [{ name: "D. Buckky Moral", url: "/en/author" }],
  creator: "D. Buckky Moral",
  publisher: SITE_NAME,
  category: "lifestyle",
  alternates: { languages: languageAlternates("") },
  // Crawl directives are set per page in src/lib/seo.ts: a site-wide googleBot block
  // here contradicted pages that opt out (noindex), because Googlebot tags win.
  openGraph: {
    type: "website",
    locale: OG_LOCALES.en,
    alternateLocale: [OG_LOCALES.fr, OG_LOCALES.ar],
    siteName: SITE_NAME,
    url: "/en",
    title: `${SITE_NAME} | Journal`,
    description: siteDescription,
    images: [{ url: DEFAULT_OG_IMAGE, ...OG_IMAGE_SIZE, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} | Journal`, description: siteDescription, images: [DEFAULT_OG_IMAGE] },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = { themeColor: "#1b1b1b", colorScheme: "light" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = await getFontSettings();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${denitahStellar.variable} ${handwritten.variable} h-full antialiased`}
      style={{ "--site-body-font": fontStack(fonts.bodyFont), "--site-post-title-font": fontStack(fonts.postTitleFont) } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd()) }} />
        {children}
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </body>
    </html>
  );
}
