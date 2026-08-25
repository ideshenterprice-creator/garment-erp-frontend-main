"use client";

import { format } from "date-fns";
import type { CuttingWastage } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { WastageStatusBadge } from "@/components/modules/inventory/WastageStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WastageTableProps {
  entries: CuttingWastage[];
  onAdd?: () => void;
  onMarkSold?: (entry: CuttingWastage) => void;
  markingSoldId?: string | null;
}

export function WastageTable({
  entries,
  onAdd,
  onMarkSold,
  markingSoldId = null,
}: WastageTableProps) {
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
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-semibold text-slate-900">
                {entry.wastageNumber}
              </TableCell>
              <TableCell>
                {format(new Date(entry.dateOfReturn), "dd MMM yyyy")}
              </TableCell>
              <TableCell>{entry.po.poNumber}</TableCell>
              <TableCell>{entry.designCode}</TableCell>
              <TableCell>{entry.fabricType.name}</TableCell>
              <TableCell className="font-semibold text-slate-900">
                {Number(entry.wastageQty).toLocaleString("en-IN")} kg
              </TableCell>
              <TableCell>{entry.returnedBy.name}</TableCell>
              <TableCell>
                <WastageStatusBadge status={entry.status} />
              </TableCell>
              <TableCell>
                {entry.status === "IN_STOCK" && onMarkSold ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={markingSoldId === entry.id}
                    onClick={() => onMarkSold(entry)}
                  >
                    {markingSoldId === entry.id ? "Saving..." : "Mark Sold"}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
