"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { BoxFilters } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  BoxFilterBar,
} from "@/components/modules/boxing/BoxFilterBar";
import { BoxPackingTable } from "@/components/modules/boxing/BoxPackingTable";
import { BoxStatCards } from "@/components/modules/boxing/BoxStatCards";
import { NewBoxDrawer } from "@/components/modules/boxing/NewBoxDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getBoxes } from "@/services/boxing.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

const PAGE_SIZE = 10;

const defaultFilters: BoxFilters = {
  poId: "ALL",
  status: "ALL",
  from: "",
  to: "",
};

export default function BoxPackingPage() {
  const [draftFilters, setDraftFilters] =
    useState<BoxFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<BoxFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryFilters = useMemo(() => {
    const status =
      appliedFilters.status === "ALL" || appliedFilters.status === "PENDING"
        ? undefined
        : appliedFilters.status;
    return {
      poId:
        appliedFilters.poId === "ALL" ? undefined : appliedFilters.poId,
      status,
      from: appliedFilters.from || undefined,
      to: appliedFilters.to || undefined,
      page,
      limit: PAGE_SIZE,
      pendingOnly: appliedFilters.status === "PENDING",
    };
  }, [appliedFilters, page]);

  const boxesQuery = useQuery({
    queryKey: [...QUERY_KEYS.BOXES, queryFilters],
    queryFn: async () => {
      if (queryFilters.pendingOnly) {
        return {
          success: true as const,
          message: "No pending boxes",
          data: {
            data: [],
            total: 0,
            page: 1,
            limit: PAGE_SIZE,
          },
        };
      }
      const { pendingOnly, ...params } = queryFilters;
      void pendingOnly;
      return getBoxes(params);
    },
  });

  const filterPosQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
  });

  const drawerPosQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.PURCHASE_ORDERS,
      {
        statuses: ["IN_PRODUCTION", "READY_TO_SHIP", "COMPLETED"],
        limit: 100,
      },
    ],
    queryFn: async () => {
      const [inProduction, readyToShip, completed] = await Promise.all([
        getPurchaseOrders({ status: "IN_PRODUCTION", limit: 100 }),
        getPurchaseOrders({ status: "READY_TO_SHIP", limit: 100 }),
        getPurchaseOrders({ status: "COMPLETED", limit: 100 }),
      ]);
      const merged = [
        ...(inProduction.data.data ?? []),
        ...(readyToShip.data.data ?? []),
        ...(completed.data.data ?? []),
      ];
      const byId = new Map(merged.map((po) => [po.id, po]));
      return Array.from(byId.values());
    },
    enabled: drawerOpen,
  });

  const boxes = boxesQuery.data?.data.data ?? [];
  const total = boxesQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = boxesQuery.data?.data.summary;

  const boxesPackedThisMonth =
    summary?.boxesPackedThisMonth ?? total;
  const totalPiecesPacked =
    summary?.totalPiecesPacked ??
    boxes.reduce((sum, box) => sum + Number(box.totalPieces ?? 0), 0);
  const boxesLoadedInContainer =
    summary?.boxesLoadedInContainer ??
    boxes.filter((box) => box.status === "LOADED").length;

  return (
    <div>
      <PageHeader
        title="Box Packing"
        subtitle="Finished garments packed into numbered boxes ready for container loading."
        actionButton={
          <PageHeaderAction
            label="+ New Box Entry"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <BoxStatCards
        boxesPackedThisMonth={boxesPackedThisMonth}
        totalPiecesPacked={totalPiecesPacked}
        boxesLoadedInContainer={boxesLoadedInContainer}
      />

      <BoxFilterBar
        filters={draftFilters}
        purchaseOrders={filterPosQuery.data?.data.data ?? []}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
      />

      {boxesQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : boxesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load boxes.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void boxesQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <BoxPackingTable
            boxes={boxes}
            onAdd={() => setDrawerOpen(true)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="boxes"
          />
        </>
      )}

      <NewBoxDrawer
        open={drawerOpen}
        purchaseOrders={drawerPosQuery.data ?? []}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
