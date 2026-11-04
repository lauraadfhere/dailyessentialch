import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { EbooksPage } from "../../ebooks/page";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/ebooks",
  title: copy.ebooks.metaTitle,
  description: copy.ebooks.intro,
});

export default function Page() {
  return <EbooksPage locale="en" />;
}
