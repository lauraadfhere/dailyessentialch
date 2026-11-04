import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ContactPage } from "../../contact/page";

const copy = messages.ar;

export const metadata: Metadata = pageMetadata({
  locale: "ar",
  path: "/contact",
  title: copy.contact.metaTitle,
  description: copy.contact.metaDescription,
});

export default function Page() {
  return <ContactPage locale="ar" />;
}
