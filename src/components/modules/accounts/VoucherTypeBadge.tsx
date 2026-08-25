import type { VoucherType } from "@/types";
import { cn } from "@/lib/utils";

const typeClass: Record<VoucherType, string> = {
  PAYMENT: "bg-red-50 text-red-700",
  RECEIPT: "bg-lime-50 text-lime-800",
};

interface VoucherTypeBadgeProps {
  type: VoucherType;
}

export function VoucherTypeBadge({ type }: VoucherTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        typeClass[type]
      )}
    >
      {type === "PAYMENT" ? "Payment" : "Receipt"}
    </span>
  );
}
