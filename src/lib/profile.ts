// Server-only: reads PARSE_REST_KEY, so never import this from a Client Component.

import { fetchWithTimeout } from "@/lib/cf-timeout";

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  updatedAt: string | null;
};

export type ProfileInput = Pick<Profile, "name" | "headline" | "bio" | "avatarUrl">;

const PROFILE_CLASS = "SiteProfile";
const PROFILE_KEY = "primary";
const MAX_NAME = 80;
const MAX_HEADLINE = 160;
const MAX_BIO = 4000;

export const fallbackProfile: Profile = {
  name: "D. Buckky Moral",
  headline: "",
  bio: "",
  avatarUrl: "",
  updatedAt: null,
};

type ProfileRecord = { objectId: string; updatedAt?: string } & Record<string, unknown>;

function config() {
  const url = process.env.PARSE_SERVER_URL;
  const appId = process.env.PARSE_APP_ID;
  const restKey = process.env.PARSE_REST_KEY;
  if (!url || !appId || !restKey) return null;
  return { url: url.replace(/\/$/, ""), appId, restKey };
}

function headers(appId: string, restKey: string) {
  return { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-REST-API-Key": restKey };
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

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toProfile(record: ProfileRecord): Profile {
  return {
    name: text(record.name) || fallbackProfile.name,
    headline: text(record.headline),
    bio: text(record.bio),
    avatarUrl: text(record.avatarUrl),
    updatedAt: text(record.updatedAt) || null,
  };
}

async function findRecord() {
  const settings = config();
  if (!settings) return null;
  const parameters = new URLSearchParams({ where: JSON.stringify({ key: PROFILE_KEY }), limit: "1" });
  const response = await fetchWithTimeout(`${settings.url}/classes/${PROFILE_CLASS}?${parameters}`, {
    headers: headers(settings.appId, settings.restKey),
    cache: "no-store",
    timeoutMs: 5000,
  });
  if (!response.ok) return null;
  const body = await response.json() as { results?: ProfileRecord[] };
  return body.results?.[0] ?? null;
}

/** Public read: falls back to the built-in author copy when the CMS is unavailable. */
export async function getProfile(): Promise<Profile> {
  try {
    const record = await findRecord();
    return record ? toProfile(record) : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
}

export function readProfileInput(body: unknown): { input: ProfileInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) return { error: "A display name is required." };
  if (name.length > MAX_NAME) return { error: `Keep the name under ${MAX_NAME} characters.` };

  const headline = typeof raw.headline === "string" ? raw.headline.trim() : "";
  if (headline.length > MAX_HEADLINE) return { error: `Keep the headline under ${MAX_HEADLINE} characters.` };

  const bio = typeof raw.bio === "string" ? raw.bio.trim() : "";
  if (bio.length > MAX_BIO) return { error: `Keep the bio under ${MAX_BIO} characters.` };

  const avatarUrl = typeof raw.avatarUrl === "string" ? raw.avatarUrl.trim() : "";
  if (avatarUrl && !isSafeImageUrl(avatarUrl)) {
    return { error: "The avatar must be a site path (/photo.png) or an http(s) link." };
  }

  return { input: { name, headline, bio, avatarUrl } };
}

/** Blocks javascript:, data: and other script-capable URLs from reaching the page. */
export function isSafeImageUrl(value: string) {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function saveProfile(input: ProfileInput): Promise<Profile> {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const payload = { ...input, key: PROFILE_KEY };
  const existing = await findRecord();
  const endpoint = existing
    ? `${settings.url}/classes/${PROFILE_CLASS}/${existing.objectId}`
    : `${settings.url}/classes/${PROFILE_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(settings.appId, settings.restKey),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);

  return { ...input, updatedAt: new Date().toISOString() };
}
