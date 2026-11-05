import { type Locale } from "@/lib/i18n";
import { LegalPage } from "../legal-page";

export async function PrivacyPage({ locale = "en" }: { locale?: Locale }) {
  return <LegalPage locale={locale} pageKey="privacy" />;
}

export default function Page() {
  return <PrivacyPage locale="en" />;
}
