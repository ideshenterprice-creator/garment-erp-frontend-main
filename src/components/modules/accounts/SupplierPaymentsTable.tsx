"use client";

import { Eye } from "lucide-react";
import { format } from "date-fns";
import type { SupplierBillPaymentRow } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { SupplierPaymentStatusBadge } from "@/components/modules/accounts/SupplierPaymentStatusBadge";
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

interface SupplierPaymentsTableProps {
  payments: SupplierBillPaymentRow[];
  onPay: (payment: SupplierBillPaymentRow) => void;
  onView: (payment: SupplierBillPaymentRow) => void;
}

export function SupplierPaymentsTable({
  payments,
  onPay,
  onView,
}: SupplierPaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No supplier payments found"
        description="Confirmed purchase bills will appear here for payment."
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
                Bill No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supplier
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bill Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bill Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount Paid
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Balance Due
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
            {payments.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">{row.billNumber}</TableCell>
                <TableCell>{row.supplier?.name ?? "—"}</TableCell>
                <TableCell>
                  {format(new Date(row.purchaseDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(row.totalAmount))}
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(row.totalPaid))}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    row.outstanding > 0 ? "text-red-600" : "text-slate-500"
                  )}
                >
                  {formatCurrency(Number(row.outstanding))}
                </TableCell>
                <TableCell>
                  <SupplierPaymentStatusBadge status={row.paymentStatus} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.paymentStatus === "UNPAID" ? (
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                        onClick={() => onPay(row)}
                      >
                        Pay Now
                      </Button>
                    ) : null}
                    {row.paymentStatus === "PARTIAL" ? (
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                        onClick={() => onPay(row)}
                      >
                        Pay Remaining
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(row)}
                      aria-label="View bill payments"
                    >
                      <Eye className="size-4" />
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
