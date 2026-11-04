"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentActions({ id, isApproved, author }: { id: string; isApproved: boolean; author: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  async function setApproved(approved: boolean) {
    setBusy("approve");
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to update the comment.");
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
    if (!window.confirm(`Delete the comment from ${author}? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        window.alert(data.error || "Unable to delete the comment.");
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
      <button type="button" onClick={() => setApproved(!isApproved)} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
        {busy === "approve" ? "Saving…" : isApproved ? "Unpublish" : "Approve"}
      </button>
      <button type="button" onClick={remove} disabled={Boolean(busy)} className="text-[13px] text-[#007185] hover:underline disabled:opacity-50">
        {busy === "delete" ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
