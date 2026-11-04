import { isAdmin } from "@/lib/admin-auth";
import { getAdminNotifications } from "@/lib/notifications";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const notifications = await getAdminNotifications();
    return Response.json({ notifications }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load notifications.";
    return Response.json({ error: message }, { status: 503 });
  }
}
