"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MockColoringEntry } from "@/mock/production";
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
import { cn } from "@/lib/utils";

interface ColoringTableProps {
  entries: MockColoringEntry[];
  onAdd?: () => void;
}

export function ColoringTable({ entries, onAdd }: ColoringTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No coloring entries found"
        description="Record a coloring entry after printing is complete."
        actionLabel="Record Coloring Entry"
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
                Pieces Received
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Color Applied
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pieces Returned
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rejected
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(ROUTES.PRODUCTION.BUNDLE_DETAIL(entry.bundleNumber))
                }
              >
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
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "size-3 rounded-full border border-slate-300",
                        entry.colorHex === "#ffffff" && "bg-white"
                      )}
                      style={
                        entry.colorHex !== "#ffffff"
                          ? { backgroundColor: entry.colorHex }
                          : undefined
                      }
                    />
                    {entry.colorApplied}
                  </span>
                </TableCell>
                <TableCell className="bg-amber-50/70 font-medium text-amber-800">
                  {entry.piecesReturned.toLocaleString("en-IN")} pcs
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {entry.piecesRejected.toLocaleString("en-IN")} pcs
                  </span>
                </TableCell>
                <TableCell>{entry.karigarName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
