"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  mockWastageEntries,
  type MockWastageEntry,
} from "@/mock/inventory";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import { RecordWastageDrawer } from "@/components/modules/inventory/RecordWastageDrawer";
import { WastageStatCards } from "@/components/modules/inventory/WastageStatCards";
import { WastageTable } from "@/components/modules/inventory/WastageTable";

const PAGE_SIZE = 10;

export default function CuttingWastagePage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MockWastageEntry[]>(mockWastageEntries);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const addedInStock = entries
      .filter((entry) => !mockWastageEntries.some((base) => base.id === entry.id))
      .filter((entry) => entry.status === "IN_STOCK")
      .reduce((sum, entry) => sum + entry.wastageQty, 0);

    return {
      totalInStockKg: 172 + addedInStock,
      totalSoldKg: 840,
      totalValue: 24360 + addedInStock * 45,
    };
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageItems = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Cutting Wastage"
        subtitle="Fabric leftover from cutting. Tracked separately because wastage is sold and its value must be recorded."
        actionButton={
          <PageHeaderAction
            label="Record Wastage Return"
            icon={<Plus className="size-4" />}
            onClick={() => setDrawerOpen(true)}
          />
        }
      />

      <WastageStatCards
        totalInStockKg={stats.totalInStockKg}
        totalSoldKg={stats.totalSoldKg}
        totalValue={stats.totalValue}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Wastage Logs</h2>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={6} />
            </div>
          ) : (
            <WastageTable
              entries={pageItems}
              onAdd={() => setDrawerOpen(true)}
            />
          )}
        </div>

        {!loading ? (
          <div className="border-t border-slate-100 px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={entries.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="entries"
            />
          </div>
        ) : null}
      </div>

      <RecordWastageDrawer
        open={drawerOpen}
        existing={entries}
        onClose={() => setDrawerOpen(false)}
        onSave={(entry) => {
          setEntries((prev) => [entry, ...prev]);
          setPage(1);
        }}
      />
    </div>
  );
}
