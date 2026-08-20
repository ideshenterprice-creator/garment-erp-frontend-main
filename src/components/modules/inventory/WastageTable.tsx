"use client";

import { format } from "date-fns";
import type { MockWastageEntry } from "@/mock/inventory";
import { EmptyState } from "@/components/common/EmptyState";
import { WastageStatusBadge } from "@/components/modules/inventory/WastageStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WastageTableProps {
  entries: MockWastageEntry[];
  onAdd?: () => void;
}

export function WastageTable({ entries, onAdd }: WastageTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No wastage entries found"
        description="Record cutting wastage returns to track leftover fabric."
        actionLabel="+ Record Wastage Return"
        onAction={onAdd}
      />
    );
  }

  return (
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
              Fabric Type
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Wastage Qty
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Returned By
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-semibold text-slate-900">
                {entry.entryNumber}
              </TableCell>
              <TableCell>{format(new Date(entry.date), "dd MMM")}</TableCell>
              <TableCell>{entry.poNumber}</TableCell>
              <TableCell>{entry.designCode}</TableCell>
              <TableCell>{entry.fabricType}</TableCell>
              <TableCell className="font-semibold text-slate-900">
                {entry.wastageQty.toLocaleString("en-IN")} kg
              </TableCell>
              <TableCell>{entry.returnedBy}</TableCell>
              <TableCell>
                <WastageStatusBadge status={entry.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
