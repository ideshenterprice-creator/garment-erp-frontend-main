"use client";

import { format } from "date-fns";
import type { SalesRegisterBill, SalesRegisterResponse } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

interface SalesRegisterTableProps {
  bills: SalesRegisterBill[];
  totals?: SalesRegisterResponse["totals"];
}

export function SalesRegisterTable({
  bills,
  totals,
}: SalesRegisterTableProps) {
  if (bills.length === 0) {
    return (
      <EmptyState
        title="No register entries"
        description="Adjust filters to view sales register data."
      />
    );
  }

  const totalPieces =
    totals?.totalPieces ??
    bills.reduce((sum, bill) => sum + Number(bill.totalPieces ?? 0), 0);
  const totalAmount =
    totals?.totalAmount ??
    bills.reduce((sum, bill) => sum + Number(bill.netTotal ?? 0), 0);
  const totalReceived = bills.reduce(
    (sum, bill) => sum + Number(bill.amountPaid ?? 0),
    0
  );
  const totalOutstanding = bills.reduce(
    (sum, bill) => sum + Number(bill.outstanding ?? 0),
    0
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => {
              const paymentStatus =
                Number(bill.outstanding ?? 0) <= 0 ? "PAID" : "PENDING";
              return (
                <TableRow key={bill.id}>
                  <TableCell className="font-semibold">
                    {bill.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    {format(new Date(bill.invoiceDate), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{bill.buyer?.name ?? "—"}</TableCell>
                  <TableCell>{bill.po?.poNumber ?? bill.poId}</TableCell>
                  <TableCell>
                    {Number(bill.totalPieces ?? 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(bill.netTotal))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(bill.amountPaid ?? 0))}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(Number(bill.outstanding ?? 0))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                        paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      )}
                    >
                      {paymentStatus}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-slate-50 font-bold hover:bg-slate-50">
              <TableCell colSpan={4}>Totals</TableCell>
              <TableCell>{totalPieces.toLocaleString("en-IN")}</TableCell>
              <TableCell>{formatCurrency(totalAmount)}</TableCell>
              <TableCell>{formatCurrency(totalReceived)}</TableCell>
              <TableCell>{formatCurrency(totalOutstanding)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
