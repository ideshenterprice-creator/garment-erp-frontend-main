"use client";

import { Check, Eye, Undo2 } from "lucide-react";
import { format } from "date-fns";
import type { PurchaseBill } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteRowButton } from "@/components/common/DeleteRowButton";
import { BillStatusBadge } from "@/components/modules/purchase/BillStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface BillsTableProps {
  bills: PurchaseBill[];
  onRowClick: (bill: PurchaseBill) => void;
  onView: (bill: PurchaseBill) => void;
  onConfirm: (bill: PurchaseBill) => void;
  onReturn: (bill: PurchaseBill) => void;
  onDelete?: (bill: PurchaseBill) => void;
  onAdd?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionIsClear?: boolean;
}

export function BillsTable({
  bills,
  onRowClick,
  onView,
  onConfirm,
  onReturn,
  onDelete,
  onAdd,
  emptyTitle = "No purchase bills found",
  emptyDescription = "Try changing filters or create a new purchase bill.",
  emptyActionLabel = "New Purchase Bill",
  onEmptyAction,
  emptyActionIsClear = false,
}: BillsTableProps) {
  if (bills.length === 0) {
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bill No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supplier
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fabric Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Qty (kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rate (₹/kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Amount
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
            {bills.map((bill) => (
              <TableRow
                key={bill.id}
                className="cursor-pointer"
                onClick={() => onRowClick(bill)}
              >
                <TableCell className="font-semibold text-slate-900">
                  {bill.billNumber}
                </TableCell>
                <TableCell>{bill.supplier.name}</TableCell>
                <TableCell>
                  {format(new Date(bill.purchaseDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      bill.product.category === "RAW_MATERIAL"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {bill.product.name}
                  </span>
                </TableCell>
                <TableCell>
                  {Number(bill.netWeight).toLocaleString("en-IN")} kg
                </TableCell>
                <TableCell>
                  ₹{Number(bill.ratePerKg).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(Number(bill.totalAmount))}
                </TableCell>
                <TableCell>
                  <BillStatusBadge status={bill.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-500"
                      onClick={(event) => {
                        event.stopPropagation();
                        onView(bill);
                      }}
                      aria-label="View bill"
                    >
                      <Eye className="size-4" />
                    </Button>
                    {bill.status === "PENDING" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-emerald-600 hover:text-emerald-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          onConfirm(bill);
                        }}
                        aria-label="Confirm bill"
                      >
                        <Check className="size-4" />
                      </Button>
                    ) : null}
                    {bill.status === "CONFIRMED" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-slate-500 hover:text-red-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          onReturn(bill);
                        }}
                        aria-label="Return bill"
                      >
                        <Undo2 className="size-4" />
                      </Button>
                    ) : null}
                    <DeleteRowButton
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.(bill);
                      }}
                    />
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
