import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { TermsPage } from "../../terms/page";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/terms",
  title: copy.terms.metaTitle,
  description: copy.terms.intro,
});

export default function Page() {
  return <TermsPage locale="en" />;
}
