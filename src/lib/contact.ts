// Server-only: reads the PARSE_* keys, so never import this from a Client Component.
import { normalizeRichText } from "./richtext";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  messageHtml: string;
  locale: string | null;
  isHandled: boolean;
  createdAt: string | null;
};

export type ContactInput = Pick<ContactMessage, "name" | "email" | "subject" | "messageHtml" | "locale">;

type ContactRecord = { objectId: string; createdAt?: string } & Record<string, unknown>;

const CLASS = "ContactMessage";
const MAX_NAME = 80;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 160;
const MAX_MESSAGE = 5_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

/** Admin reads and status changes use the master key when it is configured. */
function adminHeaders(appId: string, restKey: string) {
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

function toMessage(record: ContactRecord): ContactMessage {
  return {
    id: record.objectId,
    name: text(record.name),
    email: text(record.email),
    subject: text(record.subject),
    messageHtml: text(record.messageHtml),
    locale: text(record.locale) || null,
    isHandled: record.isHandled === true,
    createdAt: text(record.createdAt) || null,
  };
}

export function readContactInput(body: unknown): { input: ContactInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) return { error: "A name is required." };
  if (name.length > MAX_NAME) return { error: `Keep the name under ${MAX_NAME} characters.` };

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (!EMAIL.test(email) || email.length > MAX_EMAIL) return { error: "Enter a valid email address." };

  const subject = typeof raw.subject === "string" ? raw.subject.trim().replace(/\s+/g, " ") : "";
  if (subject.length > MAX_SUBJECT) return { error: `Keep the subject under ${MAX_SUBJECT} characters.` };

  const message = typeof raw.message === "string" ? raw.message : "";
  const normalized = normalizeRichText(message);
  if (!normalized.text) return { error: "A message is required." };
  if (normalized.text.length > MAX_MESSAGE) return { error: `Keep the message under ${MAX_MESSAGE} characters.` };

  const locale = typeof raw.locale === "string" && ["en", "fr", "ar"].includes(raw.locale) ? raw.locale : null;

  return { input: { name, email, subject, messageHtml: normalized.html, locale } };
}

export async function createContactMessage(input: ContactInput) {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const response = await fetch(`${settings.url}/classes/${CLASS}`, {
    method: "POST",
    headers: headers(settings.appId, settings.restKey),
    body: JSON.stringify({ ...input, isHandled: false }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save your message.");
  return { id: body.objectId };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const parameters = new URLSearchParams({ order: "-createdAt", limit: "200" });
  const response = await fetch(`${settings.url}/classes/${CLASS}?${parameters}`, {
    headers: adminHeaders(settings.appId, settings.restKey),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { results?: ContactRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return (body.results ?? []).map(toMessage);
}

export async function setContactHandled(id: string, isHandled: boolean) {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const response = await fetch(`${settings.url}/classes/${CLASS}/${id}`, {
    method: "PUT",
    headers: adminHeaders(settings.appId, settings.restKey),
    body: JSON.stringify({ isHandled }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}

export async function deleteContactMessage(id: string) {
  const settings = config();
  if (!settings) throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");

  const response = await fetch(`${settings.url}/classes/${CLASS}/${id}`, {
    method: "DELETE",
    headers: adminHeaders(settings.appId, settings.restKey),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}
