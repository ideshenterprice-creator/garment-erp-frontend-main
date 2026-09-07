import type { PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusClass: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  PARTIALLY_PAID: "bg-orange-50 text-orange-800",
  PAID: "bg-emerald-50 text-emerald-700",
};

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

interface KarigarPaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function KarigarPaymentStatusBadge({
  status,
}: KarigarPaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusClass[status]
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
