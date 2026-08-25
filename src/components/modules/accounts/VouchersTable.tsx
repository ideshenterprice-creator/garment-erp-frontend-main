"use client";

import { format } from "date-fns";
import type { Voucher } from "@/types";
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
import { ACCOUNT_PAYMENT_MODES } from "@/lib/accounts";
import { formatCurrency } from "@/lib/utils";

interface VouchersTableProps {
  vouchers: Voucher[];
  onAdd?: () => void;
  onView?: (voucher: Voucher) => void;
}

function modeLabel(mode: string): string {
  return (
    ACCOUNT_PAYMENT_MODES.find((item) => item.value === mode)?.label ?? mode
  );
}

export function VouchersTable({
  vouchers,
  onAdd,
  onView,
}: VouchersTableProps) {
  if (vouchers.length === 0) {
    return (
      <EmptyState
        title="No vouchers found"
        description="Create a voucher for expenses, advances, or bank transfers."
        actionLabel="New Voucher"
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
                  {format(new Date(voucher.date), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <VoucherTypeBadge type={voucher.type} />
                </TableCell>
                <TableCell>{voucher.partyDescription}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(Number(voucher.amount))}
                </TableCell>
                <TableCell>{modeLabel(voucher.paymentMode)}</TableCell>
                <TableCell>{voucher.referenceNo || "—"}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
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
