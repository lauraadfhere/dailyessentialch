import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPage } from "../../privacy/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/privacy",
  title: copy.privacy.metaTitle,
  description: copy.privacy.intro,
});

export default function Page() {
  return <PrivacyPage locale="ar" />;
}
