"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { POStatCards } from "@/components/modules/purchase-orders/POStatCards";
import { POTable } from "@/components/modules/purchase-orders/POTable";
import { CancelPODialog } from "@/components/modules/purchase-orders/CancelPODialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";
import {
  cancelPurchaseOrder,
  getPurchaseOrders,
} from "@/services/purchaseOrders.service";

type POFilter = "ALL" | PurchaseOrderStatus;

const PAGE_SIZE = 10;

const filterTabs: { label: string; value: POFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "In Production", value: "IN_PRODUCTION" },
  { label: "Ready to Ship", value: "READY_TO_SHIP" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<POFilter>("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PurchaseOrder | null>(null);

  const filters = {
    status: filter === "ALL" ? undefined : filter,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, filters],
    queryFn: () => getPurchaseOrders(filters),
  });

  const summaryQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, "summary", { limit: 1 }],
    queryFn: () => getPurchaseOrders({ limit: 1 }),
  });

  const orders = data?.data.data ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = summaryQuery.data?.data.summary;
  const filtersActive = filter !== "ALL" || Boolean(debouncedSearch);

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelPurchaseOrder(id, reason),
    onSuccess: () => {
      toast.success("Purchase order cancelled.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setCancelOpen(false);
      setCancelTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to cancel PO."));
    },
  });

  function clearFilters() {
    setFilter("ALL");
    setSearch("");
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Every fabric purchase, production activity and shipment is traced back to a PO."
        actionButton={
          <PageHeaderAction
            label="+ New PO"
            icon={<Plus className="size-4" />}
            onClick={() => router.push(ROUTES.PURCHASE_ORDERS.NEW)}
          />
        }
      />

      <POStatCards
        totalActive={summary?.totalActive ?? 0}
        totalInProduction={summary?.totalInProduction ?? 0}
        totalReadyToShip={summary?.totalReadyToShip ?? 0}
        totalCompleted={summary?.totalCompleted ?? 0}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                "whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search PO number..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load purchase orders
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <POTable
            orders={orders}
            onRowClick={(order) =>
              router.push(ROUTES.PURCHASE_ORDERS.DETAIL(order.id))
            }
            onView={(order) =>
              router.push(ROUTES.PURCHASE_ORDERS.DETAIL(order.id))
            }
            onCancel={(order) => {
              setCancelTarget(order);
              setCancelOpen(true);
            }}
            onAdd={() => router.push(ROUTES.PURCHASE_ORDERS.NEW)}
            emptyTitle={
              filtersActive
                ? "No purchase orders match your filters"
                : "No purchase orders yet"
            }
            emptyDescription={
              filtersActive
                ? "Try clearing filters or adjusting your search."
                : "Create your first purchase order to get started."
            }
            emptyActionLabel="+ New PO"
            emptyActionIsClear={filtersActive}
            onEmptyAction={
              filtersActive
                ? clearFilters
                : () => router.push(ROUTES.PURCHASE_ORDERS.NEW)
            }
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="orders"
          />
        </>
      )}

      <CancelPODialog
        open={cancelOpen}
        poNumber={cancelTarget?.poNumber}
        isPending={cancelMutation.isPending}
        onClose={() => {
          if (!cancelMutation.isPending) {
            setCancelOpen(false);
            setCancelTarget(null);
          }
        }}
        onConfirm={(reason) => {
          if (!cancelTarget) return;
          cancelMutation.mutate({ id: cancelTarget.id, reason });
        }}
      />
    </div>
  );
}
