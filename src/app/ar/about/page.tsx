import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AboutPage } from "../../about/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/about",
  title: copy.about.metaTitle,
  description: copy.about.intro,
});

export default function Page() {
  return <AboutPage locale="ar" />;
}
