"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { KarigarProfile } from "@/types";
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

interface KarigarTableProps {
  karigars: KarigarProfile[];
  onRowClick: (karigar: KarigarProfile) => void;
  onEdit: (karigar: KarigarProfile) => void;
  onDelete: (karigar: KarigarProfile) => void;
  onAdd?: () => void;
}

function paymentLabel(type: KarigarProfile["paymentType"]) {
  if (type === "PIECE_RATE") return "Piece Rate";
  if (type === "WEEKLY_SALARY") return "Weekly Salary";
  return "Both";
}

function paymentVariant(type: KarigarProfile["paymentType"]) {
  if (type === "PIECE_RATE") return "piece_rate" as const;
  if (type === "WEEKLY_SALARY") return "weekly_salary" as const;
  return "both" as const;
}

export function KarigarTable({
  karigars,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
}: KarigarTableProps) {
  if (karigars.length === 0) {
    return (
      <EmptyState
        title="No karigar profiles found"
        description="Create karigar profiles linked to party master."
        actionLabel="Add Karigar"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned Operations
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Weekly Salary
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
            {karigars.map((karigar) => (
              <TableRow
                key={karigar.id}
                className="cursor-pointer"
                onClick={() => onRowClick(karigar)}
              >
                <TableCell className="font-medium text-slate-900">
                  {karigar.party.name}
                </TableCell>
                <TableCell>{karigar.party.contact}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={paymentLabel(karigar.paymentType)}
                    variant={paymentVariant(karigar.paymentType)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {karigar.operations.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      karigar.operations.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {item.operation.name}
                        </span>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {karigar.paymentType === "PIECE_RATE"
                    ? "—"
                    : `₹${karigar.weeklySalary.toLocaleString("en-IN")}`}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={karigar.isActive ? "ACTIVE" : "INACTIVE"}
                    variant={karigar.isActive ? "active" : "inactive"}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(karigar);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(karigar);
                      }}
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
