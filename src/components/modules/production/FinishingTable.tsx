"use client";

import { Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MockFinishingEntry } from "@/mock/production";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const finishingBadge: Record<string, string> = {
  Ironing: "bg-violet-50 text-violet-700",
  "Poly Packing": "bg-emerald-50 text-emerald-700",
  "Gift Packing": "bg-amber-50 text-amber-800",
  "Hanger Attachment": "bg-sky-50 text-sky-700",
};

interface FinishingTableProps {
  entries: MockFinishingEntry[];
  onAdd?: () => void;
}

export function FinishingTable({ entries, onAdd }: FinishingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No finishing entries found"
        description="Record finishing operations after stitching is complete."
        actionLabel="+ Record Finishing Entry"
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
                Design
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bundle
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recv. Pcs
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Operation
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Comp. Pcs
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-semibold text-slate-900">
                  {entry.entryNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(entry.entryDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{entry.poNumber}</TableCell>
                <TableCell>{entry.designNumber}</TableCell>
                <TableCell>{entry.bundleNumber}</TableCell>
                <TableCell>
                  {entry.piecesReceived.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      finishingBadge[entry.operationName] ??
                        "bg-slate-100 text-slate-700"
                    )}
                  >
                    {entry.operationName}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">
                  {entry.piecesCompleted.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell>{entry.karigarName}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-teal-700"
                    onClick={() =>
                      router.push(
                        ROUTES.PRODUCTION.BUNDLE_DETAIL(entry.bundleNumber)
                      )
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
