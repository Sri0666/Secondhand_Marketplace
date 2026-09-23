import Link from "next/link";

export function Header() {
  return <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Link href="/" className="text-xl font-bold tracking-tight text-moss">ReCircuit</Link><div className="flex gap-4 text-sm font-medium text-slate-600"><Link href="/sell">Sell</Link><Link href="/compare">Compare</Link><Link href="/notes">Notes</Link></div></nav></header>;
}
