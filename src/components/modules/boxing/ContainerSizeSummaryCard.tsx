import type { ContainerSizeSummary } from "@/types";

interface ContainerSizeSummaryCardProps {
  summary: ContainerSizeSummary;
}

const sizeRows: Array<{ key: keyof ContainerSizeSummary; label: string }> = [
  { key: "total_0_3M", label: "0-3M" },
  { key: "total_3_6M", label: "3-6M" },
  { key: "total_6_9M", label: "6-9M" },
  { key: "total_9_12M", label: "9-12M" },
  { key: "total_12_18M", label: "12-18M" },
  { key: "total_18_24M", label: "18-24M" },
];

export function ContainerSizeSummaryCard({
  summary,
}: ContainerSizeSummaryCardProps) {
  const grandTotal =
    summary.grandTotalPieces ||
    sizeRows.reduce((sum, row) => sum + Number(summary[row.key] ?? 0), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Size-wise Summary
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sizeRows.map((row) => (
          <div
            key={row.key}
            className="rounded-lg bg-slate-50 px-3 py-2 text-center"
          >
            <p className="text-xs text-slate-500">{row.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {Number(summary[row.key] ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-medium text-slate-600">Grand Total</span>
        <span className="text-lg font-bold text-slate-900">
          {grandTotal.toLocaleString("en-IN")} pcs
        </span>
      </div>
    </div>
  );
}
