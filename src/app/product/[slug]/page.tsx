import { redirect } from "next/navigation";

export default async function ProductRedirectPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  redirect(`/en/product/${slug}`);
}
