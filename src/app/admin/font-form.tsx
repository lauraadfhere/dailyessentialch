"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FONT_OPTIONS, type FontChoice, type FontSettings } from "@/lib/font-config";

export function FontForm({ initial }: { initial: FontSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<FontSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/fonts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<FontSettings> & { error?: string };
      if (!response.ok || !data.postTitleFont) throw new Error(data.error || "Unable to save the fonts.");
      setMessage("Fonts saved. The site now uses your choices.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reach the server.");
    } finally {
      setBusy(false);
    }
  }

  const select = (label: string, key: keyof FontSettings) => (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-[#0f1111]">{label}</span>
      <select
        value={settings[key]}
        onChange={(event) => setSettings({ ...settings, [key]: event.target.value as FontChoice })}
        className="w-full rounded border border-[#a6a6a6] bg-white px-3 py-2 text-[14px]"
      >
        {FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-lg border border-[#d5d9d9] bg-white p-6">
      {select("Latest posts titles", "postTitleFont")}
      {select("Body text", "bodyFont")}
      {error && <p role="alert" className="text-[13px] text-[#cc0c39]">{error}</p>}
      {message && <p role="status" className="text-[13px] text-[#067d62]">{message}</p>}
      <button type="submit" disabled={busy} className="rounded bg-[#ffd814] px-5 py-2 text-[14px] font-semibold text-[#0f1111] disabled:opacity-60">
        {busy ? "Saving…" : "Save fonts"}
      </button>
    </form>
  );
}
