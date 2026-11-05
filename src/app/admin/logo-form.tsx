"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import {
  DEFAULT_LOGO,
  MAX_LOGO_WIDTH,
  MIN_LOGO_WIDTH,
  type LogoSettings,
} from "@/lib/logo-config";

type Slot = "header" | "footer";

export function LogoForm({ initial }: { initial: LogoSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<LogoSettings>(initial);
  const [busy, setBusy] = useState<Slot | "save" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function persist(next: LogoSettings) {
    const response = await fetch("/api/admin/logo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = await response.json().catch(() => ({})) as Partial<LogoSettings> & { error?: string };
    if (!response.ok || !data.headerUrl) throw new Error(data.error || "Unable to save the logo.");
    return data as LogoSettings;
  }

  async function run(label: Slot | "save", task: () => Promise<void>) {
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await task();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reach the server.");
    } finally {
      setBusy(null);
    }
  }

  function uploadFor(slot: Slot) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      void run(slot, async () => {
        const upload = await fetch("/api/admin/uploads", {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const uploaded = await upload.json().catch(() => ({})) as { url?: string; error?: string };
        if (!upload.ok || !uploaded.url) throw new Error(uploaded.error || "Unable to upload the logo.");
        const key = slot === "header" ? "headerUrl" : "footerUrl";
        const saved = await persist({ ...settings, [key]: uploaded.url });
        setSettings(saved);
        setMessage(`${slot === "header" ? "Header" : "Footer"} logo saved.`);
      });
    };
  }

  function resetFor(slot: Slot) {
    return () => void run(slot, async () => {
      const key = slot === "header" ? "headerUrl" : "footerUrl";
      const saved = await persist({ ...settings, [key]: DEFAULT_LOGO });
      setSettings(saved);
      setMessage(`${slot === "header" ? "Header" : "Footer"} logo reset to the default.`);
    });
  }

  function saveWidths() {
    void run("save", async () => {
      const saved = await persist(settings);
      setSettings(saved);
      setMessage("Logo sizes saved.");
    });
  }

  const sections: { slot: Slot; title: string; hint: string; url: string; width: number; dark: boolean }[] = [
    { slot: "header", title: "Header logo", hint: "Shown in the dark header on every page.", url: settings.headerUrl, width: settings.headerWidth, dark: true },
    { slot: "footer", title: "Footer logo", hint: "Shown in the light footer.", url: settings.footerUrl, width: settings.footerWidth, dark: false },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {sections.map((section) => (
        <section key={section.slot} className="rounded-lg border border-[#d5d9d9] bg-white p-5">
          <h2 className="text-[17px] font-medium">{section.title}</h2>
          <p className="mt-1 text-[12px] leading-5 text-[#565959]">
            {section.hint} Upload a JPG, PNG, WebP or GIF (max 5 MB). {section.dark ? "Use a white or transparent logo." : "A dark logo works best."}
          </p>

          <div className={`mt-5 flex items-center justify-center rounded border border-[#e7e7e7] p-6 ${section.dark ? "bg-[#232323]" : "bg-[#c7c7c3]"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.url}
              alt={`Current ${section.slot} logo`}
              style={{ width: section.width, maxWidth: "100%" }}
              className="h-auto"
            />
          </div>

          <div className="mt-5">
            <label htmlFor={`${section.slot}-width`} className="flex items-center justify-between text-[13px] font-bold">
              <span>Width</span>
              <span className="font-normal tabular-nums">{section.width}px</span>
            </label>
            <input
              id={`${section.slot}-width`}
              type="range"
              min={MIN_LOGO_WIDTH}
              max={MAX_LOGO_WIDTH}
              step={2}
              value={section.width}
              onChange={(event) => {
                const width = Number(event.target.value);
                setSettings((current) => ({
                  ...current,
                  [section.slot === "header" ? "headerWidth" : "footerWidth"]: width,
                }));
              }}
              className="mt-2 w-full accent-[#007185]"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className={`inline-block cursor-pointer rounded bg-[#007185] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b] ${busy ? "pointer-events-none opacity-60" : ""}`}>
              {busy === section.slot ? "Saving…" : "Upload new logo"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadFor(section.slot)} disabled={busy !== null} className="sr-only" />
            </label>
            {section.url !== DEFAULT_LOGO && (
              <button type="button" onClick={resetFor(section.slot)} disabled={busy !== null} className="text-[12px] text-[#007185] hover:underline disabled:opacity-60">
                Reset to the default logo
              </button>
            )}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button type="button" onClick={saveWidths} disabled={busy !== null} className="rounded border border-[#888c8c] bg-[#f7f8f8] px-4 py-2 text-[13px] font-medium hover:bg-[#eef0f0] disabled:opacity-60">
          {busy === "save" ? "Saving…" : "Save logo sizes"}
        </button>
      </div>

      {error && <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-3 py-2 text-[12px] text-[#cc0c39]">{error}</p>}
      {message && <p role="status" className="rounded border border-[#067d62]/30 bg-[#eef8f4] px-3 py-2 text-[12px] text-[#067d62]">{message}</p>}
    </div>
  );
}
