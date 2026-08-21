"use client";

import { format } from "date-fns";
import type { MockSupplierPayment } from "@/mock/accounts";
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
  payments: MockSupplierPayment[];
  onPay: (payment: MockSupplierPayment) => void;
  onRowClick?: (payment: MockSupplierPayment) => void;
}

export function SupplierPaymentsTable({
  payments,
  onPay,
  onRowClick,
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
              <TableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(row)}
              >
                <TableCell className="font-semibold">{row.billNo}</TableCell>
                <TableCell>{row.supplierName}</TableCell>
                <TableCell>
                  {format(new Date(row.billDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{formatCurrency(row.billAmount)}</TableCell>
                <TableCell>{formatCurrency(row.amountPaid)}</TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    row.balanceDue > 0 ? "text-red-600" : "text-slate-500"
                  )}
                >
                  {formatCurrency(row.balanceDue)}
                </TableCell>
                <TableCell>
                  <SupplierPaymentStatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  {row.status === "UNPAID" ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-teal-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPay(row);
                      }}
                    >
                      Pay Now
                    </Button>
                  ) : null}
                  {row.status === "PARTIAL" ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-teal-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPay(row);
                      }}
                    >
                      Pay Remaining
                    </Button>
                  ) : null}
                  {row.status === "PAID" ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
