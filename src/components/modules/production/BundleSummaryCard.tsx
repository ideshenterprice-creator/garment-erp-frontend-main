import type { BundleSummary } from "@/types";

interface BundleSummaryCardProps {
  summary: BundleSummary;
}

export function BundleSummaryCard({ summary }: BundleSummaryCardProps) {
  const rows = [
    { label: "Bundle No", value: summary.bundleNumber },
    { label: "PO", value: summary.poNumber },
    { label: "Design", value: summary.designNumber ?? "—" },
    { label: "Garment", value: summary.garmentType ?? "—" },
    {
      label: "Fabric Issued",
      value: `${Number(summary.fabricIssuedKg).toLocaleString("en-IN")} kg`,
    },
    { label: "Current Stage", value: summary.currentStage.replaceAll("_", " ") },
    { label: "Status", value: summary.status.replaceAll("_", " ") },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Bundle Summary
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
