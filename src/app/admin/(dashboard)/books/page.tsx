import Link from "next/link";
import { connection } from "next/server";
import { getStoredBooks } from "@/lib/books-store";
import type { Book } from "@/lib/books";

export default async function AdminBooksPage() {
  await connection();

  let books: Book[] = [];
  let error = "";
  try {
    books = await getStoredBooks();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load books.";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-display text-[32px] font-medium leading-tight">Books</h1>
          <p className="mt-1 text-[13px] text-[#565959]">Add and manage the books shown in the store.</p>
        </div>
        <Link href="/admin/books/new" className="rounded bg-[#007185] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#005a6b]">
          Add a book
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded border border-[#cc0c39]/40 bg-[#fdf0f2] px-4 py-3 text-[13px] text-[#cc0c39]">{error}</p>
      )}

      <section className="overflow-x-auto rounded-lg border border-[#d5d9d9] bg-white">
        {books.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-[#565959]">{error ? "Books could not be loaded." : "No books yet."}</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-[#f0f2f2] text-[12px] text-[#565959]">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Title</th>
                <th className="px-5 py-2.5 font-semibold">Format</th>
                <th className="px-5 py-2.5 font-semibold">Price</th>
                <th className="px-5 py-2.5 font-semibold">Store link</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.slug} className="border-t border-[#e7e7e7] align-top">
                  <td className="px-5 py-3">
                    <span className="font-medium">{book.title}</span>
                    <p className="mt-0.5 text-[12px] text-[#565959]">/{book.slug}</p>
                  </td>
                  <td className="px-5 py-3">{book.type}</td>
                  <td className="px-5 py-3">{book.price ? `$${book.price}` : "—"}</td>
                  <td className="px-5 py-3">
                    {book.amazonUrl ? <a href={book.amazonUrl} target="_blank" rel="noreferrer" className="text-[#007185] hover:underline">Amazon</a> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
