import type { Metadata } from "next";
import { homeMetadata } from "@/lib/seo";
import { Home } from "../page";

export const metadata: Metadata = homeMetadata("fr");

export default function HomePage() {
  return <Home locale="fr" />;
}
