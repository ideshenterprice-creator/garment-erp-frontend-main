"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  mockStockItems,
  type MockStockItem,
  type StockSortOption,
} from "@/mock/inventory";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { AdjustStockDrawer } from "@/components/modules/inventory/AdjustStockDrawer";
import {
  StockFilterBar,
  type StockFilterTab,
} from "@/components/modules/inventory/StockFilterBar";
import { StockTable } from "@/components/modules/inventory/StockTable";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export default function InventoryStockPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MockStockItem[]>(mockStockItems);
  const [filter, setFilter] = useState<StockFilterTab>("ALL");
  const [sortBy, setSortBy] = useState<StockSortOption>("lastUpdated");
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<MockStockItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const next =
      filter === "ALL"
        ? [...items]
        : items.filter((item) => item.product.category === filter);

    next.sort((a, b) => {
      if (sortBy === "name") {
        return a.product.name.localeCompare(b.product.name);
      }
      if (sortBy === "quantity") {
        return b.quantity - a.quantity;
      }
      const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return bTime - aTime;
    });

    return next;
  }, [filter, items, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Inventory — Stock"
        subtitle="Live stock of all fabric, accessories and finished goods. Updates automatically on every purchase, issue and production entry."
        actionButton={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="border-slate-200">
              <Download className="size-4" />
              Export PDF
            </Button>
            <PageHeaderAction
              label="+ Add Entry"
              icon={<Plus className="size-4" />}
              onClick={() =>
                toast.message("Add Entry", {
                  description: "Stock entry form will connect to the inventory API.",
                })
              }
            />
          </div>
        }
      />

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

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          <StockTable
            items={pageItems}
            onViewHistory={(item) =>
              toast.message("Stock history", {
                description: `Movement history for ${item.product.name}.`,
              })
            }
            onAdjust={setAdjustTarget}
            onAdd={() =>
              toast.message("Add Entry", {
                description: "Stock entry form will connect to the inventory API.",
              })
            }
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
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
        onSave={(itemId, nextQuantity) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: nextQuantity,
                    lastUpdated: new Date().toISOString(),
                    lastUpdatedLabel: "Just now",
                    stockStatus:
                      nextQuantity === 0
                        ? "OUT_OF_STOCK"
                        : nextQuantity < 100
                          ? "LOW"
                          : "AVAILABLE",
                  }
                : item
            )
          );
        }}
      />
    </div>
  );
}
