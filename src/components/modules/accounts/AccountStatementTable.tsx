"use client";

import { Download, Info } from "lucide-react";
import { format } from "date-fns";
import type { AccountStatementTransaction } from "@/types";
import { BalanceDisplay } from "@/components/modules/accounts/BalanceDisplay";
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

interface AccountStatementTableProps {
  rows: AccountStatementTransaction[];
  partyName: string;
  closingBalance: number;
  balanceType: "RECEIVABLE" | "PAYABLE";
  onExport?: () => void;
  exporting?: boolean;
}

export function AccountStatementTable({
  rows,
  partyName,
  closingBalance,
  balanceType,
  onExport,
  exporting,
}: AccountStatementTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {partyName}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={exporting}
            onClick={() => onExport?.()}
          >
            <Download className="size-4" />
            Export
          </Button>
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
            {rows.map((row, index) => (
              <TableRow key={`${row.referenceId}-${index}`}>
                <TableCell>
                  {format(new Date(row.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.refNumber || "—"}</TableCell>
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
              <TableCell colSpan={5} className="text-right text-base font-bold">
                Closing Balance:
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-base font-bold",
                    balanceType === "RECEIVABLE"
                      ? "text-red-600"
                      : "text-emerald-600"
                  )}
                >
                  {formatCurrency(Math.abs(closingBalance))}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs",
          balanceType === "RECEIVABLE" ? "text-red-600" : "text-emerald-600"
        )}
      >
        <Info className="size-3.5" />
        {balanceType === "RECEIVABLE"
          ? "Amount receivable"
          : "Amount payable"}
      </div>
    </div>
  );
}
