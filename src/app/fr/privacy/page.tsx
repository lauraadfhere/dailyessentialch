import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPage } from "../../privacy/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/privacy",
  title: copy.privacy.metaTitle,
  description: copy.privacy.intro,
});

export default function Page() {
  return <PrivacyPage locale="fr" />;
}
