"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Reply = { id: string; content: string; createdAt: string | null };

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ReviewActions({ id, isApproved, author, replies }: { id: string; isApproved: boolean; author: string; replies: Reply[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");

  async function setApproved(approved: boolean) {
    setBusy("approve");
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to update the review.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Unable to reach the server.");
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the review from ${author}? It will be hidden from the book page.`)) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to delete the review.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Unable to reach the server.");
    } finally {
      setBusy("");
    }
  }

  async function saveReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim()) return;
    setBusy("reply");
    try {
      const response = await fetch(`/api/admin/reviews/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to save the reply.");
        return;
      }
      setReply("");
      setReplyOpen(false);
      router.refresh();
    } catch {
      window.alert("Unable to reach the server.");
    } finally {
      setBusy("");
    }
  }

  async function removeReply(replyId: string) {
    if (!window.confirm("Delete this reply? It will be removed from the book page.")) return;
    setBusy(`reply-${replyId}`);
    try {
      const response = await fetch(`/api/admin/reviews/${id}/reply/${replyId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to delete the reply.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Unable to reach the server.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-3">
      {replies.length > 0 && (
        <ul className="space-y-2">
          {replies.map((item) => (
            <li key={item.id} className="border-s-2 border-[#007185] bg-[#f7fafa] px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#007185]">
                    Author reply{item.createdAt ? ` · ${formatDate(item.createdAt)}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-[#0f1111]">{item.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeReply(item.id)}
                  disabled={Boolean(busy)}
                  className="shrink-0 text-[12px] text-[#007185] hover:underline disabled:opacity-50"
                >
                  {busy === `reply-${item.id}` ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {replyOpen && (
        <form onSubmit={saveReply} className="grid gap-2">
          <label className="sr-only" htmlFor={`reply-${id}`}>Reply to this review</label>
          <textarea
            id={`reply-${id}`}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Write a public reply as the author…"
            className="w-full border border-[#888c8c] bg-white px-3 py-2 text-[13px] leading-6 outline-none focus:border-[#007185]"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={Boolean(busy) || !reply.trim()}
              className="rounded-full bg-[#ffd814] px-4 py-1.5 text-[13px] font-semibold text-[#0f1111] hover:bg-[#f7ca00] disabled:opacity-60"
            >
              {busy === "reply" ? "Posting…" : "Post reply"}
            </button>
            <button type="button" onClick={() => setReplyOpen(false)} className="text-[13px] text-[#007185] hover:underline">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => setApproved(!isApproved)} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
          {busy === "approve" ? "Saving…" : isApproved ? "Unpublish" : "Approve"}
        </button>
        <button type="button" onClick={remove} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
          {busy === "delete" ? "Deleting…" : "Delete"}
        </button>
        {!replyOpen && (
          <button type="button" onClick={() => setReplyOpen(true)} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
            {replies.length ? "Add another reply" : "Reply"}
          </button>
        )}
      </div>
    </div>
  );
}
