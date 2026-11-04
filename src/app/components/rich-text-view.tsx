import type { ReactNode } from "react";
import { parseRichText, type RichNode } from "@/lib/richtext";

function render(nodes: RichNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    const children = render(node.children);
    switch (node.tag) {
      case "br":
        return <br key={index} />;
      case "a":
        return node.href
          ? <a key={index} href={node.href} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">{children}</a>
          : <span key={index}>{children}</span>;
      case "p": return <p key={index}>{children}</p>;
      case "h2": return <h2 key={index} className="mt-4 text-[17px] font-semibold">{children}</h2>;
      case "h3": return <h3 key={index} className="mt-3 text-[15px] font-semibold">{children}</h3>;
      case "blockquote": return <blockquote key={index} className="border-s-2 border-[#d5d9d9] ps-3 text-[#565959]">{children}</blockquote>;
      case "ul": return <ul key={index} className="list-disc ps-5">{children}</ul>;
      case "ol": return <ol key={index} className="list-decimal ps-5">{children}</ol>;
      case "li": return <li key={index}>{children}</li>;
      case "strong": return <strong key={index} className="font-semibold">{children}</strong>;
      case "em": return <em key={index}>{children}</em>;
      case "u": return <u key={index}>{children}</u>;
      default: return <span key={index}>{children}</span>;
    }
  });
}

/** Renders stored message markup as React elements — no HTML string ever hits the DOM. */
export function RichTextView({ html, className }: { html: string; className?: string }) {
  return <div className={className}>{render(parseRichText(html))}</div>;
}
