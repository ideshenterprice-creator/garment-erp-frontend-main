"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { mockPurchaseBills } from "@/mock/purchase";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  RegisterFilterBar,
  type RegisterFilters,
} from "@/components/modules/purchase/RegisterFilterBar";
import { RegisterSummary } from "@/components/modules/purchase/RegisterSummary";
import { RegisterTable } from "@/components/modules/purchase/RegisterTable";
import { Button } from "@/components/ui/button";

const defaultFilters: RegisterFilters = {
  fromDate: "2024-01-01",
  toDate: "2024-12-31",
  supplierId: "ALL",
  fabricId: "ALL",
};

export function PurchaseRegister() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RegisterFilters>(defaultFilters);
  const [applied, setApplied] = useState<RegisterFilters>(defaultFilters);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return mockPurchaseBills.filter((bill) => {
      const date = new Date(bill.purchaseDate).getTime();
      const from = new Date(applied.fromDate).getTime();
      const to = new Date(applied.toDate).getTime();
      if (date < from || date > to) return false;
      if (applied.supplierId !== "ALL" && bill.supplierId !== applied.supplierId) {
        return false;
      }
      if (applied.fabricId !== "ALL" && bill.productId !== applied.fabricId) {
        return false;
      }
      return true;
    });
  }, [applied]);

  const summary = useMemo(() => {
    const totalPurchases = filtered.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalFabricKg = filtered.reduce((sum, bill) => sum + bill.netWeight, 0);
    const pendingPayments = filtered.reduce(
      (sum, bill) => sum + Math.max(0, bill.totalAmount - bill.amountPaid),
      0
    );
    return { totalPurchases, totalFabricKg, pendingPayments };
  }, [filtered]);

  return (
    <div>
      <PageHeader
        title="Purchase Register"
        subtitle="Period-wise purchase report across suppliers and fabric types."
      />

      <RegisterFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => setApplied(filters)}
      />

      <RegisterSummary
        totalPurchases={summary.totalPurchases}
        totalFabricKg={summary.totalFabricKg}
        pendingPayments={summary.pendingPayments}
      />

      {loading ? <TableSkeleton /> : <RegisterTable bills={filtered} />}

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => toast.message("Export feature coming soon")}
        >
          <Download className="size-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
