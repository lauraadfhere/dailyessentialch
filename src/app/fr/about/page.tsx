import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AboutPage } from "../../about/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/about",
  title: copy.about.metaTitle,
  description: copy.about.intro,
});

export default function Page() {
  return <AboutPage locale="fr" />;
}
