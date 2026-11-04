"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClass = "w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25";
const labelClass = "mb-1 block text-[13px] font-bold";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BookForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState("both");
  const [cover, setCover] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [price, setPrice] = useState("");
  const [series, setSeries] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, type, cover, excerpt, amazonUrl, price, series, ageRange, isNew }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to save the book.");
      router.push("/admin/books");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the book.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-lg border border-[#d5d9d9] bg-white p-6">
      {error && <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="book-title">Title</label>
          <input id="book-title" required value={title} onChange={(event) => { setTitle(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="book-slug">Slug (URL)</label>
          <input id="book-slug" required value={slug} onChange={(event) => { setSlug(event.target.value); setSlugTouched(true); }} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="book-type">Format</label>
          <select id="book-type" value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
            <option value="both">Ebook and paperback</option>
            <option value="ebook">Ebook</option>
            <option value="paperback">Paperback</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="book-price">Price (optional)</label>
          <input id="book-price" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 9.99" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="book-amazon">Amazon link</label>
          <input id="book-amazon" type="url" value={amazonUrl} onChange={(event) => setAmazonUrl(event.target.value)} placeholder="https://www.amazon.com/dp/..." className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="book-cover">Cover image path or URL</label>
          <input id="book-cover" value={cover} onChange={(event) => setCover(event.target.value)} placeholder="/books/your-cover.webp" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="book-excerpt">Description</label>
          <textarea id="book-excerpt" rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="book-series">Series (optional)</label>
          <input id="book-series" value={series} onChange={(event) => setSeries(event.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="book-age">Age range (optional)</label>
          <input id="book-age" value={ageRange} onChange={(event) => setAgeRange(event.target.value)} placeholder="e.g. 4–8" className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-[13px] font-bold sm:col-span-2">
          <input type="checkbox" checked={isNew} onChange={(event) => setIsNew(event.target.checked)} /> Mark as new
        </label>
      </div>

      <button type="submit" disabled={busy} className="rounded bg-[#007185] px-5 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b] disabled:opacity-60">
        {busy ? "Saving…" : "Save book"}
      </button>
    </form>
  );
}
