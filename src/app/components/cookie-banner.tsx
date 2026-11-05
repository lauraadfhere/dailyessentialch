"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocale, messages } from "@/lib/i18n";

const STORAGE_KEY = "de-privacy-acknowledged";

export function CookieBanner() {
  const pathname = usePathname() ?? "";
  const locale = getLocale(pathname.split("/")[1]);
  const copy = messages[locale].cookie;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check storage after mount so server and client markup match; deferred so the update is not synchronous in the effect.
    const timer = window.setTimeout(() => {
      try {
        if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible || pathname.startsWith("/admin")) return null;

  function acknowledge() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage blocked — dismiss for this page view only */
    }
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label={copy.title}>
      <div className="cookie-banner-inner">
        <div className="cookie-banner-head">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="cookie-banner-icon">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
            <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" />
            <path d="M12 14.5v2" />
          </svg>
          <h2 className="cookie-banner-title">{copy.title}</h2>
        </div>
        <p className="cookie-banner-text">{copy.body}</p>
        <div className="cookie-banner-actions">
          <Link href={`/${locale}/privacy`} className="cookie-banner-settings">{copy.settings}</Link>
          <button type="button" onClick={acknowledge} className="cookie-banner-accept">{copy.accept}</button>
        </div>
      </div>
    </div>
  );
}
