import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ComingSoonPage } from "../../components/coming-soon";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/shop",
  title: copy.shop.metaTitle,
  description: copy.home.categories.shop.description,
  // Placeholder page: keep it navigable for visitors but out of the search index.
  index: false,
});

export default function Page() {
  return <ComingSoonPage locale="en" kind="shop" />;
}
