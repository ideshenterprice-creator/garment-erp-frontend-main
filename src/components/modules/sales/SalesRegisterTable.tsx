"use client";

import { format } from "date-fns";
import type { MockSalesRegisterRow } from "@/mock/sales";
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
  rows: MockSalesRegisterRow[];
  totalsFrom?: MockSalesRegisterRow[];
}

export function SalesRegisterTable({
  rows,
  totalsFrom,
}: SalesRegisterTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No register entries"
        description="Adjust filters to view sales register data."
      />
    );
  }

  const totalsSource = totalsFrom ?? rows;
  const totals = totalsSource.reduce(
    (acc, row) => ({
      pieces: acc.pieces + row.totalPieces,
      net: acc.net + row.netAmount,
      received: acc.received + row.amountReceived,
      outstanding: acc.outstanding + row.outstanding,
    }),
    { pieces: 0, net: 0, received: 0, outstanding: 0 }
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
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">
                  {row.invoiceNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(row.invoiceDate), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell>{row.poNumber}</TableCell>
                <TableCell>{row.totalPieces.toLocaleString("en-IN")}</TableCell>
                <TableCell>{formatCurrency(row.netAmount)}</TableCell>
                <TableCell>{formatCurrency(row.amountReceived)}</TableCell>
                <TableCell>{formatCurrency(row.outstanding)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                      row.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    )}
                  >
                    {row.paymentStatus}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-50 font-bold hover:bg-slate-50">
              <TableCell colSpan={4}>Totals</TableCell>
              <TableCell>{totals.pieces.toLocaleString("en-IN")}</TableCell>
              <TableCell>{formatCurrency(totals.net)}</TableCell>
              <TableCell>{formatCurrency(totals.received)}</TableCell>
              <TableCell>{formatCurrency(totals.outstanding)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
