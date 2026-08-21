"use client";

import { Info } from "lucide-react";
import { format } from "date-fns";
import type { MockStatementTxn } from "@/mock/accounts";
import { BalanceDisplay } from "@/components/modules/accounts/BalanceDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface RowWithBalance extends MockStatementTxn {
  balance: number;
}

interface AccountStatementTableProps {
  rows: RowWithBalance[];
  partyName: string;
  closingBalance: number;
}

export function AccountStatementTable({
  rows,
  partyName,
  closingBalance,
}: AccountStatementTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            <span className="size-1.5 rounded-full bg-red-500" />
            Outstanding
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {partyName}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ref No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Debit ₹
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Credit ₹
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Balance ₹
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {format(new Date(row.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.refNo}</TableCell>
                <TableCell>
                  {row.debit > 0
                    ? formatCurrency(row.debit).replace("₹", "").trim()
                    : "—"}
                </TableCell>
                <TableCell>
                  {row.credit > 0
                    ? formatCurrency(row.credit).replace("₹", "").trim()
                    : "—"}
                </TableCell>
                <TableCell>
                  <BalanceDisplay amount={row.balance} bold />
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableCell colSpan={5} className="text-right font-bold">
                Closing Balance:
              </TableCell>
              <TableCell>
                <BalanceDisplay amount={closingBalance} bold />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs text-red-600">
        <Info className="size-3.5" />
        {closingBalance >= 0
          ? "Amount receivable from party"
          : "Amount payable to party"}
      </div>
    </div>
  );
}
