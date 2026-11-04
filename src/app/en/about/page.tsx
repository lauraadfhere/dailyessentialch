import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AboutPage } from "../../about/page";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/about",
  title: copy.about.metaTitle,
  description: copy.about.intro,
});

export default function Page() {
  return <AboutPage locale="en" />;
}
