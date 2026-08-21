"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type {
  MockStitchingEntry,
  StitchingEntryStatus,
} from "@/mock/production";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { cn, formatCurrency } from "@/lib/utils";

const operationBadge: Record<string, string> = {
  "Side Seam": "bg-sky-50 text-sky-700",
  "Sleeve Attach": "bg-violet-50 text-violet-700",
  "Collar Prep": "bg-amber-50 text-amber-800",
  Overlock: "bg-teal-50 text-teal-700",
  "Bottom Hem": "bg-orange-50 text-orange-700",
  Flatlock: "bg-indigo-50 text-indigo-700",
  "Lock Stitch": "bg-slate-100 text-slate-700",
};

const statusBadge: Record<StitchingEntryStatus, string> = {
  RETURNED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-amber-50 text-amber-800",
  PENDING: "bg-slate-100 text-slate-600",
};

interface StitchingTableProps {
  entries: MockStitchingEntry[];
  onAdd?: () => void;
}

export function StitchingTable({ entries, onAdd }: StitchingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No stitching entries found"
        description="Record stitching work after coloring is complete."
        actionLabel="Record Stitching Entry"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Entry No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bundle
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Operation
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Given
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Returned
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rejected
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount Due
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const initials = entry.karigarName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      ROUTES.PRODUCTION.BUNDLE_DETAIL(entry.bundleNumber)
                    )
                  }
                >
                  <TableCell className="font-semibold text-slate-900">
                    {entry.entryNumber}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.entryDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{entry.poNumber}</TableCell>
                  <TableCell>{entry.bundleNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-teal-100 text-[10px] font-semibold text-teal-800">
                        {initials}
                      </span>
                      {entry.karigarName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        operationBadge[entry.operationName] ??
                          "bg-slate-100 text-slate-700"
                      )}
                    >
                      {entry.operationName}
                    </span>
                  </TableCell>
                  <TableCell>{entry.piecesGiven}</TableCell>
                  <TableCell>{entry.piecesReturned}</TableCell>
                  <TableCell
                    className={cn(
                      entry.piecesRejected > 0 && "font-semibold text-red-600"
                    )}
                  >
                    {entry.piecesRejected}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.status === "PENDING"
                      ? "—"
                      : formatCurrency(entry.amountDue)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                        statusBadge[entry.status]
                      )}
                    >
                      {entry.status.replace("_", " ")}
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
