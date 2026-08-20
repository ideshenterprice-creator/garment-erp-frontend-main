"use client";

import { Check, Eye, Undo2 } from "lucide-react";
import { format } from "date-fns";
import type { MockPurchaseBill } from "@/mock/purchase";
import { EmptyState } from "@/components/common/EmptyState";
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
  bills: MockPurchaseBill[];
  onView: (bill: MockPurchaseBill) => void;
  onConfirm: (bill: MockPurchaseBill) => void;
  onReturn: (bill: MockPurchaseBill) => void;
  onAdd?: () => void;
}

const fabricBadgeClass: Record<MockPurchaseBill["fabricBadge"], string> = {
  cotton: "bg-emerald-100 text-emerald-700",
  fleece: "bg-amber-100 text-amber-800",
  rib: "bg-sky-100 text-sky-700",
};

export function BillsTable({
  bills,
  onView,
  onConfirm,
  onReturn,
  onAdd,
}: BillsTableProps) {
  if (bills.length === 0) {
    return (
      <EmptyState
        title="No purchase bills found"
        description="Try changing filters or create a new purchase bill."
        actionLabel="+ New Purchase Bill"
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
              <TableRow key={bill.id}>
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
                      fabricBadgeClass[bill.fabricBadge]
                    )}
                  >
                    {bill.fabricLabel}
                  </span>
                </TableCell>
                <TableCell>
                  {bill.netWeight.toLocaleString("en-IN")}
                </TableCell>
                <TableCell>₹{bill.ratePerKg.toLocaleString("en-IN")}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(bill.totalAmount)}
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
                      onClick={() => onView(bill)}
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
                        onClick={() => onConfirm(bill)}
                        aria-label="Confirm bill"
                      >
                        <Check className="size-4" />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8",
                        bill.status === "CONFIRMED"
                          ? "text-slate-500 hover:text-red-600"
                          : "text-slate-300"
                      )}
                      disabled={bill.status !== "CONFIRMED"}
                      onClick={() => onReturn(bill)}
                      aria-label="Return bill"
                    >
                      <Undo2 className="size-4" />
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
