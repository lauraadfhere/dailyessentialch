// Shared by server and client code: no Parse or secret access here.

export const DEFAULT_LOGO = "/daily-essential-white.png";
export const DEFAULT_HEADER_WIDTH = 160;
export const DEFAULT_FOOTER_WIDTH = 144;
export const MIN_LOGO_WIDTH = 60;
export const MAX_LOGO_WIDTH = 400;

export type LogoSettings = {
  headerUrl: string;
  footerUrl: string;
  headerWidth: number;
  footerWidth: number;
};

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  headerUrl: DEFAULT_LOGO,
  footerUrl: DEFAULT_LOGO,
  headerWidth: DEFAULT_HEADER_WIDTH,
  footerWidth: DEFAULT_FOOTER_WIDTH,
};

function isSafeLogoUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function clampWidth(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(MAX_LOGO_WIDTH, Math.max(MIN_LOGO_WIDTH, Math.round(number)));
}

/** Normalises settings from storage or a request. Empty URLs fall back to the bundled logo. */
export function normaliseLogoSettings(input: Partial<Record<keyof LogoSettings, unknown>>): LogoSettings | { error: string } {
  const pick = (key: "headerUrl" | "footerUrl") => {
    const raw = typeof input[key] === "string" ? (input[key] as string).trim() : "";
    return raw;
  };
  const headerUrl = pick("headerUrl");
  const footerUrl = pick("footerUrl");
  if ((headerUrl && !isSafeLogoUrl(headerUrl)) || (footerUrl && !isSafeLogoUrl(footerUrl))) {
    return { error: "Each logo must be a site path (/logo.png) or an http(s) link." };
  }
  return {
    headerUrl: headerUrl || DEFAULT_LOGO,
    footerUrl: footerUrl || DEFAULT_LOGO,
    headerWidth: clampWidth(input.headerWidth, DEFAULT_HEADER_WIDTH),
    footerWidth: clampWidth(input.footerWidth, DEFAULT_FOOTER_WIDTH),
  };
}
