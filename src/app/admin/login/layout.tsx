import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin sign-in page is a private tool: keep it out of search results.
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
