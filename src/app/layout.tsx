import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { CookieBanner } from "./components/cookie-banner";
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
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${handwritten.variable} h-full antialiased`}
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
