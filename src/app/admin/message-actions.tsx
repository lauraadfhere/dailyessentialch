"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MessageActions({ id, isHandled, subject }: { id: string; isHandled: boolean; subject: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function toggle() {
    setBusy("toggle");
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHandled: !isHandled }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to update the message.");
        setBusy("");
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
    if (!window.confirm(`Delete the message “${subject || "no subject"}”? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to delete the message.");
        setBusy("");
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
    <div className="flex items-center gap-3">
      <button type="button" onClick={toggle} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
        {busy === "toggle" ? "Saving…" : isHandled ? "Mark as new" : "Mark as handled"}
      </button>
      <button type="button" onClick={remove} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
        {busy === "delete" ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
