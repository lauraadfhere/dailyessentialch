import { getLogoSettings } from "@/lib/logo";

export async function GET() {
  return Response.json(await getLogoSettings(), { headers: { "Cache-Control": "public, max-age=60" } });
}
