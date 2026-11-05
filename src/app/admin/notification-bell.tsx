"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AdminNotification } from "@/lib/notifications";

const SEEN_KEY = "de_admin_notifications_seen";
const POLL_MS = 60_000;

const KIND_LABEL: Record<AdminNotification["kind"], string> = {
  contact: "Contact message",
  comment: "Comment awaiting approval",
  reply: "Reply awaiting approval",
};

function timeAgo(value: string | null) {
  const parsed = value ? Date.parse(value) : NaN;
  if (Number.isNaN(parsed)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - parsed) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function NotificationBell() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => (typeof window === "undefined" ? 0 : Number(window.localStorage.getItem(SEEN_KEY)) || 0));
  const [failed, setFailed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" });
        const data = (await response.json()) as { notifications?: AdminNotification[]; error?: string };
        if (!response.ok || !data.notifications) throw new Error(data.error || "Unable to load notifications.");
        if (active) {
          setItems(data.notifications);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    }
    load();
    const timer = window.setInterval(load, POLL_MS);
    // Refresh when the admin comes back to this tab, so handled items drop off promptly.
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const unread = items.filter((item) => (Date.parse(item.createdAt ?? "") || 0) > seenAt).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = Date.now();
      window.localStorage.setItem(SEEN_KEY, String(now));
      setSeenAt(now);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        className="relative flex h-8 w-8 items-center justify-center text-white/85 transition hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#c45500] px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 w-[340px] overflow-hidden rounded-lg border border-[#d5d9d9] bg-white text-left text-[#0f1111] shadow-lg">
          <div className="border-b border-[#d5d9d9] px-4 py-3 text-[14px] font-bold">Notifications</div>
          {failed && items.length === 0 && <p className="px-4 py-4 text-[13px] text-[#565959]">Notifications could not be loaded.</p>}
          {!failed && items.length === 0 && <p className="px-4 py-4 text-[13px] text-[#565959]">Nothing new yet.</p>}
          <ul className="max-h-[360px] overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="border-b border-[#eaeded] last:border-0">
                <Link href={item.href} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-[#f3f3f3]">
                  <p className="text-[12px] font-semibold uppercase tracking-[.06em] text-[#565959]">
                    {KIND_LABEL[item.kind]}
                  </p>
                  <p className="mt-0.5 truncate text-[14px] font-semibold">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-[#565959]">{item.detail}</p>
                  <p className="mt-1 text-[12px] text-[#565959]">{timeAgo(item.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
