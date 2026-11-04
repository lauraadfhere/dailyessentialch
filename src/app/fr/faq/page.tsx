import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { FaqPage } from "../../faq/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/faq",
  title: copy.faq.metaTitle,
  description: copy.faq.metaDescription,
});

export default function Page() {
  return <FaqPage locale="fr" />;
}
