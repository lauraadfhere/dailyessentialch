// Book catalog synced from the ELSPITCH books backend (app/data/books.ts there).
// Covers were re-encoded to public/books/*.webp at 900px wide, 2:3.

export type Book = {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  price: string;
  cover: string;
  excerpt: string;
  amazonUrl: string;
  type: "ebook" | "paperback" | "both";
  series?: string;
  ageRange?: string;
  isNew?: boolean;
  isbn?: string;
  pages?: number;
  rating?: number;
  ratingCount?: number;
};

/**
 * Three titles are stored with their KDP dashboard series link
 * (kdp.amazon.com/.../series/...), which asks for an author login and cannot be
 * opened by a customer. Until per-book store links are available they point at
 * the public Amazon author store already used in the header and footer.
 */
const AMAZON_AUTHOR_STORE = "https://www.amazon.com/stores/author/B0HPTRT8FN/about";

export const books: Book[] = [
  {
    id: 200,
    slug: "the-kingdom-behind-the-rainbow",
    title: "The Kingdom Behind the Rainbow",
    shortTitle: "The Kingdom Behind the Rainbow",
    price: "16",
    cover: "/books/the-kingdom-behind-the-rainbow.webp",
    excerpt:
      "An illustrated adventure behind the rainbow, published as an ebook and paperback on Amazon.",
    amazonUrl: "https://www.amazon.com/dp/B0HQ4ST9TD",
    type: "both",
    isNew: true,
  },
  {
    id: 111,
    slug: "buckky-riff-discovers-the-mysterious-hat",
    title: "BUCKKY: Riff Discovers the Mysterious Hat",
    shortTitle: "BUCKKY: The Mysterious Hat",
    price: "3.55",
    cover: "/books/buckky-riff-mysterious-hat.webp",
    excerpt:
      "A mysterious hat. An extraordinary adventure. Meet Riff, a curious adventurer, and Pip, a clever wooden bird, as an unexpected striped hat sparks magic and gentle lessons in responsibility.",
    amazonUrl: "https://www.amazon.it/dp/B0HNT4WFBD",
    type: "ebook",
    ageRange: "4–8",
    isNew: true,
  },
  {
    id: 113,
    slug: "zilo-and-the-mountain-of-almost",
    title: "Zilo and the Mountain of Almost",
    shortTitle: "The Mountain of Almost",
    price: "9.99",
    cover: "/books/zilo-mountain-of-almost.webp",
    excerpt:
      "Zilo sets out from Thistledown to climb the snowy summit of Mount Argent with friends Pip and Toma. Along the trek, they discover that the hardest climbs are not only about reaching the top.",
    amazonUrl: "https://kdp.amazon.com/en_US/series/AM5DKVK1XF8",
    type: "both",
    series: "The Curious Explorer Series",
    ageRange: "4–8",
  },
  {
    id: 123,
    slug: "zilo-and-the-river-that-runs-backwards",
    title: "Zilo and the River That Runs Backwards",
    shortTitle: "The River That Runs Backwards",
    price: "9.99",
    cover: "/books/zilo-river-runs-backwards.webp",
    excerpt:
      "What if a river ran backwards? When the river suddenly flows uphill, Zilo grabs an explorer's hat and follows the splash — with a maze, word search and spot-the-difference along the way.",
    amazonUrl: "https://kdp.amazon.com/en_US/series/AM5DKVK1XF8",
    type: "both",
    series: "The Curious Explorer Series",
    ageRange: "4–8",
    isNew: true,
  },
  {
    id: 164,
    slug: "zilo-and-the-whispering-cave",
    title: "Zilo and the Whispering Cave",
    shortTitle: "The Whispering Cave",
    price: "9.99",
    cover: "/books/zilo-whispering-cave.webp",
    excerpt:
      "When Zilo hears a mysterious whisper echoing from a hidden grotto, curiosity and courage turn shadows into wonder. A gentle illustrated tale about bravery, listening, and discovery.",
    amazonUrl: "https://kdp.amazon.com/en_US/series/AM5DKVK1XF8",
    type: "both",
    series: "The Curious Explorer Series",
    ageRange: "4–8",
  },
];

/** Look up a title for its public book page. */
export function getBook(slug: string) {
  return books.find((book) => book.slug === slug) ?? null;
}

/** Customer-facing store link for a book. */
export function amazonLink(book: Book) {
  return book.amazonUrl.includes("kdp.amazon.com") ? AMAZON_AUTHOR_STORE : book.amazonUrl;
}
