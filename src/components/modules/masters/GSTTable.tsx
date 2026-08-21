"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { MockGSTRate } from "@/mock/masters";
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

interface GSTTableProps {
  rates: MockGSTRate[];
  onEdit: (rate: MockGSTRate) => void;
  onDelete: (rate: MockGSTRate) => void;
  onAdd?: () => void;
}

function taxLabel(type: MockGSTRate["taxType"]) {
  if (type === "ZERO_RATED") return "Zero Rated";
  if (type === "IGST") return "IGST";
  return "CGST + SGST";
}

function taxVariant(type: MockGSTRate["taxType"]) {
  if (type === "ZERO_RATED") return "zero_rated" as const;
  if (type === "IGST") return "igst" as const;
  return "cgst_sgst" as const;
}

export function GSTTable({ rates, onEdit, onDelete, onAdd }: GSTTableProps) {
  if (rates.length === 0) {
    return (
      <EmptyState
        title="No GST rates found"
        description="Add tax categories for purchase and sales."
        actionLabel="Add GST Rate"
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
                Category
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Rate
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tax Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applicable On
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-semibold text-slate-900">
                  {rate.category}
                </TableCell>
                <TableCell>{rate.gstPercent}%</TableCell>
                <TableCell>
                  <StatusBadge
                    label={taxLabel(rate.taxType)}
                    variant={taxVariant(rate.taxType)}
                  />
                </TableCell>
                <TableCell className="text-slate-600">{rate.applicableOn}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(rate)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50"
                      onClick={() => onDelete(rate)}
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
