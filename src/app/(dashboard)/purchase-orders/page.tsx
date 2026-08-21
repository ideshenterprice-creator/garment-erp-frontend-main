"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types";
import { mockPurchaseOrders } from "@/mock/purchaseOrders";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { POStatCards } from "@/components/modules/purchase-orders/POStatCards";
import { POTable } from "@/components/modules/purchase-orders/POTable";
import { CancelPODialog } from "@/components/modules/purchase-orders/CancelPODialog";
import { ROUTES } from "@/constants/routes";
import { usePOStore } from "@/store/poStore";
import { cn } from "@/lib/utils";

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
  const setSelectedPO = usePOStore((state) => state.setSelectedPO);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(mockPurchaseOrders);
  const [filter, setFilter] = useState<POFilter>("ALL");
  const [page, setPage] = useState(1);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        activePOs={8}
        totalPieces={42500}
        inProduction={5}
        readyToShip={2}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
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

      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <POTable
            orders={pageItems}
            onRowClick={(order) =>
              router.push(ROUTES.PURCHASE_ORDERS.DETAIL(order.id))
            }
            onEdit={(order) =>
              router.push(`${ROUTES.PURCHASE_ORDERS.DETAIL(order.id)}?edit=1`)
            }
            onCancel={(order) => {
              setSelectedPO(order.id);
              setCancelTarget(order);
              setCancelOpen(true);
            }}
            onAdd={() => router.push(ROUTES.PURCHASE_ORDERS.NEW)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="Purchase Orders"
          />
        </>
      )}

      <CancelPODialog
        open={cancelOpen}
        poNumber={cancelTarget?.poNumber}
        onClose={() => {
          setCancelOpen(false);
          setCancelTarget(null);
        }}
        onConfirm={() => {
          if (!cancelTarget) return;
          setOrders((prev) =>
            prev.map((order) =>
              order.id === cancelTarget.id
                ? { ...order, status: "CANCELLED" as const }
                : order
            )
          );
          toast.success(`${cancelTarget.poNumber} cancelled`);
        }}
      />
    </div>
  );
}
