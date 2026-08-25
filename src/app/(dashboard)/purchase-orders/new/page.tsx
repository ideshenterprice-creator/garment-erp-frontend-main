"use client";

import { Suspense } from "react";
import { NewPOForm } from "@/components/modules/purchase-orders/NewPOForm";
import { TableSkeleton } from "@/components/common/LoadingSpinner";

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <NewPOForm />
    </Suspense>
  );
}
