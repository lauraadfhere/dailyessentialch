import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminShell } from "../admin-shell";

// Private dashboard: never index it, even if a link to it is ever shared.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // The admin area must never be prerendered: render everything at request time
  // so the session check runs before any dashboard markup is produced.
  await connection();
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
