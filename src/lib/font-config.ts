// Shared between server and client: the font choices the admin can apply to the platform.

export const FONT_OPTIONS = [
  { value: "geist", label: "Geist (clean sans-serif)", cssVar: "var(--font-geist-sans)", fallback: "Arial, Helvetica, sans-serif" },
  { value: "denitah", label: "Denitah Stellar (author font)", cssVar: "var(--font-denitah-stellar)", fallback: "Georgia, \"Times New Roman\", serif" },
  { value: "fraunces", label: "Fraunces (editorial serif)", cssVar: "var(--font-fraunces)", fallback: "Georgia, serif" },
  { value: "mono", label: "Geist Mono (monospace)", cssVar: "var(--font-geist-mono)", fallback: "monospace" },
  { value: "handwritten", label: "Caveat (handwritten)", cssVar: "var(--font-handwritten)", fallback: "cursive" },
] as const;

export type FontChoice = (typeof FONT_OPTIONS)[number]["value"];

export type FontSettings = {
  /** Font for the Latest posts titles. */
  postTitleFont: FontChoice;
  /** Font for the platform's body text. */
  bodyFont: FontChoice;
};

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  postTitleFont: "denitah",
  bodyFont: "geist",
};

const VALID = new Set<string>(FONT_OPTIONS.map((option) => option.value));

export function normaliseFontSettings(input: Record<string, unknown>): FontSettings | { error: string } {
  const postTitleFont = input.postTitleFont;
  const bodyFont = input.bodyFont;
  if (typeof postTitleFont !== "string" || !VALID.has(postTitleFont)) return { error: "Choose a valid post title font." };
  if (typeof bodyFont !== "string" || !VALID.has(bodyFont)) return { error: "Choose a valid body font." };
  return { postTitleFont: postTitleFont as FontChoice, bodyFont: bodyFont as FontChoice };
}

export function fontStack(choice: FontChoice) {
  const option = FONT_OPTIONS.find((item) => item.value === choice) ?? FONT_OPTIONS[0];
  return `${option.cssVar}, ${option.fallback}`;
}
