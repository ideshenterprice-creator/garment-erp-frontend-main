"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { POStatusBadge } from "@/components/modules/purchase-orders/POStatusBadge";
import { PODetailCard } from "@/components/modules/purchase-orders/PODetailCard";
import { POItemsTable } from "@/components/modules/purchase-orders/POItemsTable";
import {
  calcStagesProgressPercent,
  POProductionProgress,
  stagesFromProductionProgress,
} from "@/components/modules/purchase-orders/POProductionProgress";
import { POFabricLots } from "@/components/modules/purchase-orders/POFabricLots";
import { POQuickActions } from "@/components/modules/purchase-orders/POQuickActions";
import { CancelPODialog } from "@/components/modules/purchase-orders/CancelPODialog";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { getDeliveryDateClassName } from "@/lib/purchaseOrders";
import { cn } from "@/lib/utils";
import {
  cancelPurchaseOrder,
  getPOFabricLots,
  getPOProductionStatus,
  getPurchaseOrderById,
} from "@/services/purchaseOrders.service";

interface PODetailPageProps {
  poId: string;
}

export function PODetailPage({ poId }: PODetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
    queryFn: () => getPurchaseOrderById(poId),
    enabled: Boolean(poId),
  });

  const order = data?.data;

  const productionQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId, "production-status"],
    queryFn: () => getPOProductionStatus(poId),
    enabled: Boolean(poId) && Boolean(order) && !order?.productionProgress,
  });

  const fabricLotsQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId, "fabric-lots"],
    queryFn: () => getPOFabricLots(poId),
    enabled: Boolean(poId) && Boolean(order) && !order?.fabricLots,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelPurchaseOrder(id, reason),
    onSuccess: () => {
      toast.success("Purchase order cancelled.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, poId],
      });
      setCancelOpen(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Failed to cancel PO."));
    },
  });

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  const status =
    error instanceof AxiosError ? error.response?.status : undefined;

  if (isError && status === 404) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="This purchase order may have been removed or the link is invalid."
        actionLabel="Back to list"
        onAction={() => router.push(ROUTES.PURCHASE_ORDERS.ROOT)}
      />
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">
          Could not load purchase order
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const productionProgress =
    order.productionProgress ?? productionQuery.data?.data.stages;
  const stages = stagesFromProductionProgress(productionProgress);
  const progressPercent = calcStagesProgressPercent(stages);

  const fabricLots =
    order.fabricLots ?? fabricLotsQuery.data?.data.lots ?? [];
  const fabricNeeded =
    fabricLotsQuery.data?.data.totalFabricRequired ?? order.totalPieces;
  const fabricReceived = fabricLotsQuery.data?.data.totalFabricReceived;

  const canCancel =
    order.status === "ACTIVE" || order.status === "IN_PRODUCTION";
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 md:text-[28px]">
              {order.poNumber}
            </h1>
            <POStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link
              href={`/masters/party/${order.buyerId}`}
              className="font-medium text-[#1b3a3a] hover:underline"
            >
              {order.buyer.name}
            </Link>
            {order.buyer.country ? `, ${order.buyer.country}` : ""} • Ordered{" "}
            {format(new Date(order.orderDate), "dd MMM yyyy")} •{" "}
            <span
              className={cn(
                getDeliveryDateClassName(order.deliveryDate, order.status)
              )}
            >
              Deliver by {format(new Date(order.deliveryDate), "dd MMM yyyy")}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setCancelOpen(true)}
              disabled={cancelMutation.isPending}
            >
              <Ban className="size-4" />
              Cancel PO
            </Button>
          ) : null}
        </div>
      </div>

      <PODetailCard order={order} />
      <POItemsTable items={order.items ?? []} />

      {productionQuery.isLoading && !order.productionProgress ? (
        <TableSkeleton rows={4} />
      ) : (
        <POProductionProgress
          stages={stages}
          progressPercent={progressPercent}
        />
      )}

      {fabricLotsQuery.isLoading && !order.fabricLots ? (
        <TableSkeleton rows={3} />
      ) : (
        <POFabricLots
          lots={fabricLots}
          fabricNeededKg={Number(fabricNeeded)}
          totalFabricReceived={
            fabricReceived !== undefined ? Number(fabricReceived) : undefined
          }
          poId={order.id}
        />
      )}

      {!isCancelled ? <POQuickActions poId={order.id} /> : null}

      <CancelPODialog
        open={cancelOpen}
        poNumber={order.poNumber}
        isPending={cancelMutation.isPending}
        onClose={() => {
          if (!cancelMutation.isPending) setCancelOpen(false);
        }}
        onConfirm={(reason) => {
          cancelMutation.mutate({ id: order.id, reason });
        }}
      />
    </div>
  );
}
