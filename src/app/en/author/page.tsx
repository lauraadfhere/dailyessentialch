import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { AuthorPage } from "../../author/page";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/author",
  title: copy.author.metaTitle,
  description: copy.author.lead,
});

export default function Page() {
  return <AuthorPage locale="en" />;
}
