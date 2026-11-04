"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RichTextEditor } from "../components/rich-text-editor";

type CategoryOption = { id: string; name: string; slug: string };

export type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  locale: string;
  status: string;
  category: string;
  publishedAt: string | null;
  coverImage: string | null;
};

function slugifyClient(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass = "w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25";
const labelClass = "mb-1 block text-[13px] font-bold";

const editorCopy = {
  toolbar: "Formatting",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  bulleted: "Bulleted list",
  numbered: "Numbered list",
  clear: "Clear formatting",
};

export function PostForm({ mode, initial, categories }: { mode: "create" | "edit"; initial?: PostFormValues; categories: CategoryOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [locale, setLocale] = useState(initial?.locale ?? "en");
  const [status, setStatus] = useState(initial?.status === "draft" ? "draft" : "published");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage ?? null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugifyClient(title);

  async function uploadCover(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the cover.");
      return;
    }
    setCoverUploading(true);
    try {
      const response = await fetch("/api/admin/uploads", { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const data = await response.json().catch(() => ({})) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error || "Unable to upload the cover.");
        return;
      }
      setCoverImage(data.url);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.replace(/<[^>]*>/g, "").trim()) {
      setError("Post content is required.");
      return;
    }
    setBusy(true);
    setError("");

    const payload = {
      title,
      slug: effectiveSlug,
      excerpt,
      content,
      locale,
      status,
      category,
      publishedAt: initial?.publishedAt ?? null,
      coverImage,
    };

    try {
      const response = mode === "create"
        ? await fetch("/api/admin/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/posts/${initial?.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Unable to save the post.");
        setBusy(false);
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h2 className="text-[17px] font-medium">Post details</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="post-title" className={labelClass}>Title</label>
            <input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="post-slug" className={labelClass}>URL slug</label>
              <input
                id="post-slug"
                value={effectiveSlug}
                onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }}
                placeholder="generated-from-the-title"
                className={inputClass}
              />
              <p className="mt-1 text-[12px] text-[#565959]">The post is served at /locale/posts/{effectiveSlug || "slug"}.</p>
            </div>
            <div>
              <label htmlFor="post-category" className={labelClass}>Category</label>
              {categories.length > 0 ? (
                <select id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                  <option value="">No category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.name || item.slug}>{item.name || item.slug}</option>
                  ))}
                </select>
              ) : (
                <input id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Optional" className={inputClass} />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="post-locale" className={labelClass}>Language</label>
              <select id="post-locale" value={locale} onChange={(event) => setLocale(event.target.value)} className={inputClass}>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-status" className={labelClass}>Status</label>
              <select id="post-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="post-excerpt" className={labelClass}>Excerpt</label>
            <textarea id="post-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h2 className="text-[17px] font-medium">Cover image</h2>
        <div className="mt-4 flex flex-wrap items-start gap-5">
          {coverImage ? (
            <img src={coverImage} alt="Cover preview" className="h-40 w-32 rounded border border-[#d5d9d9] object-cover" />
          ) : (
            <div className="flex h-40 w-32 items-center justify-center rounded border border-dashed border-[#888c8c] text-center text-[12px] text-[#565959]">No cover</div>
          )}
          <div className="space-y-2">
            <label htmlFor="post-cover" className="inline-block cursor-pointer rounded border border-[#888c8c] bg-[#f0f2f2] px-4 py-2 text-[13px] font-medium hover:bg-[#e3e6e6]">
              {coverUploading ? "Uploading…" : coverImage ? "Replace image" : "Upload cover"}
            </label>
            <input
              id="post-cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={coverUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) uploadCover(file);
              }}
            />
            {coverImage && (
              <button type="button" onClick={() => setCoverImage(null)} className="block text-[13px] text-[#007185] hover:underline">
                Remove cover
              </button>
            )}
            <p className="text-[12px] text-[#565959]">JPG, PNG, WebP or GIF, up to 5 MB.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h2 className="text-[17px] font-medium">Content</h2>
        <div className="mt-3">
          <RichTextEditor
            id="post-content"
            label="Post content"
            placeholder="Write your post…"
            copy={editorCopy}
            value={content}
            onChange={setContent}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="rounded bg-[#007185] px-5 py-2 text-[14px] font-medium text-white transition hover:bg-[#005a6b] disabled:opacity-60">
          {busy ? "Saving…" : mode === "create" ? "Publish post" : "Save changes"}
        </button>
        <Link href="/admin/posts" className="text-[13px] text-[#007185] hover:underline">Cancel</Link>
        {mode === "edit" && initial && (
          <Link href={`/${initial.locale || "en"}/posts/${initial.slug}`} target="_blank" className="text-[13px] text-[#007185] hover:underline">View post ↗</Link>
        )}
      </div>
    </form>
  );
}
