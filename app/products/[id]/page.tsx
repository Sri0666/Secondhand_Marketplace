import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { getProductById, products } from "@/lib/catalogue";

export function generateStaticParams() { return products.map(({ id }) => ({ id })); }

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const product = getProductById(id); if (!product) notFound();
  return <ProductDetails product={product} />;
}
