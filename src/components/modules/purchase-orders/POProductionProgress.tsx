import type { POProductionStage } from "@/mock/purchaseOrders";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface POProductionProgressProps {
  stages: POProductionStage[];
  progressPercent: number;
}

function stageBadge(status: POProductionStage["status"]) {
  if (status === "DONE") {
    return {
      label: "DONE",
      className: "bg-emerald-100 text-emerald-700",
    };
  }
  if (status === "IN_PROGRESS") {
    return {
      label: "IN PROGRESS",
      className: "bg-amber-100 text-amber-800",
    };
  }
  return {
    label: "PENDING",
    className: "bg-slate-100 text-slate-600",
  };
}

export function POProductionProgress({
  stages,
  progressPercent,
}: POProductionProgressProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-slate-900">Production Live Tracking</h2>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-400"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {progressPercent}%
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">Done</TableHead>
              <TableHead className="text-right">Pend.</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage) => {
              const badge = stageBadge(stage.status);
              return (
                <TableRow key={stage.stage}>
                  <TableCell className="font-medium">{stage.stage}</TableCell>
                  <TableCell className="text-right">
                    {stage.issued.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.done.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    {stage.pending.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
