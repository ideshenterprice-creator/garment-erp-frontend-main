"use client";

import { format } from "date-fns";
import type { MockVoucher } from "@/mock/accounts";
import { EmptyState } from "@/components/common/EmptyState";
import { VoucherTypeBadge } from "@/components/modules/accounts/VoucherTypeBadge";
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

interface VouchersTableProps {
  vouchers: MockVoucher[];
  onAdd?: () => void;
  onView?: (voucher: MockVoucher) => void;
}

export function VouchersTable({ vouchers, onAdd, onView }: VouchersTableProps) {
  if (vouchers.length === 0) {
    return (
      <EmptyState
        title="No vouchers found"
        description="Create a voucher for expenses, advances, or bank transfers."
        actionLabel="+ New Voucher"
        onAction={onAdd}
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
                Voucher No
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Party / Description
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mode
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reference
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell className="font-semibold">
                  {voucher.voucherNumber}
                </TableCell>
                <TableCell>
                  {format(new Date(voucher.date), "dd MMM")}
                </TableCell>
                <TableCell>
                  <VoucherTypeBadge type={voucher.type} />
                </TableCell>
                <TableCell>{voucher.partyDescription}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(voucher.amount)}
                </TableCell>
                <TableCell>{voucher.paymentMode}</TableCell>
                <TableCell>{voucher.referenceNo || "—"}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 font-semibold"
                    onClick={() => onView?.(voucher)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
