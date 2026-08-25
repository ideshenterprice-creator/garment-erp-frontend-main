"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import type { Stock } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { AdjustStockDrawer } from "@/components/modules/inventory/AdjustStockDrawer";
import {
  StockFilterBar,
  type StockFilterTab,
} from "@/components/modules/inventory/StockFilterBar";
import { StockTable } from "@/components/modules/inventory/StockTable";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { StockSortOption } from "@/lib/inventory";
import { getStock } from "@/services/inventory.service";

const PAGE_SIZE = 10;

function sortStockItems(items: Stock[], sortBy: StockSortOption): Stock[] {
  const next = [...items];
  next.sort((a, b) => {
    if (sortBy === "name") {
      return a.product.name.localeCompare(b.product.name);
    }
    if (sortBy === "quantityDesc") {
      return Number(b.quantity) - Number(a.quantity);
    }
    if (sortBy === "quantityAsc") {
      return Number(a.quantity) - Number(b.quantity);
    }
    const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return bTime - aTime;
  });
  return next;
}

export default function InventoryStockPage() {
  const [filter, setFilter] = useState<StockFilterTab>("ALL");
  const [sortBy, setSortBy] = useState<StockSortOption>("lastUpdated");
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<Stock | null>(null);

  const filters = {
    category: filter === "ALL" ? undefined : filter,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.STOCK, filters],
    queryFn: () => getStock(filters),
  });

  const zeroCountQuery = useQuery({
    queryKey: [
      ...QUERY_KEYS.STOCK,
      "zero-count",
      { category: filters.category, limit: 100 },
    ],
    queryFn: () =>
      getStock({
        category: filters.category,
        limit: 100,
      }),
  });

  const items = useMemo(
    () => sortStockItems(data?.data.data ?? [], sortBy),
    [data?.data.data, sortBy]
  );
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const zeroStockCount = (zeroCountQuery.data?.data.data ?? []).filter(
    (item) =>
      item.stockStatus === "OUT_OF_STOCK" || Number(item.quantity) === 0
  ).length;

  return (
    <div>
      <PageHeader
        title="Inventory — Stock"
        subtitle="Live stock of all fabric, accessories and finished goods. Updates automatically on every purchase, issue and production entry."
      />

      {zeroStockCount > 0 ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">{zeroStockCount}</span>{" "}
            {zeroStockCount === 1 ? "item has" : "items have"} zero stock
          </p>
        </div>
      ) : null}

      <StockFilterBar
        filter={filter}
        sortBy={sortBy}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
        onSortChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            Could not load stock
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <StockTable items={items} onAdjust={setAdjustTarget} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="products"
          />
        </>
      )}

      <AdjustStockDrawer
        open={Boolean(adjustTarget)}
        item={adjustTarget}
        onClose={() => setAdjustTarget(null)}
      />
    </div>
  );
}
