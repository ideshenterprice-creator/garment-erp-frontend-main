"use client";

import { format } from "date-fns";
import type { KarigarPayment } from "@/types";
import { DrawerForm } from "@/components/common/DrawerForm";
import { Button } from "@/components/ui/button";
import { ACCOUNT_PAYMENT_MODES } from "@/lib/accounts";
import { formatCurrency } from "@/lib/utils";

interface ViewReceiptDrawerProps {
  open: boolean;
  payment: KarigarPayment | null;
  onClose: () => void;
}

function modeLabel(mode: string | null): string {
  if (!mode) return "—";
  return (
    ACCOUNT_PAYMENT_MODES.find((item) => item.value === mode)?.label ?? mode
  );
}

export function ViewReceiptDrawer({
  open,
  payment,
  onClose,
}: ViewReceiptDrawerProps) {
  return (
    <DrawerForm
      open={open}
      onClose={onClose}
      title="Payment Receipt"
      description={payment?.paymentNumber}
      footer={
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      }
    >
      {payment ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Karigar
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.karigar.name}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Operation
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.operation?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  PO
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.po?.poNumber ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Pieces
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.piecesCompleted}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Rate / Piece
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatCurrency(Number(payment.ratePerPiece))}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Amount Paid
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(Number(payment.amountDue))}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Payment Date
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.paidAt
                    ? format(new Date(payment.paidAt), "dd MMM yyyy")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Mode
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {modeLabel(payment.paymentMode)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reference
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {payment.referenceNo || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </DrawerForm>
  );
}
