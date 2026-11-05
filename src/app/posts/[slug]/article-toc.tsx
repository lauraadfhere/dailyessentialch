"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; text: string; level: number };

function ListIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h.01M4 12h.01M4 18h.01M9 6h11M9 12h11M9 18h11" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Small floating contents button for long articles. Headings are read from the rendered body. */
export default function ArticleToc({ label = "Contents", showLabel = "Show table of contents", hideLabel = "Hide table of contents" }: { label?: string; showLabel?: string; hideLabel?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.getElementById("article-body");
    if (!body) return;
    // Read the rendered headings after paint so the state update is not synchronous in the effect.
    const frame = window.requestAnimationFrame(() => {
      const headings = Array.from(body.querySelectorAll<HTMLElement>("h2[id], h3[id]")).filter(
        (heading) => heading.textContent?.trim(),
      );
      setItems(
        headings.map((heading) => ({
          id: heading.id,
          text: heading.textContent!.trim(),
          level: heading.tagName === "H3" ? 3 : 2,
        })),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-104px 0px -62% 0px", threshold: 0 },
    );
    for (const item of items) {
      const heading = document.getElementById(item.id);
      if (heading) observer.observe(heading);
    }
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (items.length < 2) return null;

  return (
    <div ref={wrapper} className="fixed bottom-5 right-4 z-40 print:hidden sm:bottom-8 sm:right-7">
      {open && (
        <nav
          aria-label={label}
          className="mb-3 max-h-[60vh] w-[16.5rem] overflow-y-auto rounded-2xl border border-[#e2e0d8] bg-white/95 p-3 shadow-[0_26px_60px_-24px_rgba(27,27,27,.5)] backdrop-blur"
        >
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-[.22em] text-[#8a8679]">{label.toUpperCase()}</p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "location" : undefined}
                    className={`block rounded-lg py-1.5 pe-2 text-[13px] leading-5 transition ${
                      item.level === 3 ? "ps-6" : "ps-3"
                    } ${active ? "bg-[#f2d600]/30 font-semibold text-[#1b1b1b]" : "text-[#57554f] hover:bg-[#f2d600]/15 hover:text-[#1b1b1b]"}`}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? hideLabel : showLabel}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#1b1b1b] bg-[#1b1b1b] text-[#f2d600] shadow-[0_12px_30px_-12px_rgba(27,27,27,.75)] transition hover:-translate-y-0.5 hover:bg-[#f2d600] hover:text-[#1b1b1b]"
      >
        {open ? <CloseIcon /> : <ListIcon />}
      </button>
    </div>
  );
}
