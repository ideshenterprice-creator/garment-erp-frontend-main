"use client";

import { Suspense } from "react";
import { NewBillForm } from "@/components/modules/purchase/NewBillForm";
import { TableSkeleton } from "@/components/common/LoadingSpinner";

export default function NewPurchaseBillPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NewBillForm />
    </Suspense>
  );
}
