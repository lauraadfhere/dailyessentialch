import type { Locale } from "@/lib/i18n";
import { BookLibrary } from "../components/book-library";

export function EbooksPage({ locale = "en" }: { locale?: Locale }) {
  return <BookLibrary locale={locale} />;
}

export default function Page() {
  return <EbooksPage locale="en" />;
}
