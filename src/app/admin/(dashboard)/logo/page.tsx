import { connection } from "next/server";
import { getLogoSettings } from "@/lib/logo";
import { LogoForm } from "../../logo-form";

export default async function AdminLogoPage() {
  await connection();
  const settings = await getLogoSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-display text-[32px] font-medium leading-tight">Logo</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#565959]">
          Upload separate logos for the header and the footer, and set how wide each one is.
        </p>
      </div>
      <LogoForm initial={settings} />
    </div>
  );
}
