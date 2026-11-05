import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getLegal, isLegalPageKey } from "@/lib/legal";
import { LegalForm } from "../../../legal-form";

const labels = { privacy: "Privacy policy", terms: "Terms of use" } as const;

export default async function AdminLegalPage({ params }: { params: Promise<{ page: string }> }) {
  await connection();
  const { page } = await params;
  if (!isLegalPageKey(page)) notFound();
  const legal = await getLegal(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">{labels[page]}</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Edit the text shown on the public page. Changes appear immediately after saving.
        </p>
        {legal.updatedAt && (
          <p className="mt-2 text-[12px] text-[#565959]">Last saved {new Date(legal.updatedAt).toLocaleString("en-GB")}</p>
        )}
      </div>
      <LegalForm key={page} pageKey={page} legal={legal} />
    </div>
  );
}
