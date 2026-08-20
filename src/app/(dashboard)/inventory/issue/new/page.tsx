"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { IssueMaterialForm } from "@/components/modules/inventory/IssueMaterialForm";

export default function IssueMaterialPage() {
  return (
    <div>
      <PageHeader
        title="Issue Material"
        subtitle="Issue fabric or accessories to a Karigar or production stage. Stock reduces immediately on save."
      />
      <IssueMaterialForm />
    </div>
  );
}
