"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  SalesRegisterFilterBar,
  type SalesRegisterFilters,
} from "@/components/modules/sales/SalesRegisterFilterBar";
import { SalesRegisterSummary } from "@/components/modules/sales/SalesRegisterSummary";
import { SalesRegisterTable } from "@/components/modules/sales/SalesRegisterTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { currentMonthRange, toIsoDate } from "@/lib/sales";
import { getParties } from "@/services/masters.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";
import { getSalesRegister, exportSalesRegister } from "@/services/sales.service";
import { getErrorMessage } from "@/lib/errorHandler";

const month = currentMonthRange();

const defaultFilters: SalesRegisterFilters = {
  fromDate: month.from,
  toDate: month.to,
  buyerId: "ALL",
  poId: "ALL",
};

export default function SalesRegisterPage() {
  const [draftFilters, setDraftFilters] =
    useState<SalesRegisterFilters>(defaultFilters);
  const [applied, setApplied] =
    useState<SalesRegisterFilters>(defaultFilters);

  const queryFilters = useMemo(
    () => ({
      from: applied.fromDate ? toIsoDate(applied.fromDate) : undefined,
      to: applied.toDate ? toIsoDate(applied.toDate) : undefined,
      buyerId: applied.buyerId === "ALL" ? undefined : applied.buyerId,
      poId: applied.poId === "ALL" ? undefined : applied.poId,
    }),
    [applied]
  );

  const registerQuery = useQuery({
    queryKey: [...QUERY_KEYS.SALES_BILLS, "register", queryFilters],
    queryFn: () => getSalesRegister(queryFilters),
    enabled: Boolean(applied.fromDate && applied.toDate),
  });

  const buyersQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "BUYER", limit: 100 }],
    queryFn: () => getParties({ type: "BUYER", limit: 100 }),
  });

  const posQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
  });

  const summary = registerQuery.data?.data.summary;
  const bills = registerQuery.data?.data.bills ?? [];
  const totals = registerQuery.data?.data.totals;

  return (
    <div>
      <PageHeader
        title="Sales Register"
        subtitle="Period-wise sales ledger with payment status across all export invoices."
      />

      <SalesRegisterFilterBar
        filters={draftFilters}
        buyers={buyersQuery.data?.data.data ?? []}
        purchaseOrders={posQuery.data?.data.data ?? []}
        onChange={setDraftFilters}
        onApply={() => setApplied(draftFilters)}
        onExport={() => {
          if (!applied.fromDate || !applied.toDate) {
            toast.error("Select a date range first.");
            return;
          }
          void exportSalesRegister(queryFilters)
            .then(() => toast.success("Sales register exported."))
            .catch((error) => toast.error(getErrorMessage(error, "Export failed.")));
        }}
      />

      {registerQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : registerQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load sales register.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void registerQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <SalesRegisterSummary
            totalSales={summary?.totalSales ?? 0}
            totalPieces={summary?.totalPieces ?? 0}
            outstanding={summary?.outstanding ?? 0}
          />
          <SalesRegisterTable bills={bills} totals={totals} />
        </>
      )}
    </div>
  );
}
