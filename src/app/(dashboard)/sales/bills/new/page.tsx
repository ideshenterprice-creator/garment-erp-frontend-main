"use client";

import { Suspense } from "react";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { NewSalesBillForm } from "@/components/modules/sales/NewSalesBillForm";

export default function NewSalesBillPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <NewSalesBillForm />
    </Suspense>
  );
}
