import { messages, type Locale } from "@/lib/i18n";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { ContactForm } from "../components/contact-form";

export function ContactPage({ locale = "en" }: { locale?: Locale }) {
  const copy = messages[locale];
  const page = copy.contact;
  const eyebrow = "text-[11px] font-semibold tracking-[.18em] text-[#72726d]";

  return (
    <main lang={locale} dir={copy.dir} className="min-h-screen bg-white text-[#1b1b1b]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-9 sm:py-20 lg:px-12">
        <p className={eyebrow}>{page.eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[.91] tracking-[-.07em] sm:text-7xl">{page.title}</h1>

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className={eyebrow}>{page.form.label}</p>
            <ContactForm locale={locale} copy={page.form} />
          </div>

          <div className="space-y-10">
            <div>
              <p className={eyebrow}>{page.enquiries}</p>
              <a className="mt-3 inline-block text-2xl font-medium underline decoration-[#bdbdb7] underline-offset-8 transition hover:text-[#a28d00]" href="mailto:hello@dailyessential.com">hello@dailyessential.com</a>
            </div>
            <div>
              <p className={eyebrow}>{page.follow}</p>
              <a className="mt-3 inline-block text-2xl font-medium underline decoration-[#bdbdb7] underline-offset-8 transition hover:text-[#a28d00]" href="#instagram">{page.instagram}</a>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export default function Page() {
  return <ContactPage locale="en" />;
}
