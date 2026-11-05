"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Legal, LegalPageKey } from "@/lib/legal";

export function LegalForm({ pageKey, legal }: { pageKey: LegalPageKey; legal: Legal }) {
  const router = useRouter();
  const [title, setTitle] = useState(legal.title);
  const [intro, setIntro] = useState(legal.intro);
  const [body, setBody] = useState(legal.body);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/legal/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, intro, body }),
      });
      const data = (await response.json().catch(() => ({}))) as { legal?: Legal; error?: string };
      if (!response.ok || !data.legal) {
        setError(data.error || "Unable to save the page.");
        setBusy(false);
        return;
      }
      setTitle(data.legal.title);
      setIntro(data.legal.intro);
      setBody(data.legal.body);
      setMessage("Saved. The public page now shows this text.");
      setBusy(false);
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setBusy(false);
    }
  }

  const publicPath = pageKey === "privacy" ? "/en/privacy" : "/en/terms";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h2 className="text-[17px] font-medium">Page text</h2>
        <p className="mt-1 text-[12px] leading-5 text-[#565959]">
          Blank lines start a new paragraph. A line starting with &quot;## &quot; becomes a section heading.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="legal-title" className="mb-1 block text-[13px] font-bold">Page title</label>
            <input
              id="legal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="legal-intro" className="block text-[13px] font-bold">Introduction</label>
              <span className="text-[11px] text-[#565959]">{intro.length}/600</span>
            </div>
            <textarea
              id="legal-intro"
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
              maxLength={600}
              rows={3}
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] leading-6 outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="legal-body" className="block text-[13px] font-bold">Page text</label>
              <span className="text-[11px] text-[#565959]">{body.length}/20000</span>
            </div>
            <textarea
              id="legal-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={20000}
              rows={26}
              required
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] leading-6 outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
          {error && <p role="alert" className="mb-3 rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-3 py-2 text-[12px] text-[#cc0c39]">{error}</p>}
          {message && <p role="status" className="mb-3 rounded border border-[#067d62]/30 bg-[#eef8f4] px-3 py-2 text-[12px] text-[#067d62]">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-[#007185] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b] disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save page"}
          </button>
          <a href={publicPath} target="_blank" rel="noreferrer" className="mt-3 block text-center text-[12px] text-[#007185] hover:underline">
            View the public page ↗
          </a>
        </section>
      </aside>
    </form>
  );
}
