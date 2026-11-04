import { uploadParseFile } from "@/lib/parse";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const extension = EXTENSIONS[type];
  if (!extension) return Response.json({ error: "Upload a JPG, PNG, WebP or GIF image." }, { status: 400 });

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return Response.json({ error: "The file is empty." }, { status: 400 });
  if (bytes.byteLength > MAX_BYTES) return Response.json({ error: "Keep the image under 5 MB." }, { status: 413 });

  try {
    const name = `cover-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const url = await uploadParseFile(name, type, bytes);
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload the image.";
    return Response.json({ error: message }, { status: 503 });
  }
}
