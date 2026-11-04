import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { TermsPage } from "../../terms/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/terms",
  title: copy.terms.metaTitle,
  description: copy.terms.intro,
});

export default function Page() {
  return <TermsPage locale="fr" />;
}
