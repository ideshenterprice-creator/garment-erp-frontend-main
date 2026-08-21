import { AlertTriangle } from "lucide-react";

export function KarigarPaymentNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
      <p className="text-sm text-amber-900">
        <span className="font-semibold">Payment Notification:</span> Payment
        amounts are system-calculated based on pieces completed × locked
        operation rates. You can only approve or record payment — not change the
        amount.
      </p>
    </div>
  );
}
