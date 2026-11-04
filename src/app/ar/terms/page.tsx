import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { TermsPage } from "../../terms/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/terms",
  title: copy.terms.metaTitle,
  description: copy.terms.intro,
});

export default function Page() {
  return <TermsPage locale="ar" />;
}
