"use client";

import { CheckCircle2, Info } from "lucide-react";
import { format } from "date-fns";
import type { PurchaseBill } from "@/types";
import { Button } from "@/components/ui/button";

interface StockUpdateInfoProps {
  bill: PurchaseBill;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

export function StockUpdateInfo({
  bill,
  onConfirm,
  isConfirming = false,
}: StockUpdateInfoProps) {
  if (bill.status === "PENDING") {
    return (
      <div className="rounded-xl border border-sky-200 border-l-4 border-l-sky-500 bg-sky-50 p-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="font-semibold text-sky-900">Stock Pending</p>
            <p className="mt-1 text-sm text-sky-800">
              Stock will be updated when this bill is confirmed.
            </p>
            {onConfirm ? (
              <Button
                type="button"
                size="sm"
                className="mt-3 bg-[#1b3a3a] text-white hover:bg-[#1b3a3a]/90"
                disabled={isConfirming}
                onClick={onConfirm}
              >
                {isConfirming ? "Confirming..." : "Confirm Bill"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (bill.status !== "CONFIRMED") {
    return null;
  }

  const stockUpdatedAt =
    bill.stockUpdate?.stockUpdatedAt ?? bill.confirmedAt ?? null;
  const quantityAdded =
    bill.stockUpdate?.quantityAdded ?? Number(bill.netWeight);

  return (
    <div className="rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-4">
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">
            Stock Updated Successfully
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            {Number(quantityAdded).toLocaleString("en-IN")} kg of{" "}
            {bill.product.name} added to stock
            {stockUpdatedAt
              ? ` on ${format(new Date(stockUpdatedAt), "dd MMM yyyy 'at' hh:mm a")}`
              : ""}
            .
          </p>
        </div>
      </div>
    </div>
  );
}
