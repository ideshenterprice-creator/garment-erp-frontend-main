"use client";

import type { MockKarigarPayment } from "@/mock/accounts";
import { poNumberForId } from "@/mock/accounts";
import { EmptyState } from "@/components/common/EmptyState";
import { KarigarPaymentStatusBadge } from "@/components/modules/accounts/KarigarPaymentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface KarigarPaymentsTableProps {
  payments: MockKarigarPayment[];
  onRecordPayment: (payment: MockKarigarPayment) => void;
  onViewReceipt: (payment: MockKarigarPayment) => void;
}

export function KarigarPaymentsTable({
  payments,
  onRecordPayment,
  onViewReceipt,
}: KarigarPaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No karigar payments found"
        description="Adjust filters or wait for production entries to generate payments."
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
                Payment Ref
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Karigar
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PO / Operation
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pieces
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rate
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount Due
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Week
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
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-semibold text-slate-900">
                  {payment.paymentNumber}
                </TableCell>
                <TableCell>{payment.karigar.name}</TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-900">
                    {poNumberForId(payment.poId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.operation.name}
                  </p>
                </TableCell>
                <TableCell>{payment.piecesCompleted}</TableCell>
                <TableCell>
                  {formatCurrency(payment.ratePerPiece)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(payment.amountDue)}
                </TableCell>
                <TableCell>W{payment.weekNumber}</TableCell>
                <TableCell>
                  <KarigarPaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell>
                  {payment.status === "PENDING" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                      onClick={() => onRecordPayment(payment)}
                    >
                      Record Payment
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onViewReceipt(payment)}
                    >
                      View Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
