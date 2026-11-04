"use client";

import { FormEvent, useEffect, useState } from "react";
import { RichTextEditor } from "../../components/rich-text-editor";
import { RichTextView } from "../../components/rich-text-view";
import type { Copy } from "@/lib/i18n";

type Comment = { id: string; name: string; message: string; createdAt?: string };

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function PostEnhancements({ slug, postId, copy }: { slug: string; postId: string; copy: Copy["comments"] }) {
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [commentStatus, setCommentStatus] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? Math.min(100, Math.round((window.scrollY / available) * 100)) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}&postId=${encodeURIComponent(postId)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as { comments?: Comment[] };
        if (response.ok) setComments(data.comments ?? []);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setCommentStatus(copy.unavailable);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCommentsLoading(false);
      });
    return () => controller.abort();
  }, [slug, postId]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const plain = message.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!name.trim() || !plain || submitting) return;
    setSubmitting(true);
    setCommentStatus(copy.sending);
    try {
      const response = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, postId, name, message }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || copy.saveError);
      setMessage("");
      setEditorKey((key) => key + 1);
      setCommentStatus(copy.saved);
    } catch (error) {
      setCommentStatus(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 h-1 bg-transparent" aria-hidden="true">
        <div className="h-full bg-[#f2d600] transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-9" aria-labelledby="comments-heading">
        <div className="border-t border-[#d8d8d4] pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 id="comments-heading" className="text-[11px] font-semibold tracking-[0.18em] text-[#72726d]">{copy.heading}</h2>
            {!commentsLoading && <span className="rounded-full bg-[#f2d600]/25 px-3 py-1 text-xs font-semibold text-[#6f5a00]">{comments.length}</span>}
          </div>

          <form className="mt-6 border border-[#d6d9dc] bg-[#fbfbfb] p-5 shadow-[0_1px_0_rgba(0,0,0,.04)]" onSubmit={submitComment}>
            <p className="text-lg font-medium tracking-[-0.02em]">{copy.leave}</p>
            <label className="mt-4 block text-[11px] font-semibold tracking-[.18em] text-[#72726d]" htmlFor="comment-name">{copy.yourName}</label>
            <input
              id="comment-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.namePlaceholder}
              maxLength={80}
              autoComplete="name"
              className="mt-2 w-full border border-[#bdbdb7] bg-white px-3 py-2.5 text-base outline-none placeholder:text-[#858580] focus:border-[#1b1b1b]"
            />
            <div className="mt-4">
              <RichTextEditor
                key={editorKey}
                id="comment-message"
                label={copy.yourComment}
                placeholder={copy.commentPlaceholder}
                copy={copy.editor}
                value=""
                onChange={setMessage}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-[#72726d]">{copy.reviewed}</p>
              <button
                className="bg-[#1b1b1b] px-5 py-3 text-[11px] font-semibold tracking-[0.14em] text-white transition hover:bg-[#a28d00] disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                {copy.submit}
              </button>
            </div>
          </form>

          {commentStatus && <p className="mt-4 text-sm text-[#55534d]" role="status">{commentStatus}</p>}
          {commentsLoading && <p className="mt-8 text-sm text-[#72726d]" role="status">{copy.loading}</p>}
          {!commentsLoading && comments.length === 0 && <p className="mt-8 text-sm text-[#72726d]">{copy.empty}</p>}

          {comments.length > 0 && (
            <ul className="mt-10 space-y-5">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-4 border border-[#e2e0d9] bg-white p-5">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#1b1b1b] text-sm font-bold text-[#f2d600]" aria-hidden="true">{initials(comment.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1b1b1b]">{comment.name}</p>
                    <RichTextView html={comment.message} className="rich-content mt-2 space-y-2 text-[15px] leading-7 text-[#383735]" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
