"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type EditorCopy = {
  toolbar: string;
  bold: string;
  italic: string;
  underline: string;
  bulleted: string;
  numbered: string;
  clear: string;
};

type ToolItem = {
  command: string;
  caption: string;
  content: ReactNode;
  value?: string;
  prompt?: string;
};

// Inline SVG icons keep the toolbar dependency-free and match the Stack Overflow style.
const icon = (path: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const groups = (copy: EditorCopy): ToolItem[][] => [
  [
    { command: "bold", caption: copy.bold, content: <span className="text-[15px] font-bold">B</span> },
    { command: "italic", caption: copy.italic, content: <span className="text-[15px] italic">I</span> },
    { command: "strikeThrough", caption: "Strikethrough", content: <span className="text-[15px] line-through">S</span> },
  ],
  [
    { command: "formatBlock", value: "pre", caption: "Code", content: icon("M16 18l6-6-6-6M8 6l-6 6 6 6") },
    { command: "formatBlock", value: "blockquote", caption: "Quote", content: icon("M7 17h3l2-4V7H6v6h3M14 17h3l2-4V7h-6v6h3") },
  ],
  [
    { command: "createLink", caption: "Link", prompt: "https://", content: icon("M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1") },
  ],
  [
    { command: "insertUnorderedList", caption: copy.bulleted, content: icon("M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01") },
    { command: "insertOrderedList", caption: copy.numbered, content: icon("M10 6h11M10 12h11M10 18h11M4 4v4M3 8h2M3 14h2l-2 3h2") },
  ],
  [
    { command: "formatBlock", value: "h3", caption: "Heading", content: <span className="text-[13px] font-bold">H</span> },
    { command: "formatBlock", value: "h2", caption: "Large heading", content: <span className="text-[13px] font-bold">H2</span> },
  ],
  [
    { command: "insertImage", caption: "Image", content: icon("M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9h.01") },
    { command: "insertVideo", caption: "YouTube or Vimeo video", content: icon("M4 6h12v12H4zM16 10l5-3v10l-5-3") },
    { command: "insertButton", caption: "Button", content: icon("M4 9h16v6H4zM8 12h8") },
    { command: "insertFile", caption: "File", content: icon("M14 3H6v18h12V7zM14 3v4h4") },
    { command: "insertTable", caption: "Table", content: icon("M3 4h18v16H3zM3 10h18M3 15h18M9 4v16M15 4v16") },
  ],
  [
    { command: "removeFormat", caption: copy.clear, content: icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3") },
  ],
];

/** Extracts the 11-character id from YouTube or Vimeo links; returns null for other hosts. */
export function toEmbedUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1] ?? "";
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

type Props = {
  id: string;
  label: string;
  placeholder: string;
  copy: EditorCopy;
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ id, label, placeholder, copy, value, onChange }: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ kind: "image" | "file"; command: string } | null>(null);
  const [notice, setNotice] = useState("");

  // Seed the field once. Leaving it uncontrolled keeps the caret where the writer
  // expects it instead of resetting it on every render.
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    onChange(editor.current?.innerHTML ?? "");
  }

  function insertHtml(html: string) {
    editor.current?.focus();
    document.execCommand("insertHTML", false, html);
    sync();
  }

  function escape(value: string) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  async function uploadFile(file: File) {
    const response = await fetch("/api/admin/uploads", { method: "POST", headers: { "content-type": file.type }, body: file });
    const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
    return data.url;
  }

  function run(item: ToolItem) {
    setNotice("");
    if (item.command === "createLink") {
      editor.current?.focus();
      const url = window.prompt(item.caption, item.prompt ?? "https://");
      if (!url || !/^https?:\/\//i.test(url.trim())) return;
      document.execCommand("createLink", false, url.trim());
      sync();
    } else if (item.command === "insertImage" || item.command === "insertFile") {
      setPending({ kind: item.command === "insertImage" ? "image" : "file", command: item.command });
      fileInput.current?.click();
    } else if (item.command === "insertVideo") {
      editor.current?.focus();
      const url = window.prompt("Paste a YouTube or Vimeo link", "https://");
      if (!url) return;
      const embed = toEmbedUrl(url);
      if (!embed) {
        setNotice("Only YouTube and Vimeo links can be embedded.");
        return;
      }
      insertHtml(`<iframe src="${escape(embed)}"></iframe><p></p>`);
    } else if (item.command === "insertButton") {
      editor.current?.focus();
      const text = window.prompt("Button text", "Read more");
      if (!text?.trim()) return;
      const url = window.prompt("Button link", "https://");
      if (!url || !/^https?:\/\//i.test(url.trim())) {
        setNotice("The button link must start with http:// or https://.");
        return;
      }
      insertHtml(`<p><a href="${escape(url.trim())}" data-variant="button">${escape(text.trim())}</a></p>`);
    } else if (item.command === "insertTable") {
      const columns = Math.min(6, Math.max(1, Number(window.prompt("Number of columns", "3")) || 0));
      const rows = Math.min(20, Math.max(1, Number(window.prompt("Number of body rows", "2")) || 0));
      if (!columns || !rows) return;
      const head = `<tr>${"<th>Heading</th>".repeat(columns)}</tr>`;
      const body = `<tr>${"<td>Cell</td>".repeat(columns)}</tr>`.repeat(rows);
      insertHtml(`<table><thead>${head}</thead><tbody>${body}</tbody></table><p></p>`);
    } else if (item.value) {
      editor.current?.focus();
      document.execCommand(item.command, false, item.value);
      sync();
    } else {
      editor.current?.focus();
      document.execCommand(item.command, false);
      sync();
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const kind = pending;
    event.target.value = "";
    setPending(null);
    if (!file || !kind) return;
    try {
      const url = await uploadFile(file);
      if (kind.kind === "image") {
        insertHtml(`<figure><img src="${escape(url)}" alt="${escape(file.name)}"></figure>`);
      } else {
        insertHtml(`<p><a href="${escape(url)}" data-variant="button">Download ${escape(file.name)}</a></p>`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  // Paste as plain text so foreign markup never reaches the stored message.
  function paste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
    sync();
  }

  return (
    <div>
      <label className="text-[13px] font-semibold text-[#1b1b1b]" htmlFor={id}>{label}</label>
      <div className="mt-2 overflow-hidden rounded-[6px] border border-[#9fa6ad] bg-white shadow-[inset_0_1px_0_rgba(0,0,0,.04)] focus-within:border-[#2f7fc1] focus-within:shadow-[0_0_0_4px_rgba(47,127,193,.18)]">
        <div role="toolbar" aria-label={copy.toolbar} className="flex flex-wrap items-center gap-y-1 border-b border-[#d6d9dc] bg-[#f8f9f9] px-2 py-1.5">
          {groups(copy).map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-0.5 border-e border-[#d6d9dc] px-1.5 last:border-e-0">
              {group.map((item) => (
                <button
                  key={`${item.command}-${item.value ?? ""}-${item.caption}`}
                  type="button"
                  title={item.caption}
                  aria-label={item.caption}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => run(item)}
                  className="flex h-7 min-w-7 items-center justify-center rounded-[4px] px-1.5 text-[#525960] transition hover:bg-[#e3e6e8] hover:text-[#2c3135] focus-visible:outline-2 focus-visible:outline-[#2f7fc1]"
                >
                  {item.content}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div
          id={id}
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          data-placeholder={placeholder}
          onInput={sync}
          onPaste={paste}
          className="rich-editor rich-content min-h-44 w-full px-3 py-3 text-[15px] leading-7 text-[#1b1b1b] outline-none"
        />
        {notice ? <p role="alert" className="border-t border-[#f1c0c0] bg-[#fdf2f2] px-3 py-2 text-[13px] text-[#9b2c2c]">{notice}</p> : null}
        <input
          ref={fileInput}
          type="file"
          accept={pending?.kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "application/pdf,application/zip,text/plain,image/jpeg,image/png,image/webp,image/gif"}
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
