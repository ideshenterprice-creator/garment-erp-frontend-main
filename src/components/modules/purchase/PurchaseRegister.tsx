"use client";

import { useEffect, useMemo, useState } from "react";
import { mockPurchaseBills } from "@/mock/purchase";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  RegisterFilterBar,
  type RegisterFilters,
} from "@/components/modules/purchase/RegisterFilterBar";
import { RegisterSummary } from "@/components/modules/purchase/RegisterSummary";
import { RegisterTable } from "@/components/modules/purchase/RegisterTable";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Purchase Register"
        subtitle="Period-wise purchase report across suppliers and fabric types."
      />

      <RegisterFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      <RegisterSummary
        totalPurchases={summary.totalPurchases}
        totalFabricKg={summary.totalFabricKg}
        pendingPayments={summary.pendingPayments}
      />

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <RegisterTable bills={pageItems} totalsFrom={filtered} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="bills"
          />
        </>
      )}
    </div>
  );
}
