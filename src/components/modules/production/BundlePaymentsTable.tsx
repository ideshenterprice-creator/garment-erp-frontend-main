"use client";

import type { BundlePaymentRow } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface BundlePaymentsTableProps {
  payments: BundlePaymentRow[];
  totalPayment: number;
}

export function BundlePaymentsTable({
  payments,
  totalPayment,
}: BundlePaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No karigar payments linked to this bundle yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Karigar</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Pieces</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment, index) => (
            <TableRow key={`${payment.operation}-${index}`}>
              <TableCell>{payment.karigar.name}</TableCell>
              <TableCell>{payment.operation}</TableCell>
              <TableCell>{String(payment.stage)}</TableCell>
              <TableCell>
                {Number(payment.piecesCompleted).toLocaleString("en-IN")}
              </TableCell>
              <TableCell>
                ₹{Number(payment.ratePerPiece).toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(Number(payment.amountDue))}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                    payment.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {payment.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-slate-50">
            <TableCell colSpan={5} className="font-bold">
              Total Payment
            </TableCell>
            <TableCell className="font-bold" colSpan={2}>
              {formatCurrency(totalPayment)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
