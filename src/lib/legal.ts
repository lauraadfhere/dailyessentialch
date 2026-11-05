// Server-only: reads PARSE_REST_KEY, so never import this from a Client Component.

import { fetchWithTimeout } from "@/lib/cf-timeout";

export type LegalPageKey = "privacy" | "terms";

export type Legal = {
  title: string;
  intro: string;
  /** Paragraphs separated by blank lines. A paragraph starting with "## " becomes a section heading. */
  body: string;
  updatedAt: string | null;
};

export type LegalInput = Pick<Legal, "title" | "intro" | "body">;

const LEGAL_CLASS = "SiteLegal";
const MAX_TITLE = 120;
const MAX_INTRO = 600;
const MAX_BODY = 20000;

export const legalFallback: Record<LegalPageKey, Legal> = {
  privacy: {
    title: "Privacy Policy",
    intro: "We respect your privacy. This website only collects information you choose to share, such as your name and comment, to provide the requested experience.",
    body: [
      "## Information you share",
      "When you contact us, post a comment or leave a book review, you may provide your name, email address and message. We use this information only to reply to you, to publish approved comments and reviews, and to keep the site running.",
      "## Comments and reviews",
      "Comments and reviews are read by our moderators before they appear. Please do not include sensitive personal information in them. Published comments may remain visible until they are removed.",
      "## Cookies and preferences",
      "The site uses essential cookies and local storage to remember your preferences, such as the cookie notice you have acknowledged. We do not sell personal information.",
      "## Third-party links",
      "Books and some features link to external services such as the Amazon store and social media. Those services have their own privacy policies, which apply when you use them.",
      "## Your choices",
      "You can ask us to correct or delete the personal information you have sent us by contacting us through the Contact page. We will respond as soon as we reasonably can.",
      "## Changes to this policy",
      "We may update this policy from time to time. The most recent version is always the one published on this page.",
    ].join("\n\n"),
    updatedAt: null,
  },
  terms: {
    title: "Terms of Use",
    intro: "By using Daily Essential, you agree to use this site responsibly and respect its content, community, and intellectual property.",
    body: [
      "## Using the site",
      "You may read, share links to, and quote short passages from Daily Essential for personal, non-commercial purposes. Please credit the author and link back to the original page.",
      "## Content and availability",
      "We may update, change, or remove content to keep the journal useful and current. Content is provided for general information only and is not professional advice.",
      "## Comments and reviews",
      "You are responsible for the comments and reviews you submit. Keep them respectful and accurate, and do not post material that is unlawful, abusive or that infringes someone else's rights. We may remove any submission at our discretion.",
      "## Intellectual property",
      "The text, illustrations, and books published on this site belong to their authors or rights holders. Reproducing them without permission is not allowed.",
      "## Links to other sites",
      "The site links to third-party sites, including bookshops and social networks. We do not control those sites and are not responsible for their content or practices.",
      "## Limitation of liability",
      "The site is provided as is. To the fullest extent permitted by law, we are not liable for any loss arising from your use of the site or reliance on its content.",
    ].join("\n\n"),
    updatedAt: null,
  },
};

type LegalRecord = { objectId: string; updatedAt?: string } & Record<string, unknown>;

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

function toLegal(key: LegalPageKey, record: LegalRecord): Legal {
  const fallback = legalFallback[key];
  return {
    title: text(record.title) || fallback.title,
    intro: text(record.intro) || fallback.intro,
    body: text(record.body) || fallback.body,
    updatedAt: text(record.updatedAt) || null,
  };
}

async function findRecord(key: LegalPageKey) {
  const settings = config();
  if (!settings) return null;
  const parameters = new URLSearchParams({ where: JSON.stringify({ key }), limit: "1" });
  const response = await fetchWithTimeout(`${settings.url}/classes/${LEGAL_CLASS}?${parameters}`, {
    headers: headers(settings.appId, settings.restKey),
    cache: "no-store",
    timeoutMs: 5000,
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { results?: LegalRecord[] };
  return body.results?.[0] ?? null;
}

/** Public read: falls back to the built-in copy when the CMS is unavailable. */
export async function getLegal(key: LegalPageKey): Promise<Legal> {
  try {
    const record = await findRecord(key);
    return record ? toLegal(key, record) : legalFallback[key];
  } catch {
    return legalFallback[key];
  }
}

export function isLegalPageKey(value: string): value is LegalPageKey {
  return value === "privacy" || value === "terms";
}

export function readLegalInput(body: unknown): { input: LegalInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return { error: "A page title is required." };
  if (title.length > MAX_TITLE) return { error: `Keep the title under ${MAX_TITLE} characters.` };

  const intro = typeof raw.intro === "string" ? raw.intro.trim() : "";
  if (intro.length > MAX_INTRO) return { error: `Keep the introduction under ${MAX_INTRO} characters.` };

  const content = typeof raw.body === "string" ? raw.body.trim() : "";
  if (!content) return { error: "The page text is required." };
  if (content.length > MAX_BODY) return { error: `Keep the page text under ${MAX_BODY} characters.` };

  return { input: { title, intro, body: content } };
}

export async function saveLegal(key: LegalPageKey, input: LegalInput): Promise<Legal> {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const payload = { ...input, key };
  const existing = await findRecord(key);
  const endpoint = existing
    ? `${settings.url}/classes/${LEGAL_CLASS}/${existing.objectId}`
    : `${settings.url}/classes/${LEGAL_CLASS}`;
  const response = await fetch(endpoint, {
    method: existing ? "PUT" : "POST",
    headers: writeHeaders(settings.appId, settings.restKey),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || `Parse returned ${response.status}.`);

  return { ...input, updatedAt: new Date().toISOString() };
}
