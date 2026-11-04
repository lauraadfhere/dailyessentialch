import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { MarketplacePage } from "../../marketplace/page";

const copy = messages.en;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: "/marketplace",
  title: copy.marketplace.metaTitle,
  description: copy.marketplace.body,
});

export default function Page() {
  return <MarketplacePage locale="en" />;
}
