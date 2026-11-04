"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
    { command: "removeFormat", caption: copy.clear, content: icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3") },
  ],
];

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

  // Seed the field once. Leaving it uncontrolled keeps the caret where the writer
  // expects it instead of resetting it on every render.
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    onChange(editor.current?.innerHTML ?? "");
  }

  function run(item: ToolItem) {
    editor.current?.focus();
    if (item.command === "createLink") {
      const url = window.prompt(item.caption, item.prompt ?? "https://");
      if (!url || !/^https?:\/\//i.test(url.trim())) return;
      document.execCommand("createLink", false, url.trim());
    } else if (item.value) {
      document.execCommand(item.command, false, item.value);
    } else {
      document.execCommand(item.command, false);
    }
    sync();
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
      </div>
    </div>
  );
}
