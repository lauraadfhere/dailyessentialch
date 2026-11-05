import { connection } from "next/server";
import { getFontSettings } from "@/lib/font-settings";
import { FontForm } from "../../font-form";

export default async function AdminFontsPage() {
  await connection();
  const settings = await getFontSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Fonts</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Choose the font for the Latest posts titles and for the body text across the platform.
        </p>
      </div>
      <FontForm initial={settings} />
    </div>
  );
}
