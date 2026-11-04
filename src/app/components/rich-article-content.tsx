import type { ReactNode } from "react";
import { ARTICLE_TAGS, looksLikeHtml, parseRichText, richTextToPlain, type RichNode, type RichTag } from "@/lib/richtext";

function safeHref(value: string) {
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

/** Anchor-safe, per-article unique ids for the contents list. */
type HeadingIds = { used: Map<string, number> };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function headingId(state: HeadingIds, text: string) {
  const base = slugify(text) || "section";
  const seen = state.used.get(base) ?? 0;
  state.used.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}

function inline(text: string): ReactNode[] {
  const pieces: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
    const key = `${match.index}-${index++}`;
    if (match[2] && match[3]) {
      const href = safeHref(match[3]);
      pieces.push(href ? <a key={key} href={href} className={styles.link} rel={href.startsWith("http") ? "noreferrer" : undefined} target={href.startsWith("http") ? "_blank" : undefined}>{match[2]}</a> : match[2]);
    } else if (match[4]) pieces.push(<code key={key} className={styles.codeInline}>{match[4]}</code>);
    else if (match[5] || match[6]) pieces.push(<strong key={key} className="font-semibold text-[#1b1b1b]">{match[5] || match[6]}</strong>);
    else pieces.push(<em key={key}>{match[7] || match[8]}</em>);
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}

function isBlockStart(line: string) {
  return /^(```|#{1,3}\s|>\s?|[-*+]\s+|\d+\.\s+|---+\s*$)/.test(line);
}

function MarkdownArticle({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  const ids: HeadingIds = { used: new Map() };
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(/^```\s*([^\s]*)/);
    if (fence) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      if (i < lines.length) i += 1;
      blocks.push(
        <pre key={`code-${i}`} className={styles.pre}>
          <code data-language={fence[1] || undefined}>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const text = heading[2];
      if (heading[1].length === 1) blocks.push(<h2 key={`heading-${i}`} id={headingId(ids, text)} className={`${styles.h2} scroll-mt-28`}>{inline(text)}</h2>);
      else if (heading[1].length === 2) blocks.push(<h3 key={`heading-${i}`} id={headingId(ids, text)} className={`${styles.h3} scroll-mt-28`}>{inline(text)}</h3>);
      else blocks.push(<h4 key={`heading-${i}`} className={styles.h4}>{inline(text)}</h4>);
      i += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) { blocks.push(<hr key={`rule-${i}`} className={styles.rule} />); i += 1; continue; }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${i}`} className={styles.quote}>{inline(quote.join(" "))}</blockquote>);
      continue;
    }

    const unordered = line.match(/^[-*+]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      const items: string[] = [];
      const marker = unordered ? /^[-*+]\s+(.+)$/ : /^\d+\.\s+(.+)$/;
      while (i < lines.length) {
        const item = lines[i].match(marker);
        if (!item) break;
        items.push(item[1]);
        i += 1;
      }
      const listItems = items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>);
      blocks.push(unordered ? <ul key={`list-${i}`} className={styles.list}>{listItems}</ul> : <ol key={`list-${i}`} className={styles.ordered}>{listItems}</ol>);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={`paragraph-${i}`} className={styles.p}>{inline(paragraph.join(" "))}</p>);
  }

  return <div id="article-body" className="mt-14 space-y-7 text-lg">{blocks}</div>;
}

const styles = {
  h1: "mt-12 text-4xl font-medium leading-tight tracking-[-0.04em] text-[#1b1b1b]",
  h2: "mt-7 text-4xl font-medium leading-tight tracking-[-0.04em] text-[#1b1b1b]",
  h3: "mt-6 text-3xl font-medium leading-tight tracking-[-0.035em] text-[#1b1b1b]",
  h4: "mt-5 text-2xl font-medium leading-tight tracking-[-0.025em] text-[#1b1b1b]",
  p: "leading-8 text-[#383735]",
  list: "my-7 list-disc space-y-2 ps-6 marker:text-[#b69b00]",
  ordered: "my-7 list-decimal space-y-2 ps-6 marker:text-[#b69b00]",
  quote: "my-9 border-s-2 border-[#f2d600] ps-5 text-xl leading-8 tracking-[-0.02em] text-[#57554f]",
  // Code blocks follow the familiar Stack Overflow reading style: light card, thin border, small mono type.
  pre: "my-8 overflow-x-auto rounded-md border border-[#d6d9dc] bg-[#f6f6f6] p-4 font-mono text-[13px] leading-[1.65] text-[#242729] [tab-size:4]",
  codeInline: "rounded border border-[#d6d9dc] bg-[#eff0f1] px-1.5 py-0.5 font-mono text-[.85em] text-[#242729]",
  link: "font-medium text-[#6f5a00] underline decoration-[#f2d600] decoration-2 underline-offset-[3px] transition-colors hover:bg-[#f2d600]/30 hover:text-[#1b1b1b] hover:decoration-[#1b1b1b]",
  rule: "my-10 border-0 border-t border-[#deded7]",
};

/** Table containers reject whitespace text children in the DOM, which breaks hydration. */
const TABLE_PARTS = new Set<RichTag>(["table", "thead", "tbody", "tr"]);

/** Renders CMS post markup as React elements, so stored HTML is never injected raw. */
function renderHtml(nodes: RichNode[], ids: HeadingIds, inPre = false, inTable = false): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") {
      // Markup pretty-printed with newlines would otherwise become text nodes inside <table>/<tr>.
      if (inTable && !node.value.trim()) return null;
      return node.value;
    }
    const children = renderHtml(node.children, ids, node.tag === "pre" || inPre, TABLE_PARTS.has(node.tag));
    switch (node.tag) {
      case "br": return <br key={index} />;
      case "hr": return <hr key={index} className={styles.rule} />;
      case "h1":
      case "h2": return <h2 key={index} id={headingId(ids, richTextToPlain(node.children))} className={`${styles.h2} scroll-mt-28`}>{children}</h2>;
      case "h3": return <h3 key={index} id={headingId(ids, richTextToPlain(node.children))} className={`${styles.h3} scroll-mt-28`}>{children}</h3>;
      case "h4": return <h4 key={index} className={styles.h4}>{children}</h4>;
      case "p":
      case "div": return <p key={index} className={styles.p}>{children}</p>;
      case "span": return <span key={index}>{children}</span>;
      case "strong": return <strong key={index} className="font-semibold text-[#1b1b1b]">{children}</strong>;
      case "em": return <em key={index}>{children}</em>;
      case "u": return <u key={index}>{children}</u>;
      case "ul": return <ul key={index} className={styles.list}>{children}</ul>;
      case "ol": return <ol key={index} className={styles.ordered}>{children}</ol>;
      case "li": return <li key={index}>{children}</li>;
      case "blockquote": return <blockquote key={index} className={styles.quote}>{children}</blockquote>;
      case "pre": return <pre key={index} className={styles.pre}><code>{children}</code></pre>;
      case "code": return inPre ? <code key={index}>{children}</code> : <code key={index} className={styles.codeInline}>{children}</code>;
      case "a": return node.href
        ? <a key={index} href={node.href} className={styles.link} target="_blank" rel="noreferrer noopener">{children}</a>
        : <span key={index}>{children}</span>;
      case "img": return node.src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img key={index} src={node.src} alt={node.alt ?? ""} loading="lazy" referrerPolicy="no-referrer" className="article-image my-9 h-auto w-full rounded-xl" />
        : null;
      case "figure": return <figure key={index} className="my-9">{children}</figure>;
      case "figcaption": return <figcaption key={index} className="mt-3 text-sm leading-6 text-[#77736b]">{children}</figcaption>;
      case "table": return <div key={index} className="my-9 overflow-x-auto"><table className="w-full border-collapse text-left text-[15px]">{children}</table></div>;
      case "thead": return <thead key={index}>{children}</thead>;
      case "tbody": return <tbody key={index}>{children}</tbody>;
      case "tr": return <tr key={index} className="border-b border-[#deded7]">{children}</tr>;
      case "th": return <th key={index} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#72726d]">{children}</th>;
      case "td": return <td key={index} className="px-3 py-2.5 align-top text-[#383735]">{children}</td>;
      default: return <span key={index}>{children}</span>;
    }
  });
}

export default function RichArticleContent({ content }: { content: string }) {
  // Posts arrive from the CMS as HTML; older drafts may still be Markdown.
  if (!looksLikeHtml(content)) return <MarkdownArticle content={content} />;
  return (
    <div id="article-body" className="mt-14 space-y-7 text-lg">
      {renderHtml(parseRichText(content, ARTICLE_TAGS), { used: new Map() })}
    </div>
  );
}
