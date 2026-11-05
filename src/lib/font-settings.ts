// Server-only: reads PARSE_REST_KEY, so never import this from a Client Component.

import { DEFAULT_FONT_SETTINGS, normaliseFontSettings, type FontSettings } from "@/lib/font-config";

const FONT_CLASS = "SiteFont";
const FONT_KEY = "primary";

type FontRecord = { objectId: string } & Record<string, unknown>;

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

async function findRecord(): Promise<FontRecord | null> {
  const settings = config();
  if (!settings) return null;
  const parameters = new URLSearchParams({ where: JSON.stringify({ key: FONT_KEY }), limit: "1" });
  const response = await fetch(`${settings.url}/classes/${FONT_CLASS}?${parameters}`, {
    headers: { "X-Parse-Application-Id": settings.appId, "X-Parse-REST-API-Key": settings.restKey },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { results?: FontRecord[] };
  return body.results?.[0] ?? null;
}

/** Public read: falls back to the defaults when nothing is saved or Parse is unavailable. */
export async function getFontSettings(): Promise<FontSettings> {
  try {
    const record = await findRecord();
    if (!record) return DEFAULT_FONT_SETTINGS;
    const result = normaliseFontSettings(record);
    return "error" in result ? DEFAULT_FONT_SETTINGS : result;
  } catch {
    return DEFAULT_FONT_SETTINGS;
  }
}

export async function saveFontSettings(settings: FontSettings): Promise<FontSettings> {
  const config_ = config();
  if (!config_) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const existing = await findRecord();
  const endpoint = existing
    ? `${config_.url}/classes/${FONT_CLASS}/${existing.objectId}`
    : `${config_.url}/classes/${FONT_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(config_.appId, config_.restKey),
    body: JSON.stringify({ key: FONT_KEY, ...settings }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return settings;
}
