"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Profile } from "@/lib/profile";

const DEFAULT_AVATAR = "/d-buckky-moral.png";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, headline, bio, avatarUrl }),
      });
      const data = await response.json().catch(() => ({})) as { profile?: Profile; error?: string };
      if (!response.ok || !data.profile) {
        setError(data.error || "Unable to save the profile.");
        setBusy(false);
        return;
      }
      setName(data.profile.name);
      setHeadline(data.profile.headline);
      setBio(data.profile.bio);
      setAvatarUrl(data.profile.avatarUrl);
      setMessage("Profile saved. The author pages now use this copy.");
      setBusy(false);
      router.refresh();
    } catch {
      setError("Unable to reach the server.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
        <h2 className="text-[17px] font-medium">Public profile</h2>
        <p className="mt-1 text-[12px] leading-5 text-[#565959]">
          These values are shown on the author page in every language. Leave a field empty to fall back to the built-in copy.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-1 block text-[13px] font-bold">Display name</label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
          </div>

          <div>
            <label htmlFor="profile-headline" className="mb-1 block text-[13px] font-bold">Headline <span className="font-normal text-[#565959]">(optional)</span></label>
            <input
              id="profile-headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              maxLength={160}
              placeholder="Independent author and storyteller"
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="profile-bio" className="block text-[13px] font-bold">Bio</label>
              <span className="text-[11px] text-[#565959]">{bio.length}/4000</span>
            </div>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={4000}
              rows={10}
              placeholder={"Write the author biography.\n\nLeave a blank line between paragraphs."}
              className="w-full rounded border border-[#888c8c] px-3 py-2 text-[14px] leading-6 outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
            />
            <p className="mt-1 text-[11px] text-[#565959]">Blank lines start a new paragraph on the author page.</p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
          <h2 className="text-[15px] font-medium">Avatar</h2>
          <div className="mt-3 overflow-hidden rounded border border-[#e7e7e7] bg-[#f2d600]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || DEFAULT_AVATAR} alt="Avatar preview" className="mx-auto h-40 w-40 object-contain" />
          </div>
          <label htmlFor="profile-avatar" className="mb-1 mt-4 block text-[13px] font-bold">Image link</label>
          <input
            id="profile-avatar"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="/d-buckky-moral.png"
            className="w-full rounded border border-[#888c8c] px-3 py-2 text-[13px] outline-none focus:border-[#007185] focus:ring-2 focus:ring-[#007185]/25"
          />
          <p className="mt-1 text-[11px] leading-4 text-[#565959]">Use a file from /public (for example /photo.png) or an https image link.</p>
          {avatarUrl && (
            <button type="button" onClick={() => setAvatarUrl("")} className="mt-2 text-[12px] text-[#007185] hover:underline">
              Reset to the default avatar
            </button>
          )}
        </section>

        <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
          {error && <p role="alert" className="mb-3 rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-3 py-2 text-[12px] text-[#cc0c39]">{error}</p>}
          {message && <p role="status" className="mb-3 rounded border border-[#067d62]/30 bg-[#eef8f4] px-3 py-2 text-[12px] text-[#067d62]">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-[#007185] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b] disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
          <a href="/en/author" target="_blank" rel="noreferrer" className="mt-3 block text-center text-[12px] text-[#007185] hover:underline">
            View the author page ↗
          </a>
        </section>
      </aside>
    </form>
  );
}
