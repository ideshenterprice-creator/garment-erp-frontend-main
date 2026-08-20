import { Banknote, Lock, Wallet } from "lucide-react";
import { LockedRateNote } from "@/components/modules/production/LockedRateNote";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KarigarPaymentBoxProps {
  operationName: string;
  rate: number;
  pieces: number;
  amountDue: number;
  variant?: "peach" | "teal" | "gray";
  title?: string;
  piecesLabel?: string;
  lockedNote?: string;
  className?: string;
}

const variantClass = {
  peach: "border-orange-100 bg-orange-50/80",
  teal: "border-teal-100 bg-teal-50/70",
  gray: "border-slate-200 bg-slate-50",
};

export function KarigarPaymentBox({
  operationName,
  rate,
  pieces,
  amountDue,
  variant = "teal",
  title = "Payment Calculation",
  piecesLabel = "Pieces",
  lockedNote,
  className,
}: KarigarPaymentBoxProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        variantClass[variant],
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        </div>
        <Banknote className="size-4 text-slate-500" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Operation</span>
          <span className="font-medium text-slate-900">{operationName}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Rate</span>
          <span className="inline-flex items-center gap-1 text-slate-700">
            ₹{rate.toFixed(2)}/pc
            <Lock className="size-3 text-slate-400" />
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">{piecesLabel}</span>
          <span className="font-semibold text-slate-900">
            {pieces.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="border-t border-slate-200/80 pt-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-900">Payment Due</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(amountDue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <LockedRateNote note={lockedNote} />
      </div>
    </div>
  );
}
