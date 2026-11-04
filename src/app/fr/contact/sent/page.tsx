import type { Metadata } from "next";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ContactSent } from "../../../components/contact-sent";

const copy = messages.fr;

export const metadata: Metadata = pageMetadata({
  locale: "fr",
  path: "/contact/sent",
  title: copy.contact.sent.title,
  description: copy.contact.sent.body,
});

export default function Page() {
  return <ContactSent locale="fr" />;
}
