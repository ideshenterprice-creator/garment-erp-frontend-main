"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseBill, PurchaseBillStatus } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  ConfirmDialog,
  PERMANENT_DELETE,
} from "@/components/common/ConfirmDialog";
import { BillStatCards } from "@/components/modules/purchase/BillStatCards";
import { BillsTable } from "@/components/modules/purchase/BillsTable";
import { ReturnBillDialog } from "@/components/modules/purchase/ReturnBillDialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { cn, formatCurrency } from "@/lib/utils";
import {
  confirmPurchaseBill,
  deletePurchaseBill,
  getPurchaseBills,
  returnPurchaseBill,
} from "@/services/purchase.service";

type BillFilter = "ALL" | PurchaseBillStatus;

const PAGE_SIZE = 10;

const filterTabs: { label: string; value: BillFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending Approval", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Returned", value: "RETURNED" },
];

export default function PurchaseBillsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BillFilter>("ALL");
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<PurchaseBill | null>(null);
  const [returnTarget, setReturnTarget] = useState<PurchaseBill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseBill | null>(null);

  const filters = {
    status: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_BILLS, filters],
    queryFn: () => getPurchaseBills(filters),
  });

  const summaryQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_BILLS, "summary", { limit: 1 }],
    queryFn: () => getPurchaseBills({ limit: 1 }),
  });

  const bills = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = summaryQuery.data?.data.summary;
  const filtersActive = filter !== "ALL";

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmPurchaseBill(id),
    onSuccess: () => {
      toast.success("Bill confirmed. Stock updated.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_BILLS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setConfirmTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to confirm bill."));
    },
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      returnPurchaseBill(id, reason),
    onSuccess: () => {
      toast.success("Bill returned.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_BILLS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setReturnTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to return bill."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePurchaseBill(id),
    onSuccess: () => {
      toast.success("Deleted permanently.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_BILLS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete purchase bill."));
    },
  });

  return (
    <div>
      <PageHeader
        title="Purchase Bills"
        subtitle="All fabric and material purchases. Stock updates automatically when a bill is confirmed."
        actionButton={
          <PageHeaderAction
            label="New Purchase Bill"
            icon={<Plus className="size-4" />}
            onClick={() => router.push(ROUTES.PURCHASE.NEW)}
          />
        }
      />

      <BillStatCards
        totalBillsThisMonth={summary?.totalBillsThisMonth ?? 0}
        totalFabricPurchasedKg={summary?.totalFabricPurchasedKg ?? 0}
        pendingApproval={summary?.pendingApprovalCount ?? 0}
      />

      <div className="mb-4 flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load purchase bills
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <BillsTable
            bills={bills}
            onRowClick={(bill) => router.push(ROUTES.PURCHASE.DETAIL(bill.id))}
            onView={(bill) => router.push(ROUTES.PURCHASE.DETAIL(bill.id))}
            onConfirm={setConfirmTarget}
            onReturn={setReturnTarget}
            onDelete={setDeleteTarget}
            onAdd={() => router.push(ROUTES.PURCHASE.NEW)}
            emptyTitle={
              filtersActive
                ? "No purchase bills match your filters"
                : "No purchase bills yet"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters."
                : "Create your first purchase bill to get started."
            }
            emptyActionLabel="+ New Purchase Bill"
            emptyActionIsClear={filtersActive}
            onEmptyAction={
              filtersActive
                ? () => {
                    setFilter("ALL");
                    setPage(1);
                  }
                : () => router.push(ROUTES.PURCHASE.NEW)
            }
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="bills"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onClose={() => {
          if (!confirmMutation.isPending) setConfirmTarget(null);
        }}
        title="Confirm Purchase Bill?"
        description={
          confirmTarget
            ? `Stock will be updated automatically. This cannot be undone. ${confirmTarget.billNumber} — ${Number(confirmTarget.netWeight).toLocaleString("en-IN")} kg of ${confirmTarget.product.name} (${formatCurrency(Number(confirmTarget.totalAmount))}).`
            : "Stock will be updated automatically. This cannot be undone."
        }
        confirmLabel={confirmMutation.isPending ? "Confirming..." : "Confirm"}
        variant="default"
        onConfirm={() => {
          if (!confirmTarget || confirmMutation.isPending) return;
          confirmMutation.mutate(confirmTarget.id);
        }}
      />

      <ReturnBillDialog
        open={Boolean(returnTarget)}
        billNumber={returnTarget?.billNumber}
        isPending={returnMutation.isPending}
        onClose={() => {
          if (!returnMutation.isPending) setReturnTarget(null);
        }}
        onConfirm={(reason) => {
          if (!returnTarget) return;
          returnMutation.mutate({ id: returnTarget.id, reason });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        {...PERMANENT_DELETE}
        description={`${PERMANENT_DELETE.description}${
          deleteTarget ? ` ${deleteTarget.billNumber} will be deleted.` : ""
        }`}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
