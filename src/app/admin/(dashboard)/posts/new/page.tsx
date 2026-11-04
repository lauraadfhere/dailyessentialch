import { connection } from "next/server";
import { getCategories, type CategoryOption } from "@/lib/parse";
import { PostForm } from "../../../post-form";

export default async function NewPostPage() {
  await connection();

  let categories: CategoryOption[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Add a post</h1>
        <p className="mt-1 text-[13px] text-[#565959]">Write in any of the site languages. Drafts stay hidden from the storefront until published.</p>
      </div>
      <PostForm mode="create" categories={categories} />
    </div>
  );
}
