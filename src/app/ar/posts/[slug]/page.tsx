import type { Metadata } from "next";
import { PostPage, postMetadata } from "../../../posts/[slug]/page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata(params, "ar");
}

export default function ArabicPostPage({ params }: Props) {
  return <PostPage params={params} locale="ar" />;
}
