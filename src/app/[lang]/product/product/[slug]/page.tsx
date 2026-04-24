import { redirect } from "next/navigation";

export default async function ProductRedirectPage({ params }: PageProps<"/[lang]/product/product/[slug]">) {
  const { slug } = await params;
  redirect(`/en/product/${slug}`);
}
