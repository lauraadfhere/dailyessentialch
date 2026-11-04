import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook } from "@/lib/books";
import { bookMetadata } from "@/lib/seo";
import { BookPage } from "../../../components/book-page";

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return { title: "Livre introuvable", robots: { index: false, follow: false } };
  return bookMetadata(book, "fr");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();
  return <BookPage locale="fr" book={book} />;
}
