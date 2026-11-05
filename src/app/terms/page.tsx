import { type Locale } from "@/lib/i18n";
import { LegalPage } from "../legal-page";

export async function TermsPage({ locale = "en" }: { locale?: Locale }) {
  return <LegalPage locale={locale} pageKey="terms" />;
}

export default function Page() {
  return <TermsPage locale="en" />;
}
