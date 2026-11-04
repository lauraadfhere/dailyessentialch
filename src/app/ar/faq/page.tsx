import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { FaqPage } from "../../faq/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/faq",
  title: copy.faq.metaTitle,
  description: copy.faq.metaDescription,
});

export default function Page() {
  return <FaqPage locale="ar" />;
}
