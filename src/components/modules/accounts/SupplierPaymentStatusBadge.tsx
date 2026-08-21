import type { SupplierPaymentStatus } from "@/mock/accounts";
import { cn } from "@/lib/utils";

const statusClass: Record<SupplierPaymentStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-800",
  UNPAID: "bg-red-50 text-red-700",
};

interface SupplierPaymentStatusBadgeProps {
  status: SupplierPaymentStatus;
}

export function SupplierPaymentStatusBadge({
  status,
}: SupplierPaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusClass[status]
      )}
    >
      {status}
    </span>
  );
}
