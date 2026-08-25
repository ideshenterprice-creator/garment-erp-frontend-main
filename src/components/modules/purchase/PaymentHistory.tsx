import { Building2, Wallet } from "lucide-react";
import { format } from "date-fns";
import type { PurchaseBill } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export function PaymentStatusCard({ bill }: { bill: PurchaseBill }) {
  const totalPaid = Number(bill.totalPaid ?? 0);
  const outstanding = Number(
    bill.outstanding ?? Math.max(0, Number(bill.totalAmount) - totalPaid)
  );
  const isFullyPaid = outstanding === 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Payment Status</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isFullyPaid
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isFullyPaid ? "PAID" : "PENDING"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Amount Due
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(Number(bill.totalAmount))}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">
            Amount Paid
          </p>
          <p className="mt-1 font-semibold text-emerald-800">
            {formatCurrency(totalPaid)}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Outstanding
        </p>
        <p
          className={`mt-1 text-2xl font-bold ${
            outstanding > 0 ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {outstanding > 0 ? formatCurrency(outstanding) : "Fully Paid"}
        </p>
      </div>
    </div>
  );
}

export function PaymentHistory({ bill }: { bill: PurchaseBill }) {
  const payments = bill.paymentHistory ?? [];

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
              <TableHead>Mode</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No payments recorded
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="size-3.5 text-slate-400" />
                      {payment.paymentMode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-amber-800">
                      {payment.referenceNo ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(Number(payment.amountPaid))}
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
