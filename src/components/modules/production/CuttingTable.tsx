"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MockCuttingEntry } from "@/mock/production";
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

interface CuttingTableProps {
  entries: MockCuttingEntry[];
  onAdd?: () => void;
}

export function CuttingTable({ entries, onAdd }: CuttingTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No cutting entries found"
        description="Record a cutting entry to start production tracking."
        actionLabel="Record Cutting Entry"
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
                Fabric (kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pieces
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Wastage (kg)
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
                <TableCell>{entry.designLabel}</TableCell>
                <TableCell>{entry.bundleNumber}</TableCell>
                <TableCell>{entry.fabricKg.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">
                  {entry.pieces.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="font-semibold text-red-600">
                  {entry.wastageKg.toFixed(1)}
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
