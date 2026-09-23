import type { ProductCondition } from "@/lib/types";

const styles: Record<ProductCondition, string> = { Working: "bg-emerald-100 text-emerald-800", "Minor Fault": "bg-amber-100 text-amber-800", "Repair Needed": "bg-orange-100 text-orange-800", "Parts Only": "bg-slate-200 text-slate-700" };

export function ConditionBadge({ condition }: { condition: ProductCondition }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[condition]}`}>{condition}</span>;
}
