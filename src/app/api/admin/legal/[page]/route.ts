import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { getLegal, isLegalPageKey, readLegalInput, saveLegal } from "@/lib/legal";

type Params = { params: Promise<{ page: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { page } = await params;
  if (!isLegalPageKey(page)) return Response.json({ error: "Unknown page." }, { status: 404 });
  return Response.json({ legal: await getLegal(page) });
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const { page } = await params;
  if (!isLegalPageKey(page)) return Response.json({ error: "Unknown page." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readLegalInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return Response.json({ legal: await saveLegal(page, parsed.input) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the page.";
    return Response.json({ error: message }, { status: 503 });
  }
}
