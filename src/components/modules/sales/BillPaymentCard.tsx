"use client";

import { Banknote } from "lucide-react";
import { format } from "date-fns";
import type { MockSalesBill } from "@/mock/sales";
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

interface BillPaymentCardProps {
  bill: MockSalesBill;
  onRecordPayment?: () => void;
}

export function BillPaymentCard({
  bill,
  onRecordPayment,
}: BillPaymentCardProps) {
  const outstanding = Math.max(0, bill.netTotal - bill.amountReceived);
  const showRecord =
    (bill.status === "SUBMITTED" || bill.status === "PAID") && outstanding > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="size-4 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">
            Payment Record
          </h2>
        </div>
        {showRecord ? (
          <Button
            type="button"
            className="bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
            onClick={onRecordPayment}
          >
            Record Payment
          </Button>
        ) : null}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-sky-500 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Amount Due
          </p>
          <p className="mt-1 text-xl font-bold">
            {formatCurrency(bill.netTotal)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-emerald-500 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Received
          </p>
          <p className="mt-1 text-xl font-bold">
            {formatCurrency(bill.amountReceived)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 border-l-4 border-l-slate-400 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Outstanding
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-bold",
              outstanding > 0 ? "text-red-600" : "text-slate-900"
            )}
          >
            {formatCurrency(outstanding)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transaction Ref</TableHead>
              <TableHead>Processed By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No payments recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              bill.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                      {payment.referenceNo}
                    </span>
                  </TableCell>
                  <TableCell>{payment.processedBy}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
