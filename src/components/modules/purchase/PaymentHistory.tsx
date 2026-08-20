import { Wallet } from "lucide-react";
import type { MockPurchaseBill } from "@/mock/purchase";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Building2 } from "lucide-react";

interface PaymentHistoryProps {
  bill: MockPurchaseBill;
}

export function PaymentStatusCard({ bill }: { bill: MockPurchaseBill }) {
  const outstanding = Math.max(0, bill.totalAmount - bill.amountPaid);
  const isPaid = outstanding === 0 && bill.amountPaid > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Payment Status</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isPaid
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPaid ? "PAID" : "PENDING"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Amount Due
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(bill.totalAmount)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">
            Amount Paid
          </p>
          <p className="mt-1 font-semibold text-emerald-800">
            {formatCurrency(bill.amountPaid)}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Outstanding
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatCurrency(outstanding)}
        </p>
      </div>
    </div>
  );
}

export function PaymentHistory({ bill }: PaymentHistoryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="size-4 text-slate-500" />
        <h2 className="font-semibold text-slate-900">Payment History</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No payments recorded
                </TableCell>
              </TableRow>
            ) : (
              bill.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="size-3.5 text-slate-400" />
                      {payment.method}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-amber-800">
                      {payment.reference}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(payment.amount)}
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
