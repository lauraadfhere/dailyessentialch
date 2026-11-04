import Link from "next/link";
import { connection } from "next/server";
import { BookForm } from "../../../book-form";

export default async function AdminNewBookPage() {
  await connection();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/books" className="text-[13px] text-[#007185] hover:underline">← Back to books</Link>
        <h1 className="admin-display mt-2 text-[32px] font-medium leading-tight">Add a book</h1>
        <p className="mt-1 text-[13px] text-[#565959]">Books added here appear on the store once saved.</p>
      </div>
      <BookForm />
    </div>
  );
}
