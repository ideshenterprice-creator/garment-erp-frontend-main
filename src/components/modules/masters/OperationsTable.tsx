"use client";

import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { MockOperation } from "@/mock/masters";
import { StatusBadge } from "@/components/common/StatusBadge";
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

interface OperationsTableProps {
  operations: MockOperation[];
  onEdit: (operation: MockOperation) => void;
  onDelete: (operation: MockOperation) => void;
  onAdd?: () => void;
}

function stageVariant(stage: MockOperation["stage"]) {
  switch (stage) {
    case "CUTTING":
      return "cutting" as const;
    case "PRINTING":
      return "printing" as const;
    case "COLORING":
      return "coloring" as const;
    case "STITCHING":
      return "stitching" as const;
    case "FINISHING":
      return "finishing" as const;
  }
}

function stageLabel(stage: MockOperation["stage"]) {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

export function OperationsTable({
  operations,
  onEdit,
  onDelete,
  onAdd,
}: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <EmptyState
        title="No operations found"
        description="Add production operations and piece rates."
        actionLabel="Add Operation"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-900">Live Rate Matrix</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
          Last Update: 2h ago
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Operation Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Production Stage
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rate (₹ / Pc)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last Updated
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell className="font-semibold text-slate-900">
                  {operation.name}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={stageLabel(operation.stage)}
                    variant={stageVariant(operation.stage)}
                  />
                </TableCell>
                <TableCell>₹ {operation.ratePerPiece.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(operation.lastUpdated), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(operation)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50"
                      onClick={() => onDelete(operation)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
