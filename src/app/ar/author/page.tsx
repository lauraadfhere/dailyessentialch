import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AuthorPage } from "../../author/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/author",
  title: copy.author.metaTitle,
  description: copy.author.lead,
});

export default function Page() {
  return <AuthorPage locale="ar" />;
}
