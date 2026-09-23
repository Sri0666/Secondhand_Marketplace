import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { categories, products } from "@/lib/catalogue";

export default function HomePage() {
  return <><section className="mb-8 max-w-2xl space-y-4"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Second lives for electronics</p><h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Find tech worth keeping in the circuit.</h1><p className="text-lg leading-8 text-slate-600">ReCircuit is a simple marketplace for working devices, minor faults, repair projects, and useful parts.</p></section><CatalogueBrowser products={products} categories={categories} /></>;
}
