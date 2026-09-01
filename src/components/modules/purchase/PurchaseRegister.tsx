"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import {
  RegisterFilterBar,
  type RegisterFilters,
} from "@/components/modules/purchase/RegisterFilterBar";
import { RegisterSummary } from "@/components/modules/purchase/RegisterSummary";
import { RegisterTable } from "@/components/modules/purchase/RegisterTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getParties, getProducts } from "@/services/masters.service";
import { getPurchaseRegister, exportPurchaseRegister } from "@/services/purchase.service";
import { getErrorMessage } from "@/lib/errorHandler";

function defaultRegisterFilters(): RegisterFilters {
  const today = new Date();
  return {
    from: format(startOfMonth(today), "yyyy-MM-dd"),
    to: format(today, "yyyy-MM-dd"),
    supplierId: "ALL",
    fabricType: "ALL",
  };
}

export function PurchaseRegister() {
  const initial = useMemo(() => defaultRegisterFilters(), []);
  const [draftFilters, setDraftFilters] = useState<RegisterFilters>(initial);
  const [appliedFilters, setAppliedFilters] =
    useState<RegisterFilters>(initial);

  const suppliersQuery = useQuery({
    queryKey: [...QUERY_KEYS.PARTIES, { type: "SUPPLIER", limit: 100 }],
    queryFn: () => getParties({ type: "SUPPLIER", limit: 100 }),
  });

  const productsQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PRODUCTS,
      { category: "RAW_MATERIAL", limit: 100 },
    ],
    queryFn: () => getProducts({ category: "RAW_MATERIAL", limit: 100 }),
  });

  const registerParams = {
    from: appliedFilters.from,
    to: appliedFilters.to,
    supplierId:
      appliedFilters.supplierId === "ALL"
        ? undefined
        : appliedFilters.supplierId,
    fabricType:
      appliedFilters.fabricType === "ALL"
        ? undefined
        : appliedFilters.fabricType,
  };

  const registerQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_BILLS, "register", registerParams],
    queryFn: () => getPurchaseRegister(registerParams),
    enabled: Boolean(appliedFilters.from && appliedFilters.to),
  });

  const registerData = registerQuery.data?.data;
  const bills = registerData?.bills ?? [];
  const summary = registerData?.summary;
  const totals = registerData?.totals ?? {
    totalQty: 0,
    totalAmount: 0,
    totalGST: 0,
    totalNetTotal: 0,
  };

  return (
    <div>
      <PageHeader
        title="Purchase Register"
        subtitle="Period-wise purchase report across suppliers and fabric types."
        actionButton={
          <PageHeaderAction
            label="Export"
            icon={<Download className="size-4" />}
            onClick={() => {
              void exportPurchaseRegister(registerParams)
                .then(() => toast.success("Purchase register exported."))
                .catch((error) =>
                  toast.error(getErrorMessage(error, "Export failed."))
                );
            }}
          />
        }
      />

      <RegisterFilterBar
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={() => setAppliedFilters(draftFilters)}
        suppliers={suppliersQuery.data?.data.data ?? []}
        products={productsQuery.data?.data.data ?? []}
        suppliersLoading={suppliersQuery.isLoading}
        productsLoading={productsQuery.isLoading}
      />

      <RegisterSummary
        totalPurchases={summary?.totalPurchases ?? 0}
        totalFabricKg={summary?.totalFabricReceived ?? 0}
        pendingPayments={summary?.pendingPayments ?? 0}
      />

      {registerQuery.isLoading ? (
        <TableSkeleton />
      ) : registerQuery.isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load purchase register
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void registerQuery.refetch()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <RegisterTable bills={bills} totals={totals} />
      )}
    </div>
  );
}
