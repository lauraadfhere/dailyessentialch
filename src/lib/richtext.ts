// Small, dependency-free rich-text layer.
//
// Markup from a CMS or a visitor is never trusted. Everything downstream works with this
// parsed tree instead of the raw string: stored copies are re-serialised from an allowlist,
// and pages render the tree through React elements, so no input markup can reach the DOM as HTML.

export type RichTag =
  | "p" | "br" | "strong" | "em" | "u" | "ul" | "ol" | "li" | "a" | "blockquote" | "h2" | "h3"
  | "h1" | "h4" | "pre" | "code" | "hr" | "img" | "figure" | "figcaption" | "span" | "div"
  | "table" | "thead" | "tbody" | "tr" | "th" | "td";

export type RichNode =
  | { type: "text"; value: string }
  | { type: "element"; tag: RichTag; href?: string; src?: string; alt?: string; children: RichNode[] };

type TagMap = Record<string, RichTag>;

const VOID = new Set<RichTag>(["br", "hr", "img"]);
const BLOCKS = new Set<RichTag>(["p", "div", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4", "pre", "figure", "hr", "table", "thead", "tbody", "tr"]);
/** Blocks that a new sibling block must not close (paragraphs belong inside them). */
const KEEP_OPEN = new Set<RichTag>(["ul", "ol", "table", "thead", "tbody", "tr", "td", "th", "figure"]);
const CELLS = new Set<RichTag>(["td", "th"]);

/** Everything a reader's message may keep. */
const MESSAGE_TAGS: TagMap = {
  p: "p", div: "p", br: "br", strong: "strong", b: "strong", em: "em", i: "em", u: "u",
  ul: "ul", ol: "ol", li: "li", a: "a", blockquote: "blockquote", h2: "h2", h3: "h3",
};

/** The wider subset found in CMS post bodies. */
export const ARTICLE_TAGS: TagMap = {
  ...MESSAGE_TAGS,
  div: "div", h1: "h1", h4: "h4", pre: "pre", code: "code", hr: "hr", img: "img",
  figure: "figure", figcaption: "figcaption", span: "span",
  table: "table", thead: "thead", tbody: "tbody", tr: "tr", th: "th", td: "td",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(value: string) {
  return value.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    return ENTITIES[entity.toLowerCase()] ?? whole;
  });
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attribute(attributes: string, name: string) {
  const match = attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

/** Only absolute http(s)/mailto targets and site-relative paths survive. */
function safeHref(value?: string) {
  if (!value) return undefined;
  const href = value.trim();
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}

function safeSrc(value?: string) {
  if (!value) return undefined;
  const src = value.trim();
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  try {
    const url = new URL(src);
    return ["http:", "https:"].includes(url.protocol) ? src : undefined;
  } catch {
    return undefined;
  }
}

export function parseRichText(html: string, allowed: TagMap = MESSAGE_TAGS): RichNode[] {
  const root: RichNode[] = [];
  const stack: { tag: RichTag; href?: string; children: RichNode[] }[] = [];
  const target = () => (stack.length ? stack[stack.length - 1].children : root);
  const top = () => stack[stack.length - 1]?.tag;
  const source = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<![^>]*>/g, "");

  const open = (tag: RichTag, href?: string) => stack.push({ tag, href, children: [] });
  const closeTop = () => {
    const frame = stack.pop();
    if (!frame) return;
    const parent = target();
    if (frame.tag === "a" && !frame.href) parent.push(...frame.children);
    else parent.push({ type: "element", tag: frame.tag, href: frame.href, children: frame.children });
  };
  const closeWhile = (predicate: (tag: RichTag) => boolean) => {
    while (stack.length && predicate(stack[stack.length - 1].tag)) closeTop();
  };

  const pattern = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    if (match.index > cursor) {
      const text = decode(source.slice(cursor, match.index));
      if (text) target().push({ type: "text", value: text });
    }
    cursor = pattern.lastIndex;

    const closing = match[1] === "/";
    const tag = allowed[match[2].toLowerCase()];

    if (!tag) continue; // Unknown tag: drop the tag itself, keep its text flowing.

    if (closing) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tag === tag) {
          while (stack.length > index) closeTop();
          break;
        }
      }
      continue;
    }

    if (tag === "img") {
      const src = safeSrc(attribute(match[3], "src"));
      if (src) target().push({ type: "element", tag: "img", src, alt: decode(attribute(match[3], "alt") ?? ""), children: [] });
      continue;
    }

    if (tag === "hr") {
      target().push({ type: "element", tag: "hr", children: [] });
      continue;
    }

    if (tag === "br") {
      target().push({ type: "element", tag: "br", children: [] });
      continue;
    }

    // Keep table structure intact: cells close cells, rows close rows, and so on.
    if (CELLS.has(tag)) closeWhile((openTag) => CELLS.has(openTag));
    else if (tag === "tr") closeWhile((openTag) => openTag === "tr" || CELLS.has(openTag));
    else if (tag === "thead" || tag === "tbody") closeWhile((openTag) => openTag === "thead" || openTag === "tbody" || openTag === "tr" || CELLS.has(openTag));
    else if (BLOCKS.has(tag)) closeWhile((openTag) => !KEEP_OPEN.has(openTag));

    open(tag, tag === "a" ? safeHref(attribute(match[3], "href")) : undefined);
  }

  if (cursor < source.length) {
    const text = decode(source.slice(cursor));
    if (text) target().push({ type: "text", value: text });
  }
  while (stack.length) closeTop();

  return root;
}

/** Serialise a parsed tree back to the allowlisted markup that gets stored. */
export function serializeRichText(nodes: RichNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return escapeHtml(node.value);
      if (VOID.has(node.tag)) {
        if (node.tag === "img") {
          return `<img src="${escapeHtml(node.src ?? "")}"${node.alt ? ` alt="${escapeHtml(node.alt)}"` : ""}>`;
        }
        return `<${node.tag}>`;
      }
      const inner = serializeRichText(node.children);
      if (node.tag === "a" && !node.href) return inner;
      const attributes = node.tag === "a" ? ` href="${escapeHtml(node.href ?? "")}" target="_blank" rel="noreferrer noopener"` : "";
      return `<${node.tag}${attributes}>${inner}</${node.tag}>`;
    })
    .join("");
}

export function richTextToPlain(nodes: RichNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.value;
      if (node.tag === "br") return "\n";
      if (node.tag === "img") return " ";
      return `${richTextToPlain(node.children)} `;
    })
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Normalised markup for storage, plus the plain-text version used for previews. */
export function normalizeRichText(html: string) {
  const nodes = parseRichText(html);
  return { html: serializeRichText(nodes), text: richTextToPlain(nodes) };
}

/** True when the body is markup rather than the Markdown the editor produces. */
export function looksLikeHtml(content: string) {
  return /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|table|figure|img|br)\b[^>]*>/i.test(content);
}
