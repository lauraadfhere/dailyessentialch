"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to delete the post.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      window.alert("Unable to reach the server.");
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={remove} disabled={busy} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
