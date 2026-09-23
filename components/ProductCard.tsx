import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ConditionBadge } from "./ConditionBadge";

export function ProductCard({ product }: { product: Product }) {
  return <Link href={`/products/${product.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"><div className="relative aspect-[4/3] bg-mist"><Image src={product.images[0]} alt="" fill className="object-cover" /></div><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-ink group-hover:text-moss">{product.title}</h2><span className="whitespace-nowrap font-bold text-moss">S${product.price}</span></div><div className="flex items-center justify-between gap-2"><span className="text-sm text-slate-500">{product.category}</span><ConditionBadge condition={product.condition} /></div><p className="line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>{product.aiTags.length > 0 && <div className="flex flex-wrap gap-1.5" aria-label="AI-generated listing tags">{product.aiTags.map((tag) => <span key={tag} className="rounded-full bg-mist px-2 py-1 text-xs font-medium text-slate-700">{tag}</span>)}</div>}</div></Link>;
}
