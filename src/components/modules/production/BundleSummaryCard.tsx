import type { MockBundleRecord } from "@/mock/production";
import { SizeBreakdownChips } from "@/components/modules/production/SizeBreakdownChips";
import { cn } from "@/lib/utils";

interface BundleSummaryCardProps {
  bundle: MockBundleRecord;
}

const stageBadge: Record<string, string> = {
  CUTTING: "bg-sky-50 text-sky-700",
  PRINTING: "bg-violet-50 text-violet-700",
  COLORING: "bg-amber-50 text-amber-800",
  STITCHING: "bg-teal-50 text-teal-700",
  FINISHING: "bg-orange-50 text-orange-700",
  BOXING: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

export function BundleSummaryCard({ bundle }: BundleSummaryCardProps) {
  const fields = [
    { label: "Bundle No", value: bundle.bundleNumber },
    { label: "PO Number", value: bundle.poNumber },
    { label: "Design", value: bundle.designNumber },
    { label: "Garment Type", value: bundle.garmentType },
    { label: "Color", value: bundle.color },
    {
      label: "Total Pieces",
      value: bundle.totalPieces.toLocaleString("en-IN"),
    },
    {
      label: "Fabric Issued",
      value: `${bundle.fabricIssuedKg.toLocaleString("en-IN")} kg`,
    },
    {
      label: "Wastage",
      value: `${bundle.wastageKg.toLocaleString("en-IN")} kg`,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Bundle Summary</h2>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
            stageBadge[bundle.currentStage] ?? "bg-slate-100 text-slate-700"
          )}
        >
          {bundle.currentStage.replace("_", " ")}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {field.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {field.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Size Breakdown
        </p>
        <div className="mt-2">
          <SizeBreakdownChips sizes={bundle.sizes} className="gap-1.5" />
        </div>
      </div>
    </div>
  );
}
