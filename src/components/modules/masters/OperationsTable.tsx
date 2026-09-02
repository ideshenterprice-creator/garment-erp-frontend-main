"use client";

import { Ban, Pencil, Trash2 } from "lucide-react";
import type { Operation } from "@/types";
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
  operations: Operation[];
  onEdit: (operation: Operation) => void;
  onToggleStatus: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onAdd?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionIsClear?: boolean;
}

function stageVariant(stage: Operation["stage"]) {
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

function stageLabel(stage: Operation["stage"]) {
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

export function OperationsTable({
  operations,
  onEdit,
  onToggleStatus,
  onDelete,
  onAdd,
  emptyTitle = "No operations found",
  emptyDescription = "Add production operations and piece rates.",
  emptyActionLabel = "Add Operation",
  onEmptyAction,
  emptyActionIsClear = false,
}: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionIsClear ? undefined : emptyActionLabel}
        onAction={emptyActionIsClear ? undefined : onEmptyAction ?? onAdd}
        actionButton={
          emptyActionIsClear && onEmptyAction ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={onEmptyAction}
            >
              Clear Filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-900">Live Rate Matrix</h3>
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
                Status
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
                <TableCell>
                  ₹ {Number(operation.ratePerPiece).toFixed(2)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={operation.isActive ? "ACTIVE" : "INACTIVE"}
                    variant={operation.isActive ? "active" : "inactive"}
                  />
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
                      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title={operation.isActive ? "Deactivate" : "Activate"}
                      onClick={() => onToggleStatus(operation)}
                    >
                      <Ban className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete permanently"
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
