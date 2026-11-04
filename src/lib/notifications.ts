// Server-only: combines the Parse-backed admin queues into one notification feed.
import { getContactMessages } from "./contact";
import { getCommentsForModeration } from "./parse";

export type AdminNotification = {
  id: string;
  kind: "contact" | "comment" | "reply";
  title: string;
  detail: string;
  href: string;
  createdAt: string | null;
};

const PER_SOURCE = 10;
const FEED_LENGTH = 15;

function time(value: string | null) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Latest unhandled contact messages plus comments and replies waiting for approval.
 * Sorted newest first; the bell reads this feed and counts the items it has not seen yet.
 */
export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const [messages, comments] = await Promise.all([getContactMessages(), getCommentsForModeration()]);

  const contact: AdminNotification[] = messages
    .filter((message) => !message.isHandled)
    .slice(0, PER_SOURCE)
    .map((message) => ({
      id: `contact-${message.id}`,
      kind: "contact",
      title: message.name,
      detail: message.subject || "New contact message",
      href: "/admin/messages",
      createdAt: message.createdAt,
    }));

  const pending: AdminNotification[] = comments
    .filter((comment) => !comment.isApproved)
    .slice(0, PER_SOURCE)
    .map((comment) => ({
      id: `comment-${comment.id}`,
      kind: comment.isReply ? "reply" : "comment",
      title: comment.name,
      detail: comment.message.slice(0, 140),
      href: "/admin/comments",
      createdAt: comment.createdAt,
    }));

  return [...contact, ...pending].sort((a, b) => time(b.createdAt) - time(a.createdAt)).slice(0, FEED_LENGTH);
}
