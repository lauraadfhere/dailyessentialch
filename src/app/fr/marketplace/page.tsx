import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { MarketplacePage } from "../../marketplace/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/marketplace",
  title: copy.marketplace.metaTitle,
  description: copy.marketplace.body,
});

export default function Page() {
  return <MarketplacePage locale="fr" />;
}
