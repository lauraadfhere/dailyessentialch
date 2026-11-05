// Server-only: reads PARSE_REST_KEY, so never import this from a Client Component.

import { isSafeImageUrl } from "@/lib/profile";
import { DEFAULT_LOGO_SETTINGS, normaliseLogoSettings, type LogoSettings } from "@/lib/logo-config";
import { fetchWithTimeout } from "@/lib/cf-timeout";

const LOGO_CLASS = "SiteLogo";
const LOGO_KEY = "primary";

type LogoRecord = { objectId: string } & Record<string, unknown>;

function config() {
  const url = process.env.PARSE_SERVER_URL;
  const appId = process.env.PARSE_APP_ID;
  const restKey = process.env.PARSE_REST_KEY;
  if (!url || !appId || !restKey) return null;
  return { url: url.replace(/\/$/, ""), appId, restKey };
}

/** Writes use the master key when available: the REST key cannot update restricted classes. */
function writeHeaders(appId: string, restKey: string) {
  const masterKey = process.env.PARSE_MASTER_KEY;
  return {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": appId,
    ...(masterKey ? { "X-Parse-Master-Key": masterKey } : { "X-Parse-REST-API-Key": restKey }),
  };
}

async function findRecord(): Promise<LogoRecord | null> {
  const settings = config();
  if (!settings) return null;
  const parameters = new URLSearchParams({ where: JSON.stringify({ key: LOGO_KEY }), limit: "1" });
  const response = await fetchWithTimeout(`${settings.url}/classes/${LOGO_CLASS}?${parameters}`, {
    headers: { "X-Parse-Application-Id": settings.appId, "X-Parse-REST-API-Key": settings.restKey },
    cache: "no-store",
    timeoutMs: 3000,
  });
  if (!response.ok) return null;
  const body = await response.json() as { results?: LogoRecord[] };
  return body.results?.[0] ?? null;
}

/** Public read: falls back to the bundled logos when nothing is saved or Parse is unavailable. */
export async function getLogoSettings(): Promise<LogoSettings> {
  try {
    const record = await findRecord();
    if (!record) return DEFAULT_LOGO_SETTINGS;
    // Records saved before the header/footer split stored a single `url`; reuse it for both.
    const legacy = typeof record.url === "string" ? record.url : "";
    const input: Record<string, unknown> = { ...record };
    if (legacy && typeof record.headerUrl !== "string") input.headerUrl = legacy;
    if (legacy && typeof record.footerUrl !== "string") input.footerUrl = legacy;
    const result = normaliseLogoSettings(input);
    if ("error" in result) return DEFAULT_LOGO_SETTINGS;
    const safe = (url: string) => (url.startsWith("/") || isSafeImageUrl(url) ? url : DEFAULT_LOGO_SETTINGS.headerUrl);
    return { ...result, headerUrl: safe(result.headerUrl), footerUrl: safe(result.footerUrl) };
  } catch {
    return DEFAULT_LOGO_SETTINGS;
  }
}

export async function saveLogoSettings(settings: LogoSettings): Promise<LogoSettings> {
  const config_ = config();
  if (!config_) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const existing = await findRecord();
  const endpoint = existing
    ? `${config_.url}/classes/${LOGO_CLASS}/${existing.objectId}`
    : `${config_.url}/classes/${LOGO_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(config_.appId, config_.restKey),
    body: JSON.stringify({ key: LOGO_KEY, ...settings }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}
