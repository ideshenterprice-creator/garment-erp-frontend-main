"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { ContainerFilters } from "@/types";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { ContainerFilterBar } from "@/components/modules/boxing/ContainerFilterBar";
import { ContainersTable } from "@/components/modules/boxing/ContainersTable";
import { NewContainerDrawer } from "@/components/modules/boxing/NewContainerDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getContainers } from "@/services/boxing.service";
import { getPurchaseOrders } from "@/services/purchaseOrders.service";

const PAGE_SIZE = 10;

const defaultFilters: ContainerFilters = {
  poId: "ALL",
  status: "ALL",
};

export default function ContainersPage() {
  const [draftFilters, setDraftFilters] =
    useState<ContainerFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ContainerFilters>(defaultFilters);
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
      page,
      limit: PAGE_SIZE,
      pendingOnly: appliedFilters.status === "PENDING",
    };
  }, [appliedFilters, page]);

  const containersQuery = useQuery({
    queryKey: [...QUERY_KEYS.CONTAINERS, queryFilters],
    queryFn: async () => {
      if (queryFilters.pendingOnly) {
        return {
          success: true as const,
          message: "No pending containers",
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
      return getContainers(params);
    },
  });

  const posQuery = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_ORDERS, { limit: 100 }],
    queryFn: () => getPurchaseOrders({ limit: 100 }),
  });

  const containers = containersQuery.data?.data.data ?? [];
  const total = containersQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Containers"
        subtitle="Load packed boxes into containers and track dispatch status."
        actionButton={
          <PageHeaderAction
            label="+ New Container"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <ContainerFilterBar
        filters={draftFilters}
        purchaseOrders={posQuery.data?.data.data ?? []}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
      />

      {containersQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : containersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load containers.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void containersQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <ContainersTable
            containers={containers}
            onAdd={() => setDrawerOpen(true)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="containers"
          />
        </>
      )}

      <NewContainerDrawer
        open={drawerOpen}
        purchaseOrders={posQuery.data?.data.data ?? []}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
