import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ContactPage } from "../../contact/page";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/contact",
  title: copy.contact.metaTitle,
  description: copy.contact.metaDescription,
});

export default function Page() {
  return <ContactPage locale="fr" />;
}
