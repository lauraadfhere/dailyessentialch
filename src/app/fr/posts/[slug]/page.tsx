import type { Metadata } from "next";
import { PostPage, postMetadata } from "../../../posts/[slug]/page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata(params, "fr");
}

export default function FrenchPostPage({ params }: Props) {
  return <PostPage params={params} locale="fr" />;
}
