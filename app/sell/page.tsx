import { CreateListingForm } from "@/components/CreateListingForm";

export default function SellPage() {
  return <section className="mx-auto max-w-3xl space-y-5"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Seller tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Create a listing</h1><p className="mt-2 text-slate-600">AI tags are generated once when this listing is saved and then persist with it.</p></div><CreateListingForm /></section>;
}
